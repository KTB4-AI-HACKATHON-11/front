import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router";
import AppShell from "../../components/AppShell";
import { groups } from "../../data/mockData";
import GroupCard from "./components/GroupCard";
import "./GroupListPage.css";

export default function GroupListPage({ user }) {
  const navigate = useNavigate();

  return (
    <AppShell
      user={user}
      title="내 그룹"
      description={`${user.nickname}님이 참여하고 있는 업무 그룹입니다.`}
      actions={
        <button className="primary-button" onClick={() => navigate("/groups/new")}>
          <Plus size={16} /><span>새 그룹</span>
        </button>
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
          <span>총 {groups.length}개</span>
        </div>
        <label className="group-search">
          <Search size={15} />
          <input type="search" placeholder="그룹명 검색" />
        </label>
      </div>

      <section className="group-grid">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} onOpen={() => navigate(`/groups/${group.id}`)} />
        ))}
        <button className="group-create-card" onClick={() => navigate("/groups/new")}>
          <span><Plus size={20} /></span>
          <strong>새 그룹 만들기</strong>
          <small>함께 일할 공간을 추가하세요</small>
        </button>
      </section>
    </AppShell>
  );
}
