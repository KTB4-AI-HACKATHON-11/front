import { ArrowUpRight, CheckCircle2, ListChecks, Users } from "lucide-react";

export default function GroupCard({ group, onOpen }) {
  const progress = group.taskCount > 0
    ? Math.round((group.completedCount / group.taskCount) * 100)
    : 0;

  return (
    <button className="group-card" onClick={onOpen}>
      <div className={`group-card__accent group-card__accent--${group.accent}`} />
      <div className="group-card__heading">
        <div>
          <div className="group-card__badges">
            <span className={`status-pill ${group.status === "active" ? "status-pill--active" : "status-pill--complete"}`}>
              {group.status === "active" ? "진행 중" : "완료"}
            </span>
            <span className={`status-pill status-pill--${group.currentUserRole.toLowerCase()}`}>
              {group.currentUserRole === "MANAGER" ? "매니저" : "알바"}
            </span>
          </div>
          <h2>{group.name}</h2>
        </div>
        <span className="group-card__arrow"><ArrowUpRight size={17} /></span>
      </div>
      <p className="group-card__description">{group.description}</p>
      <div className="group-card__meta">
        <span><Users size={14} /> 멤버 {group.memberCount}명</span>
        <span><ListChecks size={14} /> 태스크 {group.taskCount}개</span>
      </div>
      <div className="group-card__progress-heading">
        <span><CheckCircle2 size={13} /> 전체 완료율</span>
        <strong>{progress}%</strong>
      </div>
      <div className="group-card__progress"><span style={{ width: `${progress}%` }} /></div>
      <small>{group.completedCount}개 완료 · {group.taskCount - group.completedCount}개 남음</small>
    </button>
  );
}
