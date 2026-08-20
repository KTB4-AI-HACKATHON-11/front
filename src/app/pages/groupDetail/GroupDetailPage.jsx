import { CalendarDays, Check, Copy, Plus, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import AppShell from "../../components/AppShell";
import StatusState from "../../components/StatusState";
import { groups, members, tasks } from "../../data/mockData";
import { mergeGroups } from "../../lib/groupStorage";
import GroupInviteModal from "./components/GroupInviteModal";
import MemberList from "./components/MemberList";
import TaskCard from "./components/TaskCard";
import "./GroupDetailPage.css";

export default function GroupDetailPage({ user }) {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [copied, setCopied] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const mergedGroups = mergeGroups(groups);
  const currentGroup = mergedGroups.find((group) => group.id === groupId);
  const groupTasks = currentGroup && groups.some((group) => group.id === groupId) ? tasks : [];

  const handleCopyGroupId = async () => {
    try {
      await navigator.clipboard.writeText(groupId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  if (!currentGroup) {
    return <StatusState user={user} type="group" description={`요청하신 그룹(${groupId})을 찾을 수 없습니다. 그룹 ID를 다시 확인해주세요.`} />;
  }

  const canManage = currentGroup.currentUserRole === "MANAGER";

  return (
      <AppShell
      user={user}
      title={currentGroup.name}
      description={`${currentGroup.memberCount}명의 멤버가 함께 참여 중인 업무 그룹입니다.`}
      backTo="/groups"
      breadcrumbs={[
        { label: "내 그룹", path: "/groups" },
        { label: currentGroup.name, path: `/groups/${groupId}`, current: true },
      ]}
      actions={
        <div className="group-detail-actions">
          <button className="secondary-button" onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus size={16} /><span>그룹 초대</span>
          </button>
          {canManage && (
            <button className="primary-button" onClick={() => navigate(`/groups/${groupId}/tasks/new`)}>
              <Plus size={16} /><span>새 태스크</span>
            </button>
          )}
        </div>
      }
    >
      <section className="group-detail-summary page-card">
        <div className="group-detail-summary__identity">
          <span className="group-detail-summary__icon">{currentGroup.name.slice(0, 1)}</span>
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
            <h2>{currentGroup.name}</h2>
          </div>
        </div>
        <div className="group-detail-summary__metrics">
          <div><span><Users size={13} /> 멤버</span><strong>{currentGroup.memberCount}명</strong></div>
          <div><span><CalendarDays size={13} /> 오늘 태스크</span><strong>{groupTasks.length}개</strong></div>
          <div><span>전체 완료율</span><strong className="is-violet">{currentGroup.taskCount ? Math.round((currentGroup.completedCount / currentGroup.taskCount) * 100) : 0}%</strong></div>
        </div>
      </section>

      <div className="group-detail-layout">
        <section className="task-panel page-card">
          <div className="task-panel__heading">
            <div><h2>태스크 목록</h2><span>총 {groupTasks.length}개</span></div>
          </div>
          <div className="task-list">
            {groupTasks.length === 0 ? (
              <p className="group-grid__empty">아직 이 그룹에 연결된 태스크가 없습니다.</p>
            ) : (
              groupTasks.map((task) => <TaskCard key={task.id} task={task} onOpen={() => navigate(`/tasks/${task.id}`)} />)
            )}
          </div>
        </section>
        <MemberList members={members} />
      </div>
      {isInviteModalOpen && (
        <GroupInviteModal groupId={groupId} onClose={() => setIsInviteModalOpen(false)} />
      )}
    </AppShell>
  );
}
