const statusMap = {
  WAITING: "waiting",
  IN_PROGRESS: "active",
  COMPLETED: "completed",
};

export function formatTaskDueAt(dueAt) {
  if (!dueAt) return "마감 없음";

  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return dueAt;

  return date.toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toTaskCard(task) {
  return {
    id: String(task.taskId),
    title: task.title,
    assignee: task.workerNickname || "담당자 없음",
    dueDate: formatTaskDueAt(task.dueAt),
    status: statusMap[task.status] ?? "waiting",
    progress: task.progress ?? 0,
    verification: task.hasPhotoVerification ? "photo" : "none",
    subTaskCount: task.itemCount ?? 0,
    completedSubTaskCount: task.completedItemCount ?? 0,
  };
}

export function toSubTask(item) {
  return {
    id: String(item.checklistId),
    assignmentId: item.assignmentId ?? item.assignment?.assignmentId,
    title: item.title,
    instruction: item.instruction,
    completed: Boolean(item.performed),
    photo: item.completionType === "PHOTO",
    rule: item.rule,
    referencePhotoUrl: item.referencePhotoUrl,
    submittedPhotoUrl: item.submittedPhotoUrl,
  };
}
