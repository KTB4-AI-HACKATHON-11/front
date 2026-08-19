import { Camera, MessageSquareText, ShieldCheck, ShieldOff } from "lucide-react";

const methods = [
  { value: "photo", label: "사진 촬영", description: "현장 사진으로 확인", icon: Camera },
  { value: "text", label: "텍스트 입력", description: "답변 내용으로 확인", icon: MessageSquareText },
];

export default function VerificationPanel({ enabled, onEnabledChange, method, onMethodChange }) {
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
          <div className="verification-methods">
            {methods.map(({ value, label, description, icon: Icon }) => (
              <button
                type="button"
                className={`verification-method ${method === value ? "verification-method--active" : ""}`}
                key={value}
                onClick={() => onMethodChange(value)}
              >
                <Icon size={17} /><span><strong>{label}</strong><small>{description}</small></span>
              </button>
            ))}
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
