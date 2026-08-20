// 회원 관련 API
import { apiRequest } from "./client";

/**
 * 회원가입
 * POST /api/v1/members
 * @param {{ nickname: string, role: "MANAGER" | "WORKER" }} params
 * @returns {Promise<{ memberId: number, nickname: string, role: string }>}
 * 실패:
 *   400 - 요청 형식 오류 (닉네임/역할 누락 또는 형식 불일치)
 *   409 - 이미 사용 중인 닉네임
 */
export function signupMember({ nickname, role }) {
  return apiRequest("/members", {
    method: "POST",
    body: { nickname, role },
  });
}

/**
 * 로그인
 * POST /api/v1/members/login
 * @param {{ nickname: string }} params
 * @returns {Promise<{ memberId: number, nickname: string, role: string }>}
 */
export function loginMember({ nickname }) {
  return apiRequest("/members/login", {
    method: "POST",
    body: { nickname },
  });
}
