// 공통 API 클라이언트: 백엔드 ApiResponse<T> 래퍼를 해석하고 에러를 표준화합니다.
// 백엔드 응답 형태 (GlobalExceptionHandler / ApiResponse 기준)
//   성공: { code: string, message: string, data: T }
//   실패: { code: string, message: string, data: null } (HTTP 4xx/5xx)

// export const API_BASE_URL = "http://localhost:8080/api/v1";
const API_BASE_URL = "https://api.checkon.cloud/api/v1";

export class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, headers, ...rest } = options;
  // multipart/form-data 요청(예: 파일 업로드)은 FormData를 그대로 보내야 합니다.
  // JSON.stringify로 감싸거나 Content-Type을 직접 지정하면 boundary가 깨져 서버가 파싱하지 못하므로,
  // FormData인 경우 Content-Type 헤더를 생략해 브라우저가 boundary를 포함해 자동 설정하도록 둡니다.
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      ...rest,
    });
  } catch {
    // fetch 자체가 실패하는 경우 (네트워크 단절, CORS 차단, 서버 다운 등)
    throw new ApiError("NETWORK_ERROR", "서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.", 0);
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
