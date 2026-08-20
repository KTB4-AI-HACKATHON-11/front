// 매장 정보(Store Info) 관련 API
// TODO: 아래 엔드포인트는 아직 백엔드에 구현되어 있지 않습니다. 실제 경로/응답 형태가 확정되면 이 파일을 갱신해주세요.
import { apiRequest } from "./client";

/**
 * 매장 정보 목록 조회
 * GET /api/v1/groups/{groupId}/store-info?requesterId={requesterId}
 * requesterId로 요청자가 해당 그룹 멤버인지 함께 검증합니다(역할 무관, MANAGER/WORKER 모두 조회 가능).
 * @param {{ groupId: string|number, requesterId: number }} params
 * @returns {Promise<Array<{ storeInfoId: number, category: string, title: string, content: string, updatedAt: string }>>}
 */
export function getStoreInfoList({ groupId, requesterId }) {
  return apiRequest(`/groups/${groupId}/store-info?requesterId=${requesterId}`);
}

/**
 * 매장 정보 등록
 * POST /api/v1/groups/{groupId}/store-info
 * managerId가 그룹의 MANAGER인지 백엔드가 검증해야 합니다.
 * @param {{ groupId: string|number, managerId: number, category: string, title: string, content: string }} params
 * @returns {Promise<{ storeInfoId: number, category: string, title: string, content: string, updatedAt: string }>}
 */
export function createStoreInfo({ groupId, managerId, category, title, content }) {
  return apiRequest(`/groups/${groupId}/store-info`, {
    method: "POST",
    body: { managerId, category, title, content },
  });
}

/**
 * 매장 정보 수정
 * PATCH /api/v1/groups/{groupId}/store-info/{storeInfoId}
 * @param {{ groupId: string|number, storeInfoId: string|number, managerId: number, category: string, title: string, content: string }} params
 * @returns {Promise<{ storeInfoId: number, category: string, title: string, content: string, updatedAt: string }>}
 */
export function updateStoreInfo({ groupId, storeInfoId, managerId, category, title, content }) {
  return apiRequest(`/groups/${groupId}/store-info/${storeInfoId}`, {
    method: "PATCH",
    body: { managerId, category, title, content },
  });
}

/**
 * 매장 정보 삭제
 * DELETE /api/v1/groups/{groupId}/store-info/{storeInfoId}?managerId={managerId}
 * @param {{ groupId: string|number, storeInfoId: string|number, managerId: number }} params
 */
export function deleteStoreInfo({ groupId, storeInfoId, managerId }) {
  return apiRequest(`/groups/${groupId}/store-info/${storeInfoId}?managerId=${managerId}`, {
    method: "DELETE",
  });
}
