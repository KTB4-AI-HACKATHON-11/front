import { CheckCircle2, Clock3, Copy, MoreHorizontal, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import AppShell from "../../components/AppShell";
import { ApiError } from "../../api/client";
import { updateSubTaskStatus } from "../../api/taskApi";
import { groups, subTasks, tasks } from "../../data/mockData";
import SubTaskList from "./components/SubTaskList";
import VerificationCard from "./components/VerificationCard";
import "./TaskDetailPage.css";

export default function TaskDetailPage({ user }) {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const currentTask = tasks.find((task) => task.id === taskId) ?? tasks[0];
  const currentGroup = groups[0];
  const [completedIds, setCompletedIds] = useState(subTasks.filter((item) => item.completed).map((item) => item.id));
  const [errorMessage, setErrorMessage] = useState("");

  const handleToggle = async (subTaskId) => {
    const willComplete = !completedIds.includes(subTaskId);
    setErrorMessage("");
    // 낙관적 업데이트: 응답을 기다리지 않고 먼저 화면에 반영하고, 실패하면 되돌립니다.
    setCompletedIds((current) =>
      willComplete ? [...current, subTaskId] : current.filter((id) => id !== subTaskId)
    );
    try {
      // taskApi.updateSubTaskStatus는 현재 mock 구현입니다. 백엔드 엔드포인트가 확정되면
      // 이 함수 내부만 실제 apiRequest 호출로 교체하면 되고, 아래 호출부는 그대로 둡니다.
      await updateSubTaskStatus({ taskId, subTaskId, completed: willComplete });
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

  const openPhotoVerification = () => {
    // TODO: 사진 검증이 필요한 SUB_TASK_ID를 촬영 화면에 함께 전달해야 합니다.
    navigate(`/tasks/${taskId}/verify/photo`);
  };

  const progress = Math.round((completedIds.length / subTasks.length) * 100);

  return (
    <AppShell
      user={user}
      title={currentTask.title}
      description={`${currentGroup.name}에서 진행 중인 태스크의 수행 현황을 확인합니다.`}
      backTo={`/groups/${currentGroup.id}`}
      breadcrumbs={[
        { label: "내 그룹", path: "/groups" },
        { label: currentGroup.name, path: `/groups/${currentGroup.id}` },
        { label: currentTask.title, path: `/tasks/${taskId}`, current: true },
      ]}
      actions={<button className="icon-button icon-button--bordered" title="태스크 메뉴"><MoreHorizontal size={18} /></button>}
    >
      <section className="task-detail-hero page-card">
        <div className="task-detail-hero__main">
          <div className="task-detail-hero__badges">
            <span className="status-pill status-pill--active">진행 중</span>
            <span className="task-detail-id"><Copy size={12} /> TASK_ID · {taskId}</span>
          </div>
            <h2>{currentTask.title}</h2>
            <p>담당자가 수행 중인 세부 체크리스트와 검증 상태를 한곳에서 확인할 수 있습니다.</p>
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
          <SubTaskList items={subTasks} completedIds={completedIds} onToggle={handleToggle} onPhotoOpen={openPhotoVerification} />
          {errorMessage && (
            <p className="task-detail-content__error" role="alert">{errorMessage}</p>
          )}
          {completedIds.length === subTasks.length && (
            <div className="task-complete-message"><CheckCircle2 size={17} /> 모든 항목을 성공적으로 완료했습니다.</div>
          )}
        </section>
        <VerificationCard onPhotoOpen={openPhotoVerification} />
      </div>
    </AppShell>
  );
}
