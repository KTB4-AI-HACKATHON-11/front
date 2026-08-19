import { useState } from "react";
import { motion } from "motion/react";
import { X, Sparkles, CheckCircle2 } from "lucide-react";

export default function NewGroupModal({ onClose }) {
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
