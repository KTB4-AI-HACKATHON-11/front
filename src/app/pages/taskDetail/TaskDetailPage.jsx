import { CheckCircle2, Clock3, Copy, MoreHorizontal, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import AppShell from "../../components/AppShell";
import { subTasks } from "../../data/mockData";
import SubTaskList from "./components/SubTaskList";
import VerificationCard from "./components/VerificationCard";
import "./TaskDetailPage.css";

export default function TaskDetailPage({ user }) {
  const navigate = useNavigate();
  const [completedIds, setCompletedIds] = useState(subTasks.filter((item) => item.completed).map((item) => item.id));

  const handleToggle = (subTaskId) => {
    // TODO: SUB_TASK의 수행 여부(boolean)를 서버에 저장하고 TASK_ID 기준 상세 데이터를 갱신해야 합니다.
    setCompletedIds((current) => current.includes(subTaskId) ? current.filter((id) => id !== subTaskId) : [...current, subTaskId]);
  };

  const openPhotoVerification = () => {
    // TODO: 사진 검증이 필요한 SUB_TASK_ID와 TASK_ID를 촬영 화면에 전달해야 합니다.
    navigate("/tasks/task-101/verify/photo");
  };

  const progress = Math.round((completedIds.length / subTasks.length) * 100);

  return (
    <AppShell
      user={user}
      title="태스크 상세"
      description="성수 플래그십 스토어"
      backTo="/groups/group-1"
      actions={<button className="icon-button icon-button--bordered" title="태스크 메뉴"><MoreHorizontal size={18} /></button>}
    >
      <section className="task-detail-hero page-card">
        <div className="task-detail-hero__main">
          <div className="task-detail-hero__badges">
            <span className="status-pill status-pill--active">진행 중</span>
            <span className="task-detail-id"><Copy size={12} /> TASK_ID · task-101</span>
          </div>
          <h2>오픈 전 매장 점검</h2>
          <p>매장 오픈 전 필수 준비 사항을 순서대로 확인하고 마지막에 현장 사진을 남겨주세요.</p>
          <div className="task-detail-hero__meta">
            <span><UserRound size={13} /> 담당자 <b>서연</b></span>
            <span><Clock3 size={13} /> 마감 <b>오늘 09:30</b></span>
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
          {completedIds.length === subTasks.length && (
            <div className="task-complete-message"><CheckCircle2 size={17} /> 모든 항목을 성공적으로 완료했습니다.</div>
          )}
        </section>
        <VerificationCard onPhotoOpen={openPhotoVerification} />
      </div>
    </AppShell>
  );
}
