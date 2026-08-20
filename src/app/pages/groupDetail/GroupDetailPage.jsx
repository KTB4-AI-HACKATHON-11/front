import { BookOpen, CalendarDays, Check, Copy, Plus, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AppShell from "../../components/AppShell";
import StatusState from "../../components/StatusState";
import { ApiError } from "../../api/client";
import { getGroupDetail } from "../../api/groupApi";
import { getGroupMembers } from "../../api/memberApi";
import { getGroupTasks, prefetchTaskDetail } from "../../api/taskApi";
import { toDisplayMembers } from "../../lib/memberDisplay";
import { toTaskCard } from "../../lib/taskDisplay";
import GroupInviteModal from "./components/GroupInviteModal";
import MemberList from "./components/MemberList";
import TaskCard from "./components/TaskCard";
import "./GroupDetailPage.css";

export default function GroupDetailPage({ user }) {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [copied, setCopied] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [groupDetail, setGroupDetail] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupTasks, setGroupTasks] = useState([]);
  const [membersErrorMessage, setMembersErrorMessage] = useState("");
  const [tasksErrorMessage, setTasksErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [isTasksLoading, setIsTasksLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorType, setErrorType] = useState("group");

  useEffect(() => {
    let cancelled = false;

    async function loadGroup() {
      try {
        const detail = await getGroupDetail({ groupId, memberId: user.memberId });
        if (!cancelled) setGroupDetail(detail);
      } catch (error) {
        if (cancelled) return;
        setGroupDetail(null);
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
          // 403: groupId는 존재하지만 memberId가 이 그룹 멤버가 아닌 경우 → 접근 권한 없음 화면
          // 그 외(404 등): 존재하지 않는 그룹 → 그룹 없음 화면
          setErrorType(error.status === 403 ? "access" : "group");
        } else {
          setErrorMessage("그룹 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
          setErrorType("group");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    async function loadMembers() {
      try {
        const members = await getGroupMembers({ groupId, requesterId: user.memberId });
        if (!cancelled) setGroupMembers(toDisplayMembers(members));
      } catch (error) {
        if (cancelled) return;
        setGroupMembers([]);
        setMembersErrorMessage(
          error instanceof ApiError
            ? error.message
            : "멤버 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
        );
      } finally {
        if (!cancelled) setIsMembersLoading(false);
      }
    }

    async function loadTasks() {
      try {
        const tasks = await getGroupTasks({ groupId, requesterId: user.memberId });
        if (!cancelled) setGroupTasks((tasks?.items ?? []).map(toTaskCard));
      } catch (error) {
        if (cancelled) return;
        setGroupTasks([]);
        setTasksErrorMessage(
          error instanceof ApiError
            ? error.message
            : "태스크 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
        );
      } finally {
        if (!cancelled) setIsTasksLoading(false);
      }
    }

    setGroupDetail(null);
    setGroupMembers([]);
    setGroupTasks([]);
    setIsLoading(true);
    setIsMembersLoading(true);
    setIsTasksLoading(true);
    setErrorMessage("");
    setMembersErrorMessage("");
    setTasksErrorMessage("");

    // 각 영역을 독립적으로 갱신해 느린 응답이 다른 영역의 표시를 막지 않도록 합니다.
    void loadGroup();
    void loadMembers();
    void loadTasks();
    return () => {
      cancelled = true;
    };
  }, [groupId, user.memberId]);

  const handleCopyGroupId = async () => {
    try {
      await navigator.clipboard.writeText(groupId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell user={user} title="그룹 정보를 불러오는 중" description="잠시만 기다려주세요." backTo="/groups">
        <p className="group-grid__empty">그룹 정보를 불러오는 중이에요...</p>
      </AppShell>
    );
  }

  if (!groupDetail) {
    return (
      <StatusState
        user={user}
        type={errorType}
        description={errorMessage || `요청하신 그룹(${groupId})을 찾을 수 없습니다. 그룹 ID를 다시 확인해주세요.`}
      />
    );
  }

  const role = groupDetail.role;
  const canManage = role === "MANAGER";
  return (
    <AppShell
      user={user}
      title={groupDetail.name}
      description={groupDetail.description || "그룹원과 함께 참여 중인 업무 그룹입니다."}
      backTo="/groups"
      breadcrumbs={[
        { label: "내 그룹", path: "/groups" },
        { label: groupDetail.name, path: `/groups/${groupId}`, current: true },
      ]}
      actions={
        <div className="group-detail-actions">
          <button className="secondary-button" onClick={() => navigate(`/groups/${groupId}/ask`)}>
            <Sparkles size={16} /><span>AI에게 물어보기</span>
          </button>
          {canManage && (
            <button className="secondary-button" onClick={() => navigate(`/groups/${groupId}/store-info`)}>
              <BookOpen size={16} /><span>매장 정보 관리</span>
            </button>
          )}
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
          <span className="group-detail-summary__icon">{groupDetail.name.slice(0, 1)}</span>
          <div>
            <div>
              <span className="status-pill status-pill--active">진행 중</span>
              {role && (
                <span className={`status-pill status-pill--${role.toLowerCase()}`}>
                  {canManage ? "매니저" : "워커"}
                </span>
              )}
              <span className={`group-id ${copied ? "group-id--copied" : ""}`}>
                <span>{copied ? "복사됨" : groupId}</span>
                <button type="button" onClick={handleCopyGroupId} title="그룹 ID 복사" aria-label={`${groupId} 복사`}>
                  {copied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                </button>
              </span>
            </div>
            <h2>{groupDetail.name}</h2>
          </div>
        </div>
        <div className="group-detail-summary__metrics">
          {groupDetail.memberCount != null && (
            <div><span><Users size={13} /> 멤버</span><strong>{groupDetail.memberCount}명</strong><small>{groupDetail.managerCount}명 매니저 · {groupDetail.workerCount}명 워커</small></div>
          )}
          <div><span><CalendarDays size={13} /> 활성 태스크</span><strong>{groupDetail.taskCount}개</strong></div>
          <div><span>전체 완료율</span><strong className="is-violet">{groupDetail.completionRate}%</strong></div>
        </div>
      </section>

      <div className="group-detail-layout">
        <section className="task-panel page-card">
          <div className="task-panel__heading">
            <div><h2>태스크 목록</h2><span>총 {groupTasks.length}개</span></div>
          </div>
          <div className="task-list">
            {isTasksLoading ? (
              <p className="group-grid__empty">태스크 목록을 불러오는 중이에요...</p>
            ) : tasksErrorMessage ? (
              <p className="group-grid__empty" role="alert">{tasksErrorMessage}</p>
            ) : groupTasks.length === 0 ? (
              <p className="group-grid__empty">아직 이 그룹에 연결된 태스크가 없습니다.</p>
            ) : (
              groupTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onPrefetch={() => prefetchTaskDetail({ taskId: task.id, requesterId: user.memberId })}
                  onOpen={() => navigate(`/tasks/${task.id}`, { state: { groupId } })}
                />
              ))
            )}
          </div>
        </section>
        <MemberList
          members={groupMembers}
          isLoading={isMembersLoading}
          errorMessage={membersErrorMessage}
          onInvite={() => setIsInviteModalOpen(true)}
        />
      </div>
      {isInviteModalOpen && (
        <GroupInviteModal groupId={groupId} onClose={() => setIsInviteModalOpen(false)} />
      )}
    </AppShell>
  );
}
