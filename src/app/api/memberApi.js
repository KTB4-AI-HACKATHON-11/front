// 회원 관련 API
import { apiMutation, apiRequest, cachedApiRequest, CACHE_TTL_MS, clearApiCache } from "./client";

/**
 * 회원가입
 * POST /api/v1/members
 * @param {{ nickname: string }} params
 * @returns {Promise<{ memberId: number, nickname: string, role: string }>}
 * 실패:
 *   400 - 요청 형식 오류 (닉네임/역할 누락 또는 형식 불일치)
 *   409 - 이미 사용 중인 닉네임
 */
export function signupMember({ nickname }) {
  return apiMutation("/members", {
    method: "POST",
    body: { nickname },
  });
}

/**
 * 로그인
 * POST /api/v1/members/login
 * @param {{ nickname: string }} params
 * @returns {Promise<{ memberId: number, nickname: string, role: string }>}
 */
export function loginMember({ nickname }) {
  return apiMutation("/members/login", {
    method: "POST",
    body: { nickname },
  });
}

export function getCurrentMember() {
  return apiRequest("/members/me");
}

export async function logoutMember() {
  try {
    return await apiRequest("/members/logout", { method: "POST" });
  } finally {
    clearApiCache();
  }
}

/**
 * 그룹 멤버 목록 조회
 * GET /api/v1/groups/{groupId}/members?requesterId={requesterId}
 * requesterId로 요청자가 해당 그룹의 멤버인지 함께 검증합니다.
 * @param {{ groupId: string|number, requesterId: number }} params
 * @returns {Promise<Array<{ memberId: number, nickname: string, role: "MANAGER"|"WORKER" }>>}
 */
export function getGroupMembers({ groupId, requesterId }) {
  return cachedApiRequest(
    `/groups/${groupId}/members?requesterId=${requesterId}`,
    CACHE_TTL_MS.STANDARD
  );
}
