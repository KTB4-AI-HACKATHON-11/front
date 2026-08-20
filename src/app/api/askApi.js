// AI 매장 Q&A 관련 API
import { apiRequest } from "./client";

// AI 백엔드는 동기 호출에 최대 60초까지 걸릴 수 있다고 명시하고 있어, 응답이 없을 때 화면이
// 무한정 로딩 상태로 남지 않도록 여유를 두고 클라이언트 타임아웃을 겁니다.
const ASK_TIMEOUT_MS = 65_000;

/**
 * 매장 정보 기반 AI 질문
 * POST /api/v1/knowledge/answer
 * @param {{ conversationId: string|number|null, question: string }} params
 * @returns {Promise<{ conversationId: string|number, answer: string }>}
 */
export function askStoreQuestion({ conversationId, question }) {
  return apiRequest("/knowledge/answer", {
    method: "POST",
    body: { conversationId, question },
    timeoutMs: ASK_TIMEOUT_MS,
  });
}
