import { ArrowUpRight } from "lucide-react";
import { formatGroupId } from "../../../lib/groupStorage";

export default function GroupCard({ group, onOpen }) {
  return (
    <button className="group-card" onClick={onOpen}>
      <div className="group-card__heading">
        <div>
          <span className="group-card__id">그룹 ID · {formatGroupId(group.groupId)}</span>
          <h2>{group.name}</h2>
        </div>
        <span className="group-card__arrow"><ArrowUpRight size={17} /></span>
      </div>
      <p className="group-card__description">{group.description}</p>
    </button>
  );
}
