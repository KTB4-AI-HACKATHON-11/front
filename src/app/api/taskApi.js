// 태스크 관련 API
// TODO: 백엔드에 태스크 관련 엔드포인트가 준비되면 아래 mock 구현들을 apiRequest 호출로 교체하세요.
// import { apiRequest } from "./client";

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
