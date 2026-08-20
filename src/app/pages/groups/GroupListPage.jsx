import { Plus, Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import AppShell from "../../components/AppShell";
import { groups } from "../../data/mockData";
import { mergeGroups } from "../../lib/groupStorage";
import GroupCard from "./components/GroupCard";
import GroupJoinModal from "./components/GroupJoinModal";
import "./GroupListPage.css";

export default function GroupListPage({ user }) {
  const navigate = useNavigate();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const mergedGroups = mergeGroups(groups);

  // 이미 불러온 그룹 목록(groups)에서 그룹명이 일치하는지 여부로만 클라이언트에서 필터링합니다.
  const filteredGroups = mergedGroups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <AppShell
      user={user}
      title="내 그룹"
      description={`${user.nickname}님이 참여하고 있는 업무 그룹입니다.`}
      actions={
        <div className="group-header-actions">
          <button className="secondary-button" onClick={() => setIsJoinModalOpen(true)}>
            <UserPlus size={16} /><span>그룹 참여</span>
          </button>
          <button className="primary-button" onClick={() => navigate("/groups/new")}>
            <Plus size={16} /><span>새 그룹</span>
          </button>
        </div>
      }
    >
      <section className="group-overview">
        <div className="group-overview__welcome">
          <span className="group-overview__eyebrow">TODAY</span>
          <h2>{user.nickname}님, 오늘도 체크해볼까요?</h2>
          <p>참여 중인 그룹의 업무 진행 상황을 한눈에 확인하세요.</p>
        </div>
        <div className="group-overview__stats">
          <div><span>참여 그룹</span><strong>3</strong></div>
          <div><span>진행 태스크</span><strong>8</strong></div>
          <div><span>오늘 완료</span><strong className="is-green">5</strong></div>
        </div>
      </section>

      <div className="group-toolbar">
        <div>
          <h2>그룹 목록</h2>
          <span>총 {filteredGroups.length}개</span>
        </div>
        <label className="group-search">
          <Search size={15} />
          <input
            type="search"
            placeholder="그룹명 검색"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
      </div>

      <section className="group-grid">
        {filteredGroups.length === 0 && (
          <p className="group-grid__empty">"{searchTerm}"와 일치하는 그룹이 없어요.</p>
        )}
        {filteredGroups.map((group) => (
          <GroupCard key={group.id} group={group} onOpen={() => navigate(`/groups/${group.id}`)} />
        ))}
        <button className="group-create-card" onClick={() => navigate("/groups/new")}>
          <span><Plus size={20} /></span>
          <strong>새 그룹 만들기</strong>
          <small>함께 일할 공간을 추가하세요</small>
        </button>
      </section>
      {isJoinModalOpen && (
        <GroupJoinModal
          memberId={user.memberId}
          onClose={() => setIsJoinModalOpen(false)}
          onJoined={(groupId) => {
            setIsJoinModalOpen(false);
            navigate(`/groups/${groupId}`);
          }}
        />
      )}
    </AppShell>
  );
}
