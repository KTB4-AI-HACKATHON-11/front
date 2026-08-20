// 공통 API 클라이언트: 백엔드 ApiResponse<T> 래퍼를 해석하고 에러를 표준화합니다.
// 백엔드 응답 형태 (GlobalExceptionHandler / ApiResponse 기준)
//   성공: { code: string, message: string, data: T }
//   실패: { code: string, message: string, data: null } (HTTP 4xx/5xx)

// export const API_BASE_URL = "http://localhost:8080/api/v1";
const API_BASE_URL = "https://api.checkon.cloud/api/v1";
const responseCache = new Map();
const inFlightRequests = new Map();
let cacheVersion = 0;

export class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, headers, timeoutMs, ...rest } = options;
  // multipart/form-data 요청(예: 파일 업로드)은 FormData를 그대로 보내야 합니다.
  // JSON.stringify로 감싸거나 Content-Type을 직접 지정하면 boundary가 깨져 서버가 파싱하지 못하므로,
  // FormData인 경우 Content-Type 헤더를 생략해 브라우저가 boundary를 포함해 자동 설정하도록 둡니다.
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  // timeoutMs를 넘긴 호출부만 AbortController로 시간을 제한합니다. 기본값은 없음(무제한)이라
  // timeoutMs를 넘기지 않는 기존 호출부의 동작에는 영향이 없습니다.
  const controller = timeoutMs ? new AbortController() : null;
  const timeoutId = controller ? window.setTimeout(() => controller.abort(), timeoutMs) : null;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      signal: controller?.signal,
      ...rest,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      // 요청 시간이 timeoutMs를 넘겨 클라이언트가 스스로 중단한 경우 (서버 다운/CORS 차단과 구분)
      throw new ApiError("TIMEOUT", "응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.", 0);
    }
    // fetch 자체가 실패하는 경우 (네트워크 단절, CORS 차단, 서버 다운 등)
    throw new ApiError("NETWORK_ERROR", "서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.", 0);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // 204 No Content 등 응답 본문이 없는 경우
    payload = null;
  }

  if (!response.ok) {
    const code = payload?.code ?? "UNKNOWN_ERROR";
    const message = payload?.message ?? "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.";
    throw new ApiError(code, message, response.status);
  }

  return payload?.data ?? null;
}

export function cachedApiRequest(path, ttlMs = 20_000) {
  const now = Date.now();
  const cached = responseCache.get(path);
  if (cached && cached.expiresAt > now) {
    return Promise.resolve(cached.data);
  }

  const inFlight = inFlightRequests.get(path);
  if (inFlight) return inFlight;

  const requestCacheVersion = cacheVersion;
  const request = apiRequest(path)
    .then((data) => {
      if (requestCacheVersion === cacheVersion) {
        responseCache.set(path, { data, expiresAt: Date.now() + ttlMs });
      }
      return data;
    })
    .finally(() => {
      inFlightRequests.delete(path);
    });
  inFlightRequests.set(path, request);
  return request;
}

export function clearApiCache() {
  cacheVersion += 1;
  responseCache.clear();
  inFlightRequests.clear();
}
