import { CalendarDays, Check, Copy, Plus, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import AppShell from "../../components/AppShell";
import { groups, members, tasks } from "../../data/mockData";
import MemberList from "./components/MemberList";
import TaskCard from "./components/TaskCard";
import "./GroupDetailPage.css";

export default function GroupDetailPage({ user }) {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [copied, setCopied] = useState(false);
  const currentGroup = groups.find((group) => group.id === groupId) || groups[0];
  const canManage = currentGroup.currentUserRole === "MANAGER";

  const handleCopyGroupId = async () => {
    try {
      await navigator.clipboard.writeText(groupId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AppShell
      user={user}
      title="성수 플래그십 스토어"
      description="오픈 준비부터 마감 점검까지 현장 운영 업무를 관리합니다."
      backTo="/groups"
      actions={
        canManage && (
        <button className="primary-button" onClick={() => navigate(`/groups/${groupId}/tasks/new`)}>
            <Plus size={16} /><span>새 태스크</span>
          </button>
        )
      }
    >
      <section className="group-detail-summary page-card">
        <div className="group-detail-summary__identity">
          <span className="group-detail-summary__icon">성</span>
          <div>
            <div>
              <span className="status-pill status-pill--active">진행 중</span>
              <span className={`status-pill status-pill--${currentGroup.currentUserRole.toLowerCase()}`}>{canManage ? "매니저" : "알바"}</span>
              <span className={`group-id ${copied ? "group-id--copied" : ""}`}>
                <span>{copied ? "복사됨" : groupId}</span>
                <button type="button" onClick={handleCopyGroupId} title="그룹 ID 복사" aria-label={`${groupId} 복사`}>
                  {copied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                </button>
              </span>
            </div>
            <h2>성수 플래그십 스토어</h2>
          </div>
        </div>
        <div className="group-detail-summary__metrics">
          <div><span><Users size={13} /> 멤버</span><strong>8명</strong></div>
          <div><span><CalendarDays size={13} /> 오늘 태스크</span><strong>3개</strong></div>
          <div><span>전체 완료율</span><strong className="is-violet">58%</strong></div>
        </div>
      </section>

      <div className="group-detail-layout">
        <section className="task-panel page-card">
          <div className="task-panel__heading">
            <div><h2>태스크 목록</h2><span>총 {tasks.length}개</span></div>
          </div>
          <div className="task-list">
            {tasks.map((task) => <TaskCard key={task.id} task={task} onOpen={() => navigate(`/tasks/${task.id}`)} />)}
          </div>
        </section>
        <MemberList members={members} />
      </div>
    </AppShell>
  );
}
