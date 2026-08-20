// AI 매장 Q&A 관련 API
// TODO: 아직 제품 백엔드에 구현되어 있지 않은 엔드포인트입니다. 제품 백엔드가 AI 백엔드(POST /v1/knowledge/answer)를
// 감싸서 제공할 예정이며, 아래 계약은 그 AI 백엔드 명세를 기준으로 작성했습니다.
//   - information(그룹에 등록된 매장 정보를 합친 문자열): 1~60,000자, AI가 이 안의 내용만 근거로 답변
//   - question: 1~200자
//   - answer(응답에 존재하는 유일한 필드): 1~8,000자, grounded 같은 "근거 여부"를 나타내는 별도 필드는 없음
// 실제 제품 백엔드 API 경로/응답이 확정되면 이 파일을 갱신해주세요.
import { apiRequest } from "./client";

// AI 백엔드는 동기 호출에 최대 60초까지 걸릴 수 있다고 명시하고 있어, 응답이 없을 때 화면이
// 무한정 로딩 상태로 남지 않도록 여유를 두고 클라이언트 타임아웃을 겁니다.
const ASK_TIMEOUT_MS = 65_000;

/**
 * 매장 정보 기반 AI 질문
 * POST /api/v1/groups/{groupId}/ask
 * 그룹에 등록된 매장 정보만 근거로 답변을 생성합니다.
 * @param {{ groupId: string|number, requesterId: number, question: string }} params
 * @returns {Promise<{ answer: string }>}
 */
export function askStoreQuestion({ groupId, requesterId, question }) {
  return apiRequest(`/groups/${groupId}/ask`, {
    method: "POST",
    body: { requesterId, question },
    timeoutMs: ASK_TIMEOUT_MS,
  });
}
