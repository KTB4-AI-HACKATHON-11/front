// 로그인한 사용자 정보를 localStorage에 저장/복원합니다.
// App.jsx의 user state는 메모리에만 있어서 새로고침하면 사라지는데,
// 그러면 memberId 같은 값이 없어져서(예: 그룹 생성 시 managerId 누락) 요청이 실패합니다.
// 로그인/회원가입 성공 시 저장해두고, 앱이 처음 켜질 때 여기서 복원합니다.
const STORAGE_KEY = "checkon:user";

export function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // localStorage를 쓸 수 없는 환경(프라이빗 브라우징 등)에서는 조용히 무시합니다.
    return null;
  }
}

export function saveUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // no-op
  }
}

export function clearStoredUser() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
