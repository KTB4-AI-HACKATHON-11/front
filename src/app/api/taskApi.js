// 태스크 관련 API
import { apiMutation, apiRequest, cachedApiRequest, CACHE_TTL_MS } from "./client";
import { optimizePhotoUpload } from "../lib/photoOptimization";

/**
 * 그룹 태스크 목록 조회
 * GET /api/v1/groups/{groupId}/tasks?requesterId={requesterId}&offset=0&limit=20
 */
export function getGroupTasks({ groupId, requesterId, offset = 0, limit = 20, status }) {
  const params = new URLSearchParams({ requesterId: String(requesterId), offset: String(offset), limit: String(limit) });
  if (status) params.set("status", status);
  return cachedApiRequest(
    `/groups/${groupId}/tasks?${params.toString()}`,
    CACHE_TTL_MS.FAST_CHANGING
  );
}

/**
 * 태스크 상세 조회
 * GET /api/v1/tasks/{taskId}?requesterId={requesterId}
 */
export function getTaskDetail({ taskId, requesterId }) {
  return cachedApiRequest(
    `/tasks/${taskId}?requesterId=${requesterId}`,
    CACHE_TTL_MS.STANDARD
  );
}

export function prefetchTaskDetail({ taskId, requesterId }) {
  return getTaskDetail({ taskId, requesterId }).catch(() => null);
}

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
export async function createTask({ groupId, managerId, title, message, workerId, dueAt, notifyOnCompletion = false, checklists, referencePhotos }) {
  const optimizedReferencePhotos = await Promise.all(referencePhotos.map(optimizePhotoUpload));
  const formData = new FormData();
  formData.append(
    "request",
    new Blob(
      [JSON.stringify({ managerId, title, message, workerId, dueAt, notifyOnCompletion, checklists })],
      { type: "application/json" }
    )
  );
  optimizedReferencePhotos.forEach((file) => {
    formData.append("referencePhotos", file, file.name);
  });

  return apiMutation(`/groups/${groupId}/tasks`, {
    method: "POST",
    body: formData,
  });
}

export function updateTaskCompletionNotification({ taskId, enabled }) {
  return apiMutation(`/tasks/${taskId}/completion-notification`, {
    method: "PATCH",
    body: { enabled },
  });
}

/**
 * CHECK 유형 체크리스트 수행 여부 변경
 * PATCH /api/v1/tasks/{taskId}/sub-tasks/{subTaskId}
 * @param {{ taskId: string|number, subTaskId: string|number, workerId: string|number, performed: boolean }} params
 */
export function updateSubTaskStatus({ taskId, subTaskId, workerId, performed }) {
  return apiMutation(`/tasks/${taskId}/sub-tasks/${subTaskId}`, {
    method: "PATCH",
    body: { workerId, performed },
  });
}

/**
 * PHOTO 체크리스트 인증 사진 제출
 * POST /api/v1/assignments/{assignmentId}/photo-attempts?workerId={workerId}
 */
export async function submitPhotoAttempt({ assignmentId, workerId, photo }) {
  const optimizedPhoto = await optimizePhotoUpload(photo);
  const formData = new FormData();
  formData.append("photo", optimizedPhoto, optimizedPhoto.name);

  return apiMutation(`/assignments/${assignmentId}/photo-attempts?workerId=${encodeURIComponent(workerId)}`, {
    method: "POST",
    body: formData,
  });
}

/**
 * 검증 기준 저장 (담당자, 마감 일시, 체크리스트 완료 방식과 기준 사진을 한 번에 수정)
 * PATCH /api/v1/tasks/{taskId}/verification-settings (multipart/form-data)
 * "request" 파트에 JSON 본문을, "referencePhotos" 파트에 기준 사진 파일들을 담아 함께 전송합니다.
 * 이미 시작된 태스크는 수정할 수 없습니다(409 TASK_ALREADY_STARTED).
 *
 * items 규칙(백엔드 검증):
 *   - 이 태스크의 체크리스트 전체 개수만큼 빠짐없이 보내야 함
 *     (checklistId는 GET /tasks/{taskId} 응답의 checklists[].checklistId를 그대로 사용)
 *   - completionType은 PHOTO | CHECK
 *   - completionType이 PHOTO면 rule 필수, referencePhotoIndex는 선택(기존 기준 사진을 유지하려면 생략)
 *   - completionType이 CHECK면 rule과 referencePhotoIndex는 반드시 null
 *   - referencePhotoIndex는 referencePhotos 배열의 0-based 인덱스이며, 항목끼리 같은 인덱스를 공유할 수 없음
 *     (인덱스만 있고 해당 파일이 없으면 에러)
 *   - dueAt은 현재 시각 이후여야 함
 *
 * @param {{
 *   taskId: string|number,
 *   managerId: number,
 *   workerId: number,
 *   dueAt: string,
 *   items: Array<{
 *     checklistId: number, enabled: boolean, completionType: "PHOTO"|"CHECK",
 *     rule: string|null, referencePhotoIndex: number|null
 *   }>,
 *   referencePhotos?: File[]
 * }} params
 * @returns {Promise<{
 *   taskId: number, workerId: number, dueAt: string,
 *   items: Array<{ checklistId: number, enabled: boolean, completionType: "PHOTO"|"CHECK", rule: string|null, referencePhotoUrl: string|null }>
 * }>}
 * 실패 응답:
 *   400 INVALID_INPUT_VALUE | INVALID_COMPLETION_TYPE | INVALID_DUE_AT | VERIFICATION_RULE_REQUIRED | INVALID_REFERENCE_PHOTO_INDEX
 *   403 VERIFICATION_SETTINGS_UPDATE_FORBIDDEN
 *   404 TASK_NOT_FOUND | CHECKLIST_NOT_FOUND
 *   409 WORKER_NOT_IN_GROUP | TASK_ALREADY_STARTED
 *   업로드 실패 시 PHOTO_TOO_LARGE(파일 크기 초과) | INVALID_PHOTO(형식/검증 실패) — 정확한 HTTP 상태 코드는
 *   명세에 명시되어 있지 않아 호출부에서 status 값을 단정하지 말고 ApiError.message로 방어적으로 처리하세요.
 */
export async function updateVerificationSettings({ taskId, managerId, workerId, dueAt, items, referencePhotos = [] }) {
  const optimizedReferencePhotos = await Promise.all(referencePhotos.map(optimizePhotoUpload));
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify({ managerId, workerId, dueAt, items })], { type: "application/json" })
  );
  optimizedReferencePhotos.forEach((file) => {
    formData.append("referencePhotos", file, file.name);
  });

  return apiMutation(`/tasks/${taskId}/verification-settings`, {
    method: "PATCH",
    body: formData,
  });
}
