// AI 매장 Q&A 관련 API
import { apiRequest } from "./client";

// AI 백엔드는 동기 호출에 최대 60초까지 걸릴 수 있다고 명시하고 있어, 응답이 없을 때 화면이
// 무한정 로딩 상태로 남지 않도록 여유를 두고 클라이언트 타임아웃을 겁니다.
const ASK_TIMEOUT_MS = 65_000;

/**
 * DB 매장 정보 기반 AI 질문
 * POST /api/v1/knowledge/answer
 * groupId의 매장 정보와 현재 conversationId의 대화 이력을 기반으로 답변합니다.
 * @param {{ groupId: string|number, requesterId: number, conversationId: string, question: string }} params
 * @returns {Promise<{ conversationId: string, answer: string }>}
 */
export function askStoreQuestion({ groupId, requesterId, conversationId, question }) {
  return apiRequest("/knowledge/answer", {
    method: "POST",
    body: { groupId, requesterId, conversationId, question },
    timeoutMs: ASK_TIMEOUT_MS,
  });
}
