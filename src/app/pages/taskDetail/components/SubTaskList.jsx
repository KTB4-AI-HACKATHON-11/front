import { Camera, Check, ChevronRight } from "lucide-react";

export default function SubTaskList({ items, completedIds, updatingIds, selectedId, onToggle, onPhotoOpen, onSelect, canPerform }) {
  return (
    <div className="subtask-list">
      {items.map((item, index) => {
        const completed = completedIds.includes(item.id);
        const updating = updatingIds.includes(item.id);
        return (
          <div
            className={`subtask-row ${completed ? "subtask-row--done" : ""} ${item.photo ? "subtask-row--photo" : ""} ${selectedId === item.id ? "subtask-row--selected" : ""}`}
            key={item.id}
          >
            <button
              className="subtask-row__check-button"
              type="button"
              disabled={!canPerform || updating || (item.photo && completed)}
              onClick={() => item.photo ? onPhotoOpen(item.id) : onToggle(item.id)}
              aria-label={item.photo ? `${item.title} 사진 검증` : `${item.title} 수행 여부 변경`}
            >
              <span className="subtask-row__check">{completed && <Check size={14} strokeWidth={3} />}</span>
            </button>
            <button className="subtask-row__detail" type="button" onClick={() => onSelect(item.id)}>
              <span className="subtask-row__number">{String(index + 1).padStart(2, "0")}</span>
              <span className="subtask-row__copy">
                <strong>{item.title}</strong>
                <small>{updating ? "저장 중..." : completed ? "수행 완료" : item.photo ? "체크 버튼을 눌러 사진 검증" : "체크 버튼을 눌러 완료"}</small>
              </span>
              {item.photo && <span className="subtask-row__photo"><Camera size={13} /> 사진 검증</span>}
              <ChevronRight size={16} className="subtask-row__chevron" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
