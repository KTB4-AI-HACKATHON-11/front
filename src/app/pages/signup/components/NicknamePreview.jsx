import { UserRound } from "lucide-react";

export default function NicknamePreview() {
  return (
    <div className="nickname-preview">
      <span><UserRound size={20} /></span>
      <div>
        <small>PROFILE</small>
        <strong>팀에서 알아보기 쉬운 이름을 사용하세요</strong>
      </div>
    </div>
  );
}
