const statusMap = {
  WAITING: "waiting",
  IN_PROGRESS: "active",
  COMPLETED: "completed",
  OVERDUE: "overdue",
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

export function toSubTask(item, taskAssignmentId) {
  return {
    id: String(item.checklistId),
    // 현재 백엔드는 checklistId에 task_assignments.id를 내려주므로 PHOTO 인증의 assignmentId로 사용합니다.
    assignmentId: item.assignmentId ?? item.assignment?.assignmentId ?? item.assignment?.id ?? item.taskAssignmentId ?? item.taskAssignment?.id ?? taskAssignmentId ?? item.checklistId,
    title: item.title,
    instruction: item.instruction,
    completed: Boolean(item.performed),
    photo: item.completionType === "PHOTO",
    rule: item.rule,
    referencePhotoUrl: item.referencePhotoUrl,
    submittedPhotoUrl: item.submittedPhotoUrl,
  };
}
