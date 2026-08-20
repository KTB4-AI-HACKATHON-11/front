import { Camera, CheckCircle2, ShieldCheck } from "lucide-react";

export default function VerificationCard({ subTask, onPhotoOpen }) {
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
      {subTask ? (
        <>
          <div className="task-verification__criteria">
            <span>검증 기준</span>
            <p>{subTask.rule || "사진 촬영 후 AI가 자동으로 검증합니다."}</p>
          </div>
          <div className="task-verification__checklist">
            <p><CheckCircle2 size={13} /> {subTask.title}</p>
          </div>
          <button className="primary-button" onClick={onPhotoOpen}><Camera size={15} /> 사진 찍어 검증하기</button>
          <small className="task-verification__help">사진은 검증 목적으로만 사용됩니다.</small>
        </>
      ) : (
        <>
          <div className="task-verification__criteria">
            <span>검증 기준</span>
            <p>사진 검증이 필요한 항목이 없습니다.</p>
          </div>
          <button className="primary-button" disabled><Camera size={15} /> 사진 찍어 검증하기</button>
        </>
      )}
    </aside>
  );
}
