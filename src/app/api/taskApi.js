// 태스크 관련 API
import { apiRequest } from "./client";

/**
 * AI 체크리스트 생성
 * POST /api/v1/groups/{groupId}/tasks/generate
 * MANAGER의 자연어 요구사항을 AI 서버로 보내 PHOTO 또는 CHECK 체크리스트로 변환합니다.
 * 이 API는 미리보기만 반환하며 저장하지 않습니다. 실제 저장은 createTask(태스크 최종 등록)로 이어서 호출하세요.
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
 * 태스크 최종 등록
 * POST /api/v1/groups/{groupId}/tasks (multipart/form-data)
 * managerId가 그룹의 MANAGER인지, workerId가 그룹의 WORKER인지, dueAt이 미래 시각인지를 백엔드가 검증한 뒤
 * TaskTemplate/TaskItemTemplate/TaskSchedule/TaskAssignment로 저장하고, PHOTO 기준 사진은 파일 저장소에 저장해
 * 체크리스트와 연결합니다. "request" 파트에 JSON 본문을, "referencePhotos" 파트에 기준 사진 파일들을 담아
 * 함께 전송합니다. DB 저장 중 오류가 나면 저장된 기준 사진도 롤백 시 삭제됩니다.
 *
 * checklists 규칙(백엔드 검증):
 *   - 최대 20개
 *   - sequence는 1부터 순서대로 부여
 *   - completionType이 PHOTO면 rule과 기준 사진(referencePhotoIndex)이 반드시 있어야 함
 *   - completionType이 CHECK면 rule과 기준 사진을 사용할 수 없음(rule/referencePhotoIndex는 null)
 * checklists[].referencePhotoIndex는 referencePhotos 배열에서 해당 항목의 기준 사진이 위치한 인덱스입니다.
 * @param {{
 *   groupId: string|number,
 *   managerId: number,
 *   title: string,
 *   message: string,
 *   workerId: number,
 *   dueAt: string,
 *   checklists: Array<{
 *     sequence: number, title: string, instruction: string,
 *     completionType: "PHOTO"|"CHECK", rule: string|null, referencePhotoIndex: number|null
 *   }>,
 *   referencePhotos: File[]
 * }} params
 * @returns {Promise<unknown>} 생성된 업무와 체크리스트 정보(data)를 그대로 반환합니다. 응답 필드가 아직
 *   호출부에 문서화되지 않아, taskId 등 특정 필드가 있다고 가정하지 말고 방어적으로 사용해야 합니다.
 */
export function createTask({ groupId, managerId, title, message, workerId, dueAt, checklists, referencePhotos }) {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob(
      [JSON.stringify({ managerId, title, message, workerId, dueAt, checklists })],
      { type: "application/json" }
    )
  );
  referencePhotos.forEach((file) => {
    formData.append("referencePhotos", file, file.name);
  });

  return apiRequest(`/groups/${groupId}/tasks`, {
    method: "POST",
    body: formData,
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
