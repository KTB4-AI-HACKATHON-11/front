import { useState } from "react";
import { motion } from "motion/react";
import {
  Zap,
  Link2,
  CheckCircle2,
  Users,
  FileText,
  BarChart3,
  ArrowRight,
  Plus,
  LogOut,
  Clock,
  Sparkles,
  Bot,
  ChevronRight,
  Search,
  AlertCircle,
  Settings,
  X,
} from "lucide-react";

const GROUPS = [
  {
    id: 1,
    name: "마케팅팀 캠페인 수집",
    description: "2024 하반기 마케팅 캠페인 아이디어 및 예산 제안 취합",
    memberCount: 12,
    responseCount: 8,
    pendingCount: 4,
    lastActivity: "2시간 전",
    status: "active",
    tag: "마케팅",
  },
  {
    id: 2,
    name: "신입 온보딩 설문",
    description: "신규 입사자 온보딩 만족도 및 개선사항 수집",
    memberCount: 5,
    responseCount: 5,
    pendingCount: 0,
    lastActivity: "1일 전",
    status: "completed",
    tag: "HR",
  },
  {
    id: 3,
    name: "Q4 예산 신청서",
    description: "부서별 4분기 예산 신청 및 집행 계획 취합",
    memberCount: 8,
    responseCount: 3,
    pendingCount: 5,
    lastActivity: "30분 전",
    status: "active",
    tag: "재무",
  },
  {
    id: 4,
    name: "고객 인터뷰 인사이트",
    description: "10월 고객 인터뷰 결과물 및 주요 인사이트 정리",
    memberCount: 4,
    responseCount: 4,
    pendingCount: 0,
    lastActivity: "3일 전",
    status: "completed",
    tag: "리서치",
  },
  {
    id: 5,
    name: "개발팀 스프린트 회고",
    description: "스프린트 22 회고 내용 및 액션 아이템 수집",
    memberCount: 9,
    responseCount: 6,
    pendingCount: 3,
    lastActivity: "5시간 전",
    status: "active",
    tag: "개발",
  },
];

export default function App() {
  const [view, setView] = useState("landing");
  const [user, setUser] = useState(null);

  const handleLogin = () => {
    setUser({ name: "김민준", email: "minjun@company.io", initials: "김" });
    setView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setView("landing");
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
      {view === "landing" && <LandingPage onCTA={() => setView("auth")} />}
      {view === "auth" && (
        <AuthPage onLogin={handleLogin} onBack={() => setView("landing")} />
      )}
      {view === "dashboard" && user && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPage({ onCTA }) {
  const features = [
    {
      icon: Bot,
      title: "자연어로 양식 생성",
      description:
        "업무를 자연어로 설명하면 AI가 제출 양식과 업무 규칙을 자동으로 만들어 드립니다.",
    },
    {
      icon: Link2,
      title: "링크로 응답 수집",
      description:
        "생성된 고유 링크를 팀원에게 공유하면 응답이 실시간으로 자동 수집됩니다.",
    },
    {
      icon: Sparkles,
      title: "AI 검수 및 정리",
      description:
        "수집된 응답을 AI가 직접 검토하고 분류·정리하여 보고서 형태로 제공합니다.",
    },
  ];

  const steps = [
    { num: "01", label: "업무 설명", detail: "자연어로 원하는 업무를 설명합니다" },
    { num: "02", label: "양식 생성", detail: "AI가 최적의 제출 양식을 생성합니다" },
    { num: "03", label: "응답 수집", detail: "링크를 공유해 응답을 수집합니다" },
    { num: "04", label: "AI 정리", detail: "AI가 응답을 검수하고 정리합니다" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#5B4BFA] rounded-lg flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
            </div>
            <span
              className="font-bold text-[17px] text-[#0D0D1A] tracking-tight"
              style={{ fontFamily: "Onest, sans-serif" }}
            >
              Forma
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {["기능", "사용 방법", "요금제"].map((item) => (
              <button
                key={item}
                className="text-sm text-[#6B6B7B] hover:text-[#0D0D1A] transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onCTA}
              className="hidden md:block text-sm text-[#6B6B7B] hover:text-[#0D0D1A] transition-colors font-medium"
            >
              로그인
            </button>
            <button
              onClick={onCTA}
              className="bg-[#5B4BFA] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#4A3AE9] transition-colors"
            >
              무료로 시작하기
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#EEF0FF] text-[#5B4BFA] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-7">
              <Zap size={11} />
              AI 기반 업무 수집 자동화
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-[72px] text-[#0D0D1A] leading-[1.08] tracking-tight mb-6"
              style={{ fontFamily: "Onest, sans-serif", fontWeight: 800 }}
            >
              말로 설명하면
              <br />
              <span className="text-[#5B4BFA]">AI가 알아서</span>
              <br />
              처리합니다
            </h1>

            <p className="text-lg text-[#6B6B7B] max-w-lg mx-auto mb-10 leading-relaxed">
              원하는 업무를 자연어로 설명하세요. AI가 제출 양식을 만들고,
              응답을 수집하고, 직접 검수·정리까지 해드립니다.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onCTA}
                className="bg-[#5B4BFA] text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-[#4A3AE9] transition-all hover:shadow-xl hover:shadow-[#5B4BFA]/25 flex items-center gap-2"
              >
                무료로 시작하기
                <ArrowRight size={16} />
              </button>
              <button className="text-[#0D0D1A] font-medium px-7 py-3.5 rounded-xl border border-black/10 hover:border-black/20 hover:bg-[#FAFAFA] transition-colors">
                데모 보기
              </button>
            </div>
          </motion.div>

          {/* Product Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-16"
          >
            <div className="bg-white rounded-2xl border border-black/8 shadow-[0_32px_96px_rgba(0,0,0,0.08)] overflow-hidden max-w-2xl mx-auto">
              <div className="bg-[#F7F7F9] border-b border-black/6 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-[#AAAABB] font-mono mx-2">
                  forma.ai/workspace
                </div>
              </div>

              <div className="p-6 space-y-4 bg-white text-left">
                <div className="flex justify-end">
                  <div className="bg-[#F7F7F9] rounded-2xl rounded-tr-md px-4 py-3 max-w-xs">
                    <p className="text-sm text-[#0D0D1A] leading-relaxed">
                      마케팅팀 하반기 캠페인 아이디어를 수집하려고 해요.
                      각 팀원이 캠페인명, KPI, 예산, 일정을 입력하면 AI가
                      실현 가능성을 판단해줬으면 해요.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-[#5B4BFA] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles size={13} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#EEF0FF] rounded-2xl rounded-tl-md px-4 py-4">
                      <p className="text-xs font-semibold text-[#5B4BFA] mb-3">
                        AI가 다음 양식을 생성했습니다
                      </p>
                      <div className="space-y-2">
                        {[
                          "캠페인명 (단답형 텍스트)",
                          "목표 KPI (다중 선택)",
                          "예상 예산 (숫자, 단위: 만원)",
                          "실행 기간 (날짜 범위)",
                          "AI 실현 가능성 검토 (자동)",
                        ].map((field, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-[#5B4BFA]">
                            <CheckCircle2 size={11} className="flex-shrink-0" />
                            {field}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#5B4BFA]/10">
                        <button className="text-xs font-semibold text-[#5B4BFA] flex items-center gap-1">
                          링크 복사하기
                          <Link2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl text-[#0D0D1A] mb-4 tracking-tight"
              style={{ fontFamily: "Onest, sans-serif", fontWeight: 700 }}
            >
              업무 수집의 모든 과정을
              <br />
              AI가 처리합니다
            </h2>
            <p className="text-[#6B6B7B] text-[15px]">
              번거로운 양식 작성, 응답 취합, 검토 과정을 AI에게 맡기세요.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-7 border border-black/6 hover:border-[#5B4BFA]/20 hover:shadow-sm transition-all"
              >
                <div className="w-11 h-11 bg-[#EEF0FF] rounded-xl flex items-center justify-center mb-5">
                  <f.icon size={20} className="text-[#5B4BFA]" />
                </div>
                <h3
                  className="text-[17px] text-[#0D0D1A] mb-2"
                  style={{ fontFamily: "Onest, sans-serif", fontWeight: 600 }}
                >
                  {f.title}
                </h3>
                <p className="text-sm text-[#6B6B7B] leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl text-[#0D0D1A] tracking-tight"
              style={{ fontFamily: "Onest, sans-serif", fontWeight: 700 }}
            >
              4단계로 끝나는 업무 수집
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-5 left-[14%] right-[14%] h-px bg-[#5B4BFA]/15" />
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative">
                <div className="w-10 h-10 bg-white border-2 border-[#5B4BFA] rounded-full flex items-center justify-center mb-4 relative z-10">
                  <span
                    className="text-xs text-[#5B4BFA]"
                    style={{ fontFamily: "Onest, sans-serif", fontWeight: 700 }}
                  >
                    {step.num}
                  </span>
                </div>
                <h4
                  className="text-[#0D0D1A] mb-1.5 text-[15px]"
                  style={{ fontFamily: "Onest, sans-serif", fontWeight: 600 }}
                >
                  {step.label}
                </h4>
                <p className="text-xs text-[#6B6B7B] leading-relaxed">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-24 px-6 bg-[#5B4BFA]">
        <div className="max-w-xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl text-white mb-4 tracking-tight"
            style={{ fontFamily: "Onest, sans-serif", fontWeight: 800 }}
          >
            지금 바로 시작해보세요
          </h2>
          <p className="text-[#C5BEFF] mb-8 text-[15px]">
            무료로 시작하고, 팀과 함께 사용할 준비가 되면 업그레이드하세요.
          </p>
          <button
            onClick={onCTA}
            className="bg-white text-[#5B4BFA] font-semibold px-8 py-3.5 rounded-xl hover:bg-[#F4F2FF] transition-colors flex items-center gap-2 mx-auto"
          >
            무료로 시작하기
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-black/6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#5B4BFA] rounded-md flex items-center justify-center">
              <Sparkles size={11} className="text-white" />
            </div>
            <span
              className="text-[#0D0D1A] font-semibold"
              style={{ fontFamily: "Onest, sans-serif" }}
            >
              Forma
            </span>
          </div>
          <p className="text-xs text-[#AAAABB]">© 2024 Forma. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// ─── Auth Page ────────────────────────────────────────────────────────────────

function AuthPage({ onLogin, onBack }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2 justify-center mb-10">
          <div className="w-8 h-8 bg-[#5B4BFA] rounded-lg flex items-center justify-center">
            <Sparkles size={15} className="text-white" />
          </div>
          <span
            className="text-xl text-[#0D0D1A]"
            style={{ fontFamily: "Onest, sans-serif", fontWeight: 700 }}
          >
            Forma
          </span>
        </div>

        <div className="text-center mb-8">
          <h1
            className="text-[26px] text-[#0D0D1A] mb-2"
            style={{ fontFamily: "Onest, sans-serif", fontWeight: 700 }}
          >
            시작하기
          </h1>
          <p className="text-sm text-[#6B6B7B]">
            계정으로 로그인하거나 새 계정을 만드세요
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-black/10 rounded-xl py-3.5 text-sm font-medium text-[#0D0D1A] hover:bg-[#FAFAFA] active:bg-[#F4F4F6] transition-all disabled:opacity-60"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-[#5B4BFA] border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          {loading ? "로그인 중..." : "Google로 계속하기"}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/6" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-[#AAAABB]">또는</span>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="이메일 주소"
            className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm text-[#0D0D1A] placeholder:text-[#BBBBC5] focus:outline-none focus:border-[#5B4BFA] transition-colors"
          />
          <input
            type="password"
            placeholder="비밀번호"
            className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm text-[#0D0D1A] placeholder:text-[#BBBBC5] focus:outline-none focus:border-[#5B4BFA] transition-colors"
          />
          <button className="w-full bg-[#5B4BFA] text-white font-medium py-3 rounded-xl hover:bg-[#4A3AE9] transition-colors text-sm">
            이메일로 계속하기
          </button>
        </div>

        <p className="text-center text-xs text-[#AAAABB] mt-6 leading-relaxed">
          로그인 시{" "}
          <span className="text-[#5B4BFA] cursor-pointer hover:underline">이용약관</span>과{" "}
          <span className="text-[#5B4BFA] cursor-pointer hover:underline">개인정보처리방침</span>에
          동의합니다.
        </p>

        <button
          onClick={onBack}
          className="mt-8 w-full text-center text-xs text-[#AAAABB] hover:text-[#6B6B7B] transition-colors"
        >
          ← 메인으로 돌아가기
        </button>
      </motion.div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ user, onLogout }) {
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
              Forma
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

function GroupCard({ group, index }) {
  const pct = Math.round((group.responseCount / group.memberCount) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-black/5 p-5 hover:border-[#5B4BFA]/25 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <h3
              className="text-[#0D0D1A] truncate text-[15px]"
              style={{ fontFamily: "Onest, sans-serif", fontWeight: 600 }}
            >
              {group.name}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF0FF] text-[#5B4BFA] flex-shrink-0">
              {group.tag}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                group.status === "active"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-[#F7F7F9] text-[#AAAABB]"
              }`}
            >
              {group.status === "active" ? "진행 중" : "완료"}
            </span>
          </div>

          <p className="text-sm text-[#6B6B7B] line-clamp-1 mb-3">{group.description}</p>

          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-[#AAAABB]">
              <Users size={11} />
              {group.memberCount}명
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#AAAABB]">
              <CheckCircle2 size={11} />
              {group.responseCount}개 응답
            </span>
            {group.pendingCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-amber-500">
                <Clock size={11} />
                {group.pendingCount}개 미응답
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-[#CCCCCC]">
              <Clock size={11} />
              {group.lastActivity}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0 min-w-[80px]">
          <div className="text-right">
            <p
              className="text-2xl text-[#0D0D1A] leading-none"
              style={{ fontFamily: "Onest, sans-serif", fontWeight: 700 }}
            >
              {pct}%
            </p>
            <p className="text-[11px] text-[#AAAABB] mt-0.5">응답률</p>
          </div>
          <div className="w-20 h-1.5 bg-[#F7F7F9] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5B4BFA] rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <ChevronRight
            size={15}
            className="text-[#CCCCCC] group-hover:text-[#5B4BFA] transition-colors mt-1"
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── New Group Modal ──────────────────────────────────────────────────────────

function NewGroupModal({ onClose }) {
  const [step, setStep] = useState("input");
  const [description, setDescription] = useState("");
  const [groupName, setGroupName] = useState("");

  const handleGenerate = () => {
    setStep("generating");
    setTimeout(() => setStep("preview"), 1800);
  };

  const previewFields = [
    "캠페인명 (단답형 텍스트)",
    "캠페인 목표 및 KPI (장문 텍스트)",
    "예상 예산 (숫자 입력, 단위: 만원)",
    "실행 기간 (날짜 범위 선택)",
    "타겟 고객층 (다중 선택)",
    "첨부 자료 (파일 업로드, 선택)",
  ];

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl shadow-black/10 overflow-hidden"
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-black/5">
          <div>
            <h2
              className="text-lg text-[#0D0D1A]"
              style={{ fontFamily: "Onest, sans-serif", fontWeight: 700 }}
            >
              새 그룹 만들기
            </h2>
            <p className="text-xs text-[#AAAABB] mt-0.5">
              업무를 설명하면 AI가 양식을 만들어 드립니다
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#BBBBC5] hover:text-[#6B6B7B] transition-colors mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {step === "input" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0D0D1A] mb-1.5">
                  그룹 이름
                </label>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="예: 마케팅팀 캠페인 수집"
                  className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm text-[#0D0D1A] placeholder:text-[#BBBBC5] focus:outline-none focus:border-[#5B4BFA] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0D0D1A] mb-1.5">
                  업무 설명
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="어떤 정보를 수집하고 싶은지 자연어로 설명해 주세요.&#10;예: 팀원들의 분기 목표를 수집하고, AI가 SMART 기준 충족 여부를 검토해줬으면 해요."
                  className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm text-[#0D0D1A] placeholder:text-[#BBBBC5] focus:outline-none focus:border-[#5B4BFA] transition-colors resize-none leading-relaxed"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={description.length < 5}
                className="w-full bg-[#5B4BFA] text-white font-medium py-3 rounded-xl hover:bg-[#4A3AE9] transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles size={14} />
                AI로 양식 생성하기
              </button>
            </div>
          )}

          {step === "generating" && (
            <div className="py-14 text-center">
              <div className="w-11 h-11 border-2 border-[#5B4BFA] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
              <p
                className="text-[#0D0D1A] text-[15px]"
                style={{ fontFamily: "Onest, sans-serif", fontWeight: 600 }}
              >
                AI가 양식을 생성 중입니다...
              </p>
              <p className="text-xs text-[#AAAABB] mt-1.5">최적의 필드를 분석하고 있어요</p>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="bg-[#EEF0FF] rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5B4BFA] mb-3">
                  <Sparkles size={12} />
                  AI가 생성한 양식 미리보기
                </div>
                <div className="space-y-2">
                  {previewFields.map((field, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#5B4BFA]">
                      <CheckCircle2 size={11} className="flex-shrink-0" />
                      {field}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#F7F7F9] rounded-xl p-3.5 text-xs text-[#6B6B7B]">
                <span className="font-semibold text-[#0D0D1A]">AI 검수 규칙:</span>{" "}
                예산이 누락되거나 실행 기간이 불명확한 경우 제출 전 알림을 전송합니다.
              </div>
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => setStep("input")}
                  className="flex-1 border border-black/10 text-sm font-medium text-[#6B6B7B] py-2.5 rounded-xl hover:bg-[#FAFAFA] transition-colors"
                >
                  다시 작성
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-[#5B4BFA] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#4A3AE9] transition-colors"
                >
                  그룹 생성하기
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
