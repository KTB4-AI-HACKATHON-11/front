import { UserPlus } from "lucide-react";

export default function MemberList({ members, isLoading, errorMessage, onInvite }) {
  return (
    <aside className="member-panel page-card">
      <div className="member-panel__heading">
        <div><h2>멤버</h2><span>{members.length}명</span></div>
        <button className="icon-button icon-button--bordered" type="button" title="멤버 초대" onClick={onInvite}><UserPlus size={15} /></button>
      </div>
      <div className="member-list">
        {isLoading ? (
          <p className="group-grid__empty">멤버 목록을 불러오는 중이에요...</p>
        ) : errorMessage ? (
          <p className="group-grid__empty" role="alert">{errorMessage}</p>
        ) : members.length === 0 ? (
          <p className="group-grid__empty">표시할 멤버가 없습니다.</p>
        ) : (
          members.map((member) => (
            <div className="member-row" key={member.id}>
              <span className={`member-avatar member-avatar--${member.color}`}>{member.initial}</span>
              <div><strong>{member.name}</strong><small>{member.role === "MANAGER" ? "매니저" : "워커"}</small></div>
              <span className={`status-pill status-pill--${member.role.toLowerCase()}`}>{member.role}</span>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
