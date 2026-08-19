import { motion } from "motion/react";
import { Zap, Link2, CheckCircle2, ArrowRight, Sparkles, Bot } from "lucide-react";

export default function LandingPage({ onCTA }) {
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
              CheckOn
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
                  checkon.ai/workspace
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
              CheckOn
            </span>
          </div>
          <p className="text-xs text-[#AAAABB]">© 2024 CheckOn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
