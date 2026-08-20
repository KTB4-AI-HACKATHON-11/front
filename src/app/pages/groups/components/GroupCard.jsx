import { ArrowUpRight } from "lucide-react";

export default function GroupCard({ group, onOpen }) {
  return (
    <button className="group-card" onClick={onOpen}>
      <div className="group-card__heading">
        <div>
          <h2>{group.name}</h2>
        </div>
        <span className="group-card__arrow"><ArrowUpRight size={17} /></span>
      </div>
      <p className="group-card__description">{group.description}</p>
      <div className="group-card__meta">
        {group.role && (
          <span className={`group-card__role group-card__role--${group.role.toLowerCase()}`}>
            {group.role === "MANAGER" ? "매니저" : "워커"}
          </span>
        )}
        {group.completionRate != null && <span>완료율 {group.completionRate}%</span>}
        {group.memberCount != null && <span>멤버 {group.memberCount}명</span>}
      </div>
    </button>
  );
}
