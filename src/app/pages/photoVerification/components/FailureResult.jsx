import { AlertTriangle, RotateCcw, UserCheck } from "lucide-react";

export default function FailureResult({
  reason,
  attemptCount,
  canRequestReview,
  onRetake,
  onRequestReview,
  status,
  fix,
}) {
  return (
    <div className="photo-failure">
      <span className="photo-failure__icon"><AlertTriangle size={34} /></span>
      <span className="photo-failure__eyebrow">{status === "DELAYED" ? "VERIFICATION DELAYED" : "VERIFICATION FAILED"}</span>
      <h2>{status === "DELAYED" ? "검증이 지연되고 있어요" : "검증에 탈락했어요"}</h2>
      <p>{[reason, fix].filter(Boolean).join(" ") || "제출한 사진이 검증 기준과 일치하지 않았어요."}</p>
      <div className="photo-failure__actions">
        <button className="primary-button" type="button" onClick={onRetake}>
          <RotateCcw size={15} /> 다시 촬영하기
        </button>
        {canRequestReview && (
          <button className="secondary-button" type="button" onClick={onRequestReview}>
            <UserCheck size={15} /> 매니저에게 확인 요청하기
          </button>
        )}
      </div>
      {attemptCount > 1 && (
        <small className="photo-failure__hint">
          지금까지 {attemptCount}번 검증에 실패했어요.
          {canRequestReview ? " 매니저에게 확인을 요청할 수 있어요." : ""}
        </small>
      )}
    </div>
  );
}
