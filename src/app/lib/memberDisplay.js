// 그룹 멤버 목록 API 응답을 화면에서 쓰던 기존 멤버 모양({ id, name, initial, color, role })으로 변환합니다.
// 백엔드 응답에는 아바타 이니셜/색상 정보가 없어 여기서 파생시킵니다.
const AVATAR_COLORS = ["violet", "mint", "blue", "coral", "gold"];

function getMemberInitial(nickname) {
  return nickname?.trim().slice(0, 1) || "?";
}

// memberId를 기준으로 색상을 결정적으로 배정합니다(같은 멤버는 새로고침해도 항상 같은 색을 씁니다).
function getMemberAvatarColor(memberId) {
  const numericId = Number(memberId);
  if (!Number.isFinite(numericId)) {
    return AVATAR_COLORS[0];
  }
  return AVATAR_COLORS[Math.abs(numericId) % AVATAR_COLORS.length];
}

export function toDisplayMembers(members) {
  return (members ?? []).map((member) => ({
    id: member.memberId,
    name: member.nickname,
    role: member.role,
    initial: getMemberInitial(member.nickname),
    color: getMemberAvatarColor(member.memberId),
  }));
}
