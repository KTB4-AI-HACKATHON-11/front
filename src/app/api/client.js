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

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
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
