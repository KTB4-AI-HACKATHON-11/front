// 태스크 관련 API
import { apiRequest } from "./client";

/**
 * AI 체크리스트 생성
 * POST /api/v1/groups/{groupId}/tasks/generate
 * MANAGER의 자연어 요구사항을 AI 서버로 보내 PHOTO 또는 CHECK 체크리스트로 변환합니다.
 * 이 API는 결과를 저장하지 않고 프런트엔드에만 반환합니다(별도의 태스크 저장 API가 아직 없음).
 * @param {{ groupId: string|number, managerId: number, title: string, message: string }} params
 * @returns {Promise<{
 *   title: string, message: string, assigneeName?: string, dueAt?: string,
 *   checklists: Array<{ sequence: number, title: string, instruction: string, completionType: "PHOTO"|"CHECK", rule: string }>
 * }>}
 */
export function generateTaskChecklist({ groupId, managerId, title, message }) {
  return apiRequest(`/groups/${groupId}/tasks/generate`, {
    method: "POST",
    body: { managerId, title, message },
  });
}

/**
 * SUB_TASK 수행 여부 변경
 * (예상) PATCH /api/v1/tasks/{taskId}/sub-tasks/{subTaskId}
 * @param {{ taskId: string, subTaskId: string, completed: boolean }} params
 * @returns {Promise<{ subTaskId: string, completed: boolean }>}
 * TODO: 백엔드 엔드포인트가 확정되면 아래 mock 구현을 apiRequest 호출로 교체하세요.
 *   return apiRequest(`/tasks/${taskId}/sub-tasks/${subTaskId}`, { method: "PATCH", body: { completed } });
 */
export async function updateSubTaskStatus({ taskId, subTaskId, completed }) {
  console.log("[taskApi] updateSubTaskStatus 호출 예정 payload", { taskId, subTaskId, completed });
  return { subTaskId, completed }; // 임시 mock 값
}
