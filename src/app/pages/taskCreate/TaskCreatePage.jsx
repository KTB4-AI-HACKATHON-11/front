import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AppShell from "../../components/AppShell";
import "./TaskCreatePage.css";

const generatedTaskItems = [
  "출입구와 유리문 청결 상태 확인",
  "조명과 디지털 사이니지 전원 켜기",
  "계산대 시재와 영수증 용지 확인",
  "메인 테이블 상품 진열 상태 확인",
  "오픈 준비가 끝난 매장 전경 촬영",
];

export default function TaskCreatePage({ user }) {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isGenerating) return undefined;

    const timer = window.setTimeout(() => {
      // TODO: 자연어 요구사항을 GPT API로 보내 반환된 SUB_TASK 목록으로 교체해야 합니다.
      // TODO: API 응답으로 받은 TASK_ID와 체크리스트를 검증 설정 페이지로 전달해야 합니다.
      navigate("/tasks/task-101/verification", {
        state: { taskTitle: "오픈 전 매장 점검", items: generatedTaskItems },
      });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [isGenerating, navigate]);

  const handleGenerate = (event) => {
    event.preventDefault();
    if (!isGenerating) setIsGenerating(true);
  };

  return (
    <AppShell user={user} title="새 태스크 만들기" description="성수 플래그십 스토어" backTo="/groups/482731">
      <form className="task-create-layout" onSubmit={handleGenerate}>
        <div className="task-create-main">
          <section className="page-card task-create-form">
            <div className="form-section-heading">
              <span>TASK INFORMATION</span>
              <h2>무엇을 해야 하나요?</h2>
              <p>업무 요구사항을 평소 말하듯 입력하면 체크리스트로 정리합니다.</p>
            </div>
            <div className="task-create-field">
              <label className="field-label" htmlFor="task-title">태스크 제목<span className="field-label__required">*</span></label>
              <input className="text-input" id="task-title" defaultValue="오픈 전 매장 점검" required />
            </div>
            <div className="task-create-field">
              <label className="field-label" htmlFor="task-prompt">업무 요구사항<span className="field-label__required">*</span></label>
              <div className="task-prompt-wrap">
                <textarea
                  className="text-area"
                  id="task-prompt"
                  defaultValue="매장 오픈 전에 입구 청소 상태와 조명이 모두 켜졌는지 확인하고, 계산대 시재와 영수증 용지를 점검해줘. 마지막에는 매장 전경 사진도 찍어야 해."
                  required
                />
                <span><Sparkles size={12} /> AI가 실행 가능한 목록으로 나눠요</span>
              </div>
            </div>
          </section>

          <div className="task-create-submit page-card">
            {isGenerating ? (
              <div className="task-create-loading" aria-live="polite">
                <span className="task-create-loading__spinner" />
                <div><strong>AI가 태스크를 정리하고 있어요</strong><small>잠시만 기다려주세요.</small></div>
              </div>
            ) : (
              <>
                <div><span>생성 후 다음 단계</span><strong>검증 설정</strong></div>
                <button className="primary-button" type="submit"><Sparkles size={15} /> AI로 태스크 생성 <ArrowRight size={15} /></button>
              </>
            )}
          </div>
        </div>
      </form>
    </AppShell>
  );
}
