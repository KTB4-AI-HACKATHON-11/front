import { Camera, CheckCircle2, ShieldCheck } from "lucide-react";
import ProgressiveImage from "../../../components/ProgressiveImage";

export default function VerificationCard({ subTask, onPhotoOpen }) {
  return (
    <aside className="task-verification page-card">
      <div className="task-verification__heading">
        <span><ShieldCheck size={17} /></span>
        <div><small>VERIFICATION</small><h2>완료 검증</h2></div>
      </div>
      <div className="task-verification__method">
        <span>{subTask?.photo ? <Camera size={16} /> : <CheckCircle2 size={16} />}</span>
        <div><small>완료 방식</small><strong>{subTask?.photo ? "사진 검증" : "체크 완료"}</strong></div>
      </div>
      {subTask ? (
        <>
          <div className="task-verification__criteria">
            <span>{subTask.photo ? "검증 기준" : "상세 내용"}</span>
            <p>{subTask.rule || subTask.instruction || "등록된 상세 내용이 없습니다."}</p>
          </div>
          {subTask.photo && subTask.referencePhotoUrl && (
            <div className="task-verification__reference">
              <span>예시 사진</span>
              <ProgressiveImage src={subTask.referencePhotoUrl} alt="검증 예시 사진" />
            </div>
          )}
          <div className="task-verification__checklist">
            <p><CheckCircle2 size={13} /> {subTask.title}</p>
          </div>
          {subTask.photo && !subTask.completed && (
            <button className="primary-button" onClick={onPhotoOpen}><Camera size={15} /> 사진 찍어 검증하기</button>
          )}
          {subTask.photo && <small className="task-verification__help">사진은 검증 목적으로만 사용됩니다.</small>}
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
