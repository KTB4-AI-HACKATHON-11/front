import { CheckCircle2, Clock3, Copy, MoreHorizontal, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import AppShell from "../../components/AppShell";
import StatusState from "../../components/StatusState";
import { ApiError } from "../../api/client";
import { getTaskDetail, updateSubTaskStatus } from "../../api/taskApi";
import { groups } from "../../data/mockData";
import { formatTaskDueAt, toSubTask } from "../../lib/taskDisplay";
import SubTaskList from "./components/SubTaskList";
import VerificationCard from "./components/VerificationCard";
import "./TaskDetailPage.css";

const taskStatusMap = {
  WAITING: { label: "대기 중", className: "waiting" },
  PENDING: { label: "대기 중", className: "waiting" },
  IN_PROGRESS: { label: "진행 중", className: "active" },
  COMPLETED: { label: "완료", className: "complete" },
};

export default function TaskDetailPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = useParams();
  const [taskDetail, setTaskDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [selectedSubTaskId, setSelectedSubTaskId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTaskDetail() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await getTaskDetail({ taskId, requesterId: user?.memberId });
        if (!cancelled) {
          const verifiedChecklistId = location.state?.verifiedChecklistId;
          const nextChecklists = (data?.checklists ?? []).map((item) =>
            String(item.checklistId) === String(verifiedChecklistId)
              ? { ...item, performed: true }
              : item
          );
          setTaskDetail({ ...data, checklists: nextChecklists });
          setCompletedIds(nextChecklists.filter((item) => item.performed).map((item) => String(item.checklistId)));
          setSelectedSubTaskId((current) => current ?? String(nextChecklists[0]?.checklistId ?? ""));
        }
      } catch (error) {
        if (!cancelled) {
          setTaskDetail(null);
          setLoadError(error);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    if (user?.memberId) {
      loadTaskDetail();
    } else {
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [location.state?.verifiedChecklistId, taskId, user?.memberId]);

  const currentGroupId = location.state?.groupId ?? taskDetail?.groupId;
  const currentGroup = groups.find((group) => String(group.id) === String(currentGroupId)) ?? groups[0];
  const subTasks = (taskDetail?.checklists ?? []).map(toSubTask);
  const currentTask = taskDetail && {
    title: taskDetail.title,
    assignee: taskDetail.workerNickname || "담당자 없음",
    dueDate: formatTaskDueAt(taskDetail.dueAt),
  };

  const handleToggle = async (subTaskId) => {
    const willComplete = !completedIds.includes(subTaskId);
    setErrorMessage("");
    // 낙관적 업데이트: 응답을 기다리지 않고 먼저 화면에 반영하고, 실패하면 되돌립니다.
    setCompletedIds((current) =>
      willComplete ? [...current, subTaskId] : current.filter((id) => id !== subTaskId)
    );
    try {
      const result = await updateSubTaskStatus({
        taskId,
        subTaskId,
        workerId: user.memberId,
        performed: willComplete,
      });
      setCompletedIds((current) =>
        result?.performed === willComplete
          ? (willComplete ? [...new Set([...current, subTaskId])] : current.filter((id) => id !== subTaskId))
          : current
      );
      setTaskDetail((current) => {
        if (!current) return current;

        const nextChecklists = current.checklists.map((item) =>
          String(item.checklistId) === String(subTaskId)
            ? { ...item, performed: result?.performed ?? willComplete, performedAt: result?.performedAt ?? null }
            : item
        );
        const completedItemCount = nextChecklists.filter((item) => item.performed).length;

        return {
          ...current,
          progress: nextChecklists.length ? Math.round((completedItemCount / nextChecklists.length) * 100) : 0,
          status: result?.status ?? current.status,
          checklists: nextChecklists,
        };
      });
    } catch (error) {
      setCompletedIds((current) =>
        willComplete ? current.filter((id) => id !== subTaskId) : [...current, subTaskId]
      );
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "수행 여부 저장에 실패했습니다. 잠시 후 다시 시도해주세요."
      );
    }
  };

  // 아직 수행되지 않은 PHOTO 체크리스트 항목 중 첫 번째 항목을 "완료 검증" 카드에서 검증할 기본 대상으로 사용합니다.
  const selectedSubTask = subTasks.find((item) => item.id === selectedSubTaskId) ?? subTasks[0] ?? null;

  const openPhotoVerification = (subTaskId) => {
    const targetSubTaskId = subTaskId ?? selectedSubTask?.id;
    if (!targetSubTaskId) return;
    navigate(`/tasks/${taskId}/verify/photo/${targetSubTaskId}`, { state: { groupId: currentGroupId } });
  };

  const progress = taskDetail?.progress ?? (subTasks.length ? Math.round((completedIds.length / subTasks.length) * 100) : 0);

  if (!user?.memberId) {
    return <StatusState user={user} type="login" />;
  }

  if (isLoading) {
    return <AppShell user={user} title="태스크 정보를 불러오는 중" description="잠시만 기다려주세요." backTo="/groups"><p className="group-grid__empty">태스크 정보를 불러오는 중이에요...</p></AppShell>;
  }

  if (!currentTask) {
    return <StatusState user={user} type={loadError?.status === 403 ? "access" : "task"} description={loadError instanceof ApiError ? loadError.message : `요청하신 태스크(${taskId})를 찾을 수 없습니다.`} />;
  }

  const groupPath = currentGroupId ?? currentGroup.id;
  const taskStatus = taskStatusMap[taskDetail.status] ?? taskStatusMap.IN_PROGRESS;

  return (
    <AppShell
      user={user}
      title={currentTask.title}
      description={`${currentGroup.name}에서 태스크의 수행 현황을 확인합니다.`}
      backTo={`/groups/${groupPath}`}
      breadcrumbs={[
        { label: "내 그룹", path: "/groups" },
        { label: currentGroup.name, path: `/groups/${groupPath}` },
        { label: currentTask.title, path: `/tasks/${taskId}`, current: true },
      ]}
      actions={<button className="icon-button icon-button--bordered" title="태스크 메뉴"><MoreHorizontal size={18} /></button>}
    >
      <section className="task-detail-hero page-card">
        <div className="task-detail-hero__main">
          <div className="task-detail-hero__badges">
            <span className={`status-pill status-pill--${taskStatus.className}`}>{taskStatus.label}</span>
            <span className="task-detail-id"><Copy size={12} /> TASK_ID · {taskId}</span>
          </div>
            <h2>{currentTask.title}</h2>
            <p>세부 체크리스트와 검증 상태를 한곳에서 확인할 수 있습니다.</p>
          <div className="task-detail-hero__meta">
            <span><UserRound size={13} /> 담당자 <b>{currentTask.assignee}</b></span>
            <span><Clock3 size={13} /> 마감 <b>{currentTask.dueDate}</b></span>
          </div>
        </div>
        <div className="task-progress-ring" style={{ "--progress": `${progress * 3.6}deg` }}>
          <div><strong>{progress}%</strong><span>{completedIds.length}/{subTasks.length} 완료</span></div>
        </div>
      </section>

      <div className="task-detail-layout">
        <section className="task-detail-content page-card">
          <div className="task-detail-content__heading">
            <div><span><CheckCircle2 size={15} /></span><div><h2>수행 체크리스트</h2><p>항목을 누르면 수행 여부가 변경됩니다.</p></div></div>
            <strong>{completedIds.length} / {subTasks.length}</strong>
          </div>
          <SubTaskList
            items={subTasks}
            completedIds={completedIds}
            selectedId={selectedSubTask?.id}
            onSelect={setSelectedSubTaskId}
            onToggle={handleToggle}
            onPhotoOpen={openPhotoVerification}
          />
          {errorMessage && (
            <p className="task-detail-content__error" role="alert">{errorMessage}</p>
          )}
          {completedIds.length === subTasks.length && (
            <div className="task-complete-message"><CheckCircle2 size={17} /> 모든 항목을 성공적으로 완료했습니다.</div>
          )}
        </section>
        <VerificationCard subTask={selectedSubTask} onPhotoOpen={() => openPhotoVerification(selectedSubTask?.id)} />
      </div>
    </AppShell>
  );
}
