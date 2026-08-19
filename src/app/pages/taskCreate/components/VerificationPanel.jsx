import { Camera, ShieldCheck, ShieldOff } from "lucide-react";

export default function VerificationPanel({ enabled, onEnabledChange }) {
  return (
    <section className="verification-panel page-card">
      <div className="verification-panel__top">
        <span className="verification-panel__icon"><ShieldCheck size={18} /></span>
        <div><h2>태스크 검증</h2><p>완료 여부를 확인할 방법을 반드시 설정합니다.</p></div>
        <button
          type="button"
          className={`switch-control ${enabled ? "switch-control--on" : ""}`}
          onClick={() => onEnabledChange(!enabled)}
          aria-label="검증 기능 사용 여부"
        ><span /></button>
      </div>

      {enabled ? (
        <>
          <div className="verification-photo-method">
            <span><Camera size={17} /></span>
            <div><strong>사진 촬영</strong><small>현장 사진으로 완료 여부를 확인합니다.</small></div>
          </div>
          <div className="verification-question">
            <label className="field-label" htmlFor="verification-rule">검증 기준<span className="field-label__required">*</span></label>
            <textarea
              className="text-area"
              id="verification-rule"
              defaultValue="매장 전체가 프레임 안에 들어오고, 조명과 메인 진열대가 선명하게 보여야 합니다."
              required
            />
            <p className="field-hint">사진 또는 답변을 어떤 기준으로 성공 처리할지 질문 형태로 구체적으로 입력하세요.</p>
          </div>
        </>
      ) : (
        <div className="verification-disabled">
          <ShieldOff size={18} />
          <div><strong>검증 없음</strong><p>완료 체크만으로 태스크가 완료됩니다.</p></div>
        </div>
      )}
    </section>
  );
}
