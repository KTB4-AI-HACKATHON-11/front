import { MoreHorizontal, UserPlus } from "lucide-react";

export default function MemberList({ members }) {
  return (
    <aside className="member-panel page-card">
      <div className="member-panel__heading">
        <div><h2>멤버</h2><span>{members.length}명</span></div>
        <button className="icon-button icon-button--bordered" title="멤버 초대"><UserPlus size={15} /></button>
      </div>
      <div className="member-list">
        {members.length === 0 ? (
          <p className="group-grid__empty">표시할 멤버가 없습니다.</p>
        ) : (
          members.map((member) => (
            <div className="member-row" key={member.id}>
              <span className={`member-avatar member-avatar--${member.color}`}>{member.initial}</span>
              <div><strong>{member.name}</strong><small>{member.role === "MANAGER" ? "매니저" : "알바"}</small></div>
              <span className={`status-pill status-pill--${member.role.toLowerCase()}`}>{member.role}</span>
              <button className="icon-button" title="멤버 메뉴"><MoreHorizontal size={16} /></button>
            </div>
          ))
        )}
      </div>
      <button className="member-panel__more">전체 멤버 보기</button>
    </aside>
  );
}
