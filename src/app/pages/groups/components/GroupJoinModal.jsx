import { ArrowRight, Link2, LoaderCircle, X } from "lucide-react";
import { useState } from "react";
import { groups } from "../../../data/mockData";

export default function GroupJoinModal({ onClose, onJoined }) {
  const [groupId, setGroupId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalizedId = groupId.trim();
    if (!/^\d{6}$/.test(normalizedId)) {
      setError("그룹 ID는 6자리 숫자로 입력해주세요.");
      return;
    }

    setError("");
    setIsJoining(true);
    window.setTimeout(() => {
      // TODO: 입력한 GROUP_ID를 백엔드 그룹 참여/비교 API로 전송해야 합니다.
      // TODO: 성공 시 반환된 GROUP_ID로 이동하고, 실패 시 API 응답 메시지를 표시해야 합니다.
      const matchedGroup = groups.find((group) => group.id === normalizedId);
      setIsJoining(false);
      if (matchedGroup) {
        onJoined(matchedGroup.id);
        return;
      }
      setError("그룹 ID를 찾을 수 없습니다. 그룹 ID를 다시 확인해주세요.");
    }, 500);
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
          <p>초대받은 그룹 ID를 입력하면 그룹에 참여할 수 있어요.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="join-group-id">그룹 ID</label>
          <p className="group-join-modal__input-hint">문자는 입력할 수 없어요. 6자리 숫자를 입력해주세요.</p>
          <input
            className={`text-input ${error ? "text-input--error" : ""}`}
            id="join-group-id"
            value={groupId}
            onChange={(event) => {
              setGroupId(event.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            onBlur={() => {
              if (groupId && groupId.length !== 6) setError("그룹 ID는 6자리 숫자로 입력해주세요.");
            }}
            placeholder="예: 482731"
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]{6}"
            autoFocus
            disabled={isJoining}
          />
          {error && <p className="group-join-modal__helper group-join-modal__helper--error">{error}</p>}
          <div className="group-join-modal__actions">
            <button className="ghost-button" type="button" onClick={onClose} disabled={isJoining}>취소</button>
            <button className="primary-button" type="submit" disabled={isJoining}>
              {isJoining ? <><LoaderCircle className="group-join-modal__loader" size={15} /> 확인 중</> : <>참여하기 <ArrowRight size={15} /></>}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
