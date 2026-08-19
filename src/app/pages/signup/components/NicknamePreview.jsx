import { UserRound } from "lucide-react";

export default function NicknamePreview() {
  return (
    <div className="nickname-preview">
      <span><UserRound size={20} /></span>
      <div>
        <small>PROFILE</small>
        <strong>팀에서 알아보기 쉬운 이름을 사용하세요</strong>
        <p>닉네임과 역할은 가입 후에도 변경할 수 있습니다.</p>
      </div>
    </div>
  );
}
