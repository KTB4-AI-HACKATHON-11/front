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
