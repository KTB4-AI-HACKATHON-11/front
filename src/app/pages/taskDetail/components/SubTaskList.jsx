import { Camera, Check, ChevronRight } from "lucide-react";

export default function SubTaskList({ items, completedIds, onToggle, onPhotoOpen }) {
  return (
    <div className="subtask-list">
      {items.map((item, index) => {
        const completed = completedIds.includes(item.id);
        return (
          <button
            className={`subtask-row ${completed ? "subtask-row--done" : ""} ${item.photo ? "subtask-row--photo" : ""}`}
            key={item.id}
            disabled={item.photo && completed}
            aria-disabled={item.photo && completed}
            onClick={() => {
              if (item.photo && completed) return;
              if (item.photo) {
                onPhotoOpen(item.id);
                return;
              }
              onToggle(item.id);
            }}
          >
            <span className="subtask-row__number">{String(index + 1).padStart(2, "0")}</span>
            <span className="subtask-row__check">{completed && <Check size={14} strokeWidth={3} />}</span>
            <span className="subtask-row__copy">
              <strong>{item.title}</strong>
              <small>{completed ? "수행 완료" : item.photo ? "사진 촬영 후 완료할 수 있어요" : "눌러서 완료 처리"}</small>
            </span>
            {item.photo && <span className="subtask-row__photo"><Camera size={13} /> 사진 검증</span>}
            <ChevronRight size={16} className="subtask-row__chevron" />
          </button>
        );
      })}
    </div>
  );
}
