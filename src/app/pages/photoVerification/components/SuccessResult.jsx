import { CheckCircle2 } from "lucide-react";

export default function SuccessResult({ onConfirm }) {
  return (
    <div className="photo-success">
      <span className="photo-success__icon"><CheckCircle2 size={34} /></span>
      <span className="photo-success__eyebrow">VERIFICATION PASSED</span>
      <h2>검증에 성공했어요</h2>
      <p>매장 전체 전경과 조명, 메인 진열대가<br />검증 기준에 맞게 확인되었습니다.</p>
      <div className="photo-success__score"><span>AI 검증 일치도</span><strong>96%</strong></div>
      <button className="primary-button" onClick={onConfirm}>확인하고 태스크로 돌아가기</button>
    </div>
  );
}
