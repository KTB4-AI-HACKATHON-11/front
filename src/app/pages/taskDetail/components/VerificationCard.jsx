import { Camera, CheckCircle2, ShieldCheck } from "lucide-react";

export default function VerificationCard({ onPhotoOpen }) {
  return (
    <aside className="task-verification page-card">
      <div className="task-verification__heading">
        <span><ShieldCheck size={17} /></span>
        <div><small>VERIFICATION</small><h2>완료 검증</h2></div>
      </div>
      <div className="task-verification__method">
        <span><Camera size={16} /></span>
        <div><small>검증 방식</small><strong>사진 촬영</strong></div>
      </div>
      <div className="task-verification__criteria">
        <span>검증 기준</span>
        <p>매장 전체가 프레임 안에 들어오고, 조명과 메인 진열대가 선명하게 보여야 합니다.</p>
      </div>
      <div className="task-verification__checklist">
        <p><CheckCircle2 size={13} /> 매장 전체 전경 포함</p>
        <p><CheckCircle2 size={13} /> 조명 켜짐 확인</p>
        <p><CheckCircle2 size={13} /> 메인 진열대 식별 가능</p>
      </div>
      <button className="primary-button" onClick={onPhotoOpen}><Camera size={15} /> 사진 찍어 검증하기</button>
      <small className="task-verification__help">사진은 검증 목적으로만 사용됩니다.</small>
    </aside>
  );
}
