import { CheckCircle2 } from "lucide-react";

export default function SuccessResult({ description, onConfirm }) {
  return (
    <div className="photo-success">
      <span className="photo-success__icon"><CheckCircle2 size={34} /></span>
      <span className="photo-success__eyebrow">VERIFICATION PASSED</span>
      <h2>검증을 통과했어요</h2>
      <p>{description || "제출한 사진이 검증 기준에 맞게 확인되었습니다."}</p>
      <button className="primary-button" onClick={onConfirm}>확인하고 태스크로 돌아가기</button>
    </div>
  );
}
