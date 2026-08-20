import { CheckCircle2 } from "lucide-react";

export default function SuccessResult({ reason, description, onConfirm }) {
  const successReason = reason || description || "제출한 사진이 검증 기준에 맞게 확인되었습니다.";

  return (
    <div className="photo-success">
      <span className="photo-success__icon"><CheckCircle2 size={34} /></span>
      <span className="photo-success__eyebrow">VERIFICATION PASSED</span>
      <h2>검증을 통과했어요</h2>
      <div className="photo-result-message photo-result-message--success">
        <strong>검증 성공 사유</strong>
        <p>{successReason}</p>
      </div>
      <button className="primary-button" onClick={onConfirm}>확인하고 태스크로 돌아가기</button>
    </div>
  );
}
