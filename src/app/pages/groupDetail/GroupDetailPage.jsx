import { CalendarDays, Check, Copy, Plus, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AppShell from "../../components/AppShell";
import StatusState from "../../components/StatusState";
import { ApiError } from "../../api/client";
import { getGroupDetail } from "../../api/groupApi";
import { getGroupMembers } from "../../api/memberApi";
import { getGroupTasks } from "../../api/taskApi";
import { groups } from "../../data/mockData";
import { mergeGroups } from "../../lib/groupStorage";
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
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorType, setErrorType] = useState("group");

  useEffect(() => {
    let cancelled = false;

    async function loadGroupDetailAndMembers() {
      setIsLoading(true);
      setErrorMessage("");
      // 그룹 상세와 멤버 목록은 서로 다른 API라 하나가 실패해도 나머지는 반영되도록
      // allSettled로 독립적으로 처리합니다.
      const [groupResult, membersResult, taskResult] = await Promise.allSettled([
        getGroupDetail({ groupId, memberId: user.memberId }),
        getGroupMembers({ groupId, requesterId: user.memberId }),
        getGroupTasks({ groupId, requesterId: user.memberId }),
      ]);

      if (cancelled) return;

      if (groupResult.status === "fulfilled") {
        setGroupDetail(groupResult.value);
      } else {
        setGroupDetail(null);
        const error = groupResult.reason;
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
          // 403: groupId는 존재하지만 memberId가 이 그룹 멤버가 아닌 경우 → 접근 권한 없음 화면
          // 그 외(404 등): 존재하지 않는 그룹 → 그룹 없음 화면
          setErrorType(error.status === 403 ? "access" : "group");
        } else {
          setErrorMessage("그룹 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
          setErrorType("group");
        }
      }

      setGroupMembers(membersResult.status === "fulfilled" ? toDisplayMembers(membersResult.value) : []);
      setGroupTasks(
        taskResult.status === "fulfilled"
          ? (taskResult.value?.items ?? []).map(toTaskCard)
          : []
      );
      setIsLoading(false);
    }

    loadGroupDetailAndMembers();
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

  // role은 아직 백엔드 응답에 없을 수 있어 실제 값이 오면 그걸 쓰고, 없으면 기존처럼
  // 로컬 mock/생성 그룹 데이터로 보완합니다. 백엔드가 내려주기 시작하면 mockGroupInfo/fallback
  // 코드는 걷어내면 됩니다. memberCount는 이제 실제 멤버 목록 API 결과 개수를 우선 사용합니다.
  const mockGroupInfo = mergeGroups(groups).find((group) => group.id === groupId);
  const role = groupDetail.role ?? mockGroupInfo?.currentUserRole;
  const canManage = role === "MANAGER";
  const memberCount = groupMembers.length || groupDetail.memberCount || mockGroupInfo?.memberCount;
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
          <span className="group-detail-summary__icon">{groupDetail.name.slice(0, 1)}</span>
          <div>
            <div>
              <span className="status-pill status-pill--active">진행 중</span>
              {role && (
                <span className={`status-pill status-pill--${role.toLowerCase()}`}>
                  {canManage ? "매니저" : "알바"}
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
          {memberCount != null && (
            <div><span><Users size={13} /> 멤버</span><strong>{memberCount}명</strong></div>
          )}
          <div><span><CalendarDays size={13} /> 오늘 태스크</span><strong>{groupTasks.length}개</strong></div>
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
        <MemberList members={groupMembers} />
      </div>
      {isInviteModalOpen && (
        <GroupInviteModal groupId={groupId} onClose={() => setIsInviteModalOpen(false)} />
      )}
    </AppShell>
  );
}
