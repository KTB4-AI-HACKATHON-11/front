import { Bell, Check, RotateCcw, UserCheck } from "lucide-react";
import ProgressiveImage from "../../../components/ProgressiveImage";

export default function ManagerReviewPanel({
  reviews,
  isLoading,
  errorMessage,
  resolvingId,
  notificationMessage,
  onEnableNotifications,
  onResolve,
}) {
  return (
    <section className="manager-review-panel page-card">
      <div className="manager-review-panel__heading">
        <div>
          <span><UserCheck size={15} /></span>
          <div><h2>매니저 확인 요청</h2><p>AI 검증이 반복 실패한 사진을 직접 판정합니다.</p></div>
        </div>
        <button className="secondary-button" type="button" onClick={onEnableNotifications}>
          <Bell size={14} /> 확인 요청 알림 켜기
        </button>
      </div>
      {notificationMessage ? <p className="manager-review-panel__notice">{notificationMessage}</p> : null}
      {isLoading ? (
        <p className="group-grid__empty">확인 요청을 불러오는 중이에요...</p>
      ) : errorMessage ? (
        <p className="group-grid__empty" role="alert">{errorMessage}</p>
      ) : reviews.length === 0 ? (
        <p className="group-grid__empty">대기 중인 확인 요청이 없습니다.</p>
      ) : (
        <div className="manager-review-list">
          {reviews.map((review) => (
            <article className="manager-review-row" key={review.reviewId}>
              <div className="manager-review-row__photo">
                {review.photoUrl ? (
                  <ProgressiveImage src={review.photoUrl} alt={`${review.checklistTitle} 제출 사진`} />
                ) : (
                  <span>사진 없음</span>
                )}
              </div>
              <div className="manager-review-row__copy">
                <small>{review.taskTitle} · {review.workerNickname}</small>
                <strong>{review.checklistTitle}</strong>
                <p>AI 검증 {review.attemptNumber}회 후 확인을 요청했습니다.</p>
              </div>
              <div className="manager-review-row__actions">
                <button
                  className="primary-button"
                  type="button"
                  disabled={resolvingId === review.reviewId}
                  onClick={() => onResolve(review.reviewId, "APPROVE")}
                >
                  <Check size={14} /> 완료 승인
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={resolvingId === review.reviewId}
                  onClick={() => onResolve(review.reviewId, "REQUEST_RETAKE")}
                >
                  <RotateCcw size={14} /> 재촬영 요청
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
