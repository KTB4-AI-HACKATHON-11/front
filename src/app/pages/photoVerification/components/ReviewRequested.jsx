import { UserCheck } from "lucide-react";

export default function ReviewRequested({ onConfirm }) {
  return (
    <div className="photo-review-requested">
      <span className="photo-review-requested__icon"><UserCheck size={34} /></span>
      <span className="photo-review-requested__eyebrow">MANAGER REVIEW REQUESTED</span>
      <h2>매니저 확인을 요청했어요</h2>
      <p>
        AI 검증이 반복해서 실패해 매니저에게 확인을 요청했습니다.
        <br />
        매니저가 사진을 확인한 뒤 완료 처리해드릴게요.
      </p>
      <button className="primary-button" type="button" onClick={onConfirm}>
        확인하고 태스크로 돌아가기
      </button>
    </div>
  );
}
