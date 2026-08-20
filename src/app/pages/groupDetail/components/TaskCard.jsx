import { Camera, ChevronRight, CircleCheck, ShieldOff, UserRound } from "lucide-react";

const verificationMap = {
  photo: { label: "사진 검증", icon: Camera, className: "task-card__verify--photo" },
  none: { label: "검증 없음", icon: ShieldOff, className: "task-card__verify--none" },
};

export default function TaskCard({ task, onOpen }) {
  const verification = verificationMap[task.verification];
  const VerificationIcon = verification.icon;

  return (
    <button className="task-card" onClick={onOpen}>
      <div className="task-card__status-icon">
        <CircleCheck size={19} className={task.status === "completed" ? "is-complete" : ""} />
      </div>
      <div className="task-card__main">
        <div className="task-card__title-row">
          <h3>{task.title}</h3>
          <span className={`task-card__verify ${verification.className}`}><VerificationIcon size={12} />{verification.label}</span>
        </div>
        <div className="task-card__meta">
          <span><UserRound size={12} /> {task.assignee}</span>
          <span>{task.completedSubTaskCount}/{task.subTaskCount}개 완료</span>
        </div>
      </div>
      <div className="task-card__progress-wrap">
        <strong>{task.progress}%</strong>
        <div><span style={{ width: `${task.progress}%` }} /></div>
      </div>
      <ChevronRight size={17} className="task-card__chevron" />
    </button>
  );
}
