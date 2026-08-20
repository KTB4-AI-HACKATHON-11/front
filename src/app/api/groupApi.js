// 그룹 관련 API
import { apiRequest } from "./client";

/**
 * 그룹 생성
 * POST /api/v1/groups
 * @param {{ managerId: number, name: string, description: string }} params
 * @returns {Promise<{ groupId: number, name: string, description: string }>}
 */
export function createGroup({ managerId, name, description }) {
  return apiRequest("/groups", {
    method: "POST",
    body: { managerId, name, description },
  });
}

/**
 * 그룹 참여
 * POST /api/v1/groups/join
 * @param {{ memberId: number, groupId: number }} params
 * @returns {Promise<{ groupId: number, name: string, description: string }>}
 * 실패 응답: 404 (존재하지 않는 그룹 ID), 409 (이미 가입한 그룹) → ApiError로 던져짐
 */
export function joinGroup({ memberId, groupId }) {
  return apiRequest("/groups/join", {
    method: "POST",
    body: { memberId, groupId },
  });
}

/**
 * 내 그룹 목록 조회
 * GET /api/v1/members/{memberId}/groups
 * 회원이 가입한 그룹을 offset과 limit 기준으로 잘라 조회합니다.
 * @param {{ memberId: number, offset?: number, limit?: number }} params
 * @returns {Promise<Array<{ groupId: number, name: string, description: string }>>}
 */
export function getMyGroups({ memberId, offset = 0, limit = 20 }) {
  return apiRequest(`/members/${memberId}/groups?offset=${offset}&limit=${limit}`);
}
