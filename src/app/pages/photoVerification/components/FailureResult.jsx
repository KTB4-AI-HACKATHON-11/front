import { AlertTriangle, ArrowLeft, RotateCcw, UserCheck } from "lucide-react";

export default function FailureResult({
  reason,
  attemptCount,
  canRequestReview,
  onRetake,
  onBack,
  onRequestReview,
  status,
  fix,
}) {
  const failureReason = reason || "제출한 사진이 검증 기준과 일치하지 않았어요.";

  return (
    <div className="photo-failure">
      <span className="photo-failure__icon"><AlertTriangle size={34} /></span>
      <span className="photo-failure__eyebrow">{status === "DELAYED" ? "VERIFICATION DELAYED" : "VERIFICATION FAILED"}</span>
      <h2>{status === "DELAYED" ? "검증이 지연되고 있어요" : "검증에 탈락했어요"}</h2>
      <div className="photo-result-message photo-result-message--failure">
        <strong>검증 실패 사유</strong>
        <p>{failureReason}</p>
      </div>
      {fix && (
        <div className="photo-result-message photo-result-message--fix">
          <strong>다시 시도할 때 확인해주세요</strong>
          <p>{fix}</p>
        </div>
      )}
      <div className="photo-failure__actions">
        {status === "DELAYED" ? (
          <button className="primary-button" type="button" onClick={onBack}>
            <ArrowLeft size={15} /> 태스크로 돌아가기
          </button>
        ) : (
          <button className="primary-button" type="button" onClick={onRetake}>
            <RotateCcw size={15} /> 다시 촬영하기
          </button>
        )}
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
