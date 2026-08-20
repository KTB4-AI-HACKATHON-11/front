import { ArrowRight, Link2, LoaderCircle, X } from "lucide-react";
import { useState } from "react";
import { ApiError } from "../../../api/client";
import { joinGroup } from "../../../api/groupApi";

export default function GroupJoinModal({ memberId, onClose, onJoined }) {
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isJoining) return;

    const normalizedCode = inviteCode.trim();
    if (!/^\d{6}$/.test(normalizedCode)) {
      setError("초대 코드는 6자리 숫자로 입력해주세요.");
      return;
    }

    setError("");
    setIsJoining(true);
    try {
      const joinedGroup = await joinGroup({ memberId, inviteCode: normalizedCode });
      onJoined(joinedGroup.groupId);
    } catch (err) {
      // 404(존재하지 않는 초대 코드), 409(이미 가입한 그룹) 모두 서버 메시지를 보여줍니다.
      setError(
        err instanceof ApiError
          ? err.message
          : "그룹 참여에 실패했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="group-join-modal__backdrop" role="presentation" onMouseDown={onClose}>
      <section className="group-join-modal" role="dialog" aria-modal="true" aria-labelledby="group-join-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="group-join-modal__header">
          <div className="group-join-modal__icon"><Link2 size={18} /></div>
          <button className="icon-button" type="button" title="닫기" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="group-join-modal__heading">
          <span>JOIN GROUP</span>
          <h2 id="group-join-title">그룹에 참여하기</h2>
          <p>관리자에게 받은 6자리 초대 코드를 입력하면 그룹에 참여할 수 있어요.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="join-group-code">초대 코드</label>
          <p className="group-join-modal__input-hint">6자리 숫자를 입력해주세요.</p>
          <input
            className={`text-input ${error ? "text-input--error" : ""}`}
            id="join-group-code"
            value={inviteCode}
            onChange={(event) => {
              setInviteCode(event.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            onBlur={() => {
              if (inviteCode && inviteCode.length !== 6) {
                setError("초대 코드는 6자리 숫자로 입력해주세요.");
              }
            }}
            placeholder="예: 123456"
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]{6}"
            autoFocus
            disabled={isJoining}
          />
          {error && <p className="group-join-modal__helper group-join-modal__helper--error">{error}</p>}
          <div className="group-join-modal__actions">
            <button className="ghost-button" type="button" onClick={onClose} disabled={isJoining}>취소</button>
            <button className="primary-button" type="submit" disabled={isJoining || inviteCode.length !== 6}>
              {isJoining ? <><LoaderCircle className="group-join-modal__loader" size={15} /> 확인 중</> : <>참여하기 <ArrowRight size={15} /></>}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
