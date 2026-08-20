import { Check, Copy, Link2, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

export default function GroupInviteModal({ inviteCode, onClose }) {
  const [copiedTarget, setCopiedTarget] = useState(null);

  const handleCopy = async (text, target) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTarget(target);
      window.setTimeout(() => setCopiedTarget(null), 1500);
    } catch {
      setCopiedTarget(null);
    }
  };

  return createPortal(
    (
    <div className="group-invite-modal__backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="group-invite-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-invite-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="group-invite-modal__header">
          <div className="group-invite-modal__icon"><Link2 size={18} /></div>
          <button className="icon-button" type="button" title="닫기" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="group-invite-modal__heading">
          <span>INVITE GROUP</span>
          <h2 id="group-invite-title">그룹에 멤버 초대하기</h2>
          <p>아래 초대 코드를 공유하면, 그룹 멤버가 "그룹 참여" 화면에서 가입할 수 있어요.</p>
        </div>

        <div className="group-invite-modal__code">
          <span className="group-invite-modal__code-label">초대 코드</span>
          <div className="group-invite-modal__code-value">
            <strong>{inviteCode}</strong>
            <button
              type="button"
              className={`group-invite-modal__code-copy ${copiedTarget === "code" ? "is-copied" : ""}`}
              onClick={() => handleCopy(inviteCode, "code")}
              title="초대 코드 복사"
              aria-label="초대 코드 복사"
            >
              {copiedTarget === "code" ? <Check size={18} strokeWidth={3} /> : <Copy size={18} />}
            </button>
          </div>
          {copiedTarget === "code" && <small className="group-invite-modal__code-hint">복사됐어요</small>}
        </div>
      </section>
    </div>
    ),
    document.body
  );
}
