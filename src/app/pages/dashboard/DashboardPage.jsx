import { useState } from "react";
import { Users, FileText, BarChart3, Plus, LogOut, Sparkles, Search, AlertCircle, Settings } from "lucide-react";
import { GROUPS } from "../../data/groups";
import GroupCard from "./GroupCard";
import NewGroupModal from "./NewGroupModal";

export default function DashboardPage({ user, onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const filtered = GROUPS.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = activeFilter === "all" || g.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const totalActive = GROUPS.filter((g) => g.status === "active").length;
  const totalPending = GROUPS.reduce((acc, g) => acc + g.pendingCount, 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-black/5 flex flex-col fixed h-full z-20">
        <div className="px-5 py-5 border-b border-black/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#5B4BFA] rounded-lg flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
            </div>
            <span
              className="text-[17px] text-[#0D0D1A]"
              style={{ fontFamily: "Onest, sans-serif", fontWeight: 700 }}
            >
              CheckOn
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { icon: Users, label: "내 그룹", active: true },
            { icon: FileText, label: "양식 목록", active: false },
            { icon: BarChart3, label: "분석", active: false },
            { icon: Settings, label: "설정", active: false },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-[#EEF0FF] text-[#5B4BFA] font-medium"
                  : "text-[#6B6B7B] hover:bg-[#F7F7F9] hover:text-[#0D0D1A]"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-black/5">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-8 h-8 bg-[#5B4BFA] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0D0D1A] truncate">{user.name}</p>
              <p className="text-xs text-[#AAAABB] truncate">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              title="로그아웃"
              className="text-[#BBBBC5] hover:text-[#6B6B7B] transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 p-8 min-h-screen">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1
              className="text-2xl text-[#0D0D1A]"
              style={{ fontFamily: "Onest, sans-serif", fontWeight: 700 }}
            >
              내 그룹
            </h1>
            <p className="text-sm text-[#AAAABB] mt-0.5">
              {user.name}님의 업무 수집 그룹
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#5B4BFA] text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#4A3AE9] transition-all hover:shadow-lg hover:shadow-[#5B4BFA]/20"
          >
            <Plus size={15} />
            새 그룹 만들기
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-7">
          {[
            { label: "전체 그룹", value: GROUPS.length, highlight: false, warn: false },
            { label: "진행 중", value: totalActive, highlight: true, warn: false },
            { label: "미응답", value: totalPending, highlight: false, warn: totalPending > 0 },
          ].map(({ label, value, highlight, warn }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-black/5">
              <p className="text-xs text-[#AAAABB] mb-1.5">{label}</p>
              <div className="flex items-center gap-2">
                <p
                  className={`text-[32px] leading-none ${highlight ? "text-[#5B4BFA]" : "text-[#0D0D1A]"}`}
                  style={{ fontFamily: "Onest, sans-serif", fontWeight: 700 }}
                >
                  {value}
                </p>
                {warn && <AlertCircle size={16} className="text-amber-400 mt-1" />}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative max-w-xs flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#BBBBC5]" />
            <input
              type="text"
              placeholder="그룹 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-black/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#0D0D1A] placeholder:text-[#BBBBC5] focus:outline-none focus:border-[#5B4BFA] transition-colors"
            />
          </div>

          <div className="flex items-center bg-white border border-black/8 rounded-xl p-1">
            {[
              ["all", "전체"],
              ["active", "진행 중"],
              ["completed", "완료"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === key
                    ? "bg-[#5B4BFA] text-white"
                    : "text-[#6B6B7B] hover:text-[#0D0D1A]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Group list */}
        <div className="space-y-3">
          {filtered.map((group, i) => (
            <GroupCard key={group.id} group={group} index={i} />
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-20 text-[#AAAABB]">
              <Users size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      </main>

      {showModal && <NewGroupModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
