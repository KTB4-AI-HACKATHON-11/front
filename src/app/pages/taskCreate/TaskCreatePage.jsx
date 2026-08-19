import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import AppShell from "../../components/AppShell";
import GeneratedChecklist from "./components/GeneratedChecklist";
import VerificationPanel from "./components/VerificationPanel";
import "./TaskCreatePage.css";

export default function TaskCreatePage({ user }) {
  const navigate = useNavigate();
  const [verificationEnabled, setVerificationEnabled] = useState(true);
  const [verificationMethod, setVerificationMethod] = useState("photo");

  const handleGenerate = (event) => {
    event.preventDefault();
    // TODO: 자연어 요구사항을 GPT API로 보내 SUB_TASK 목록으로 변환해야 합니다.
    // TODO: 검증 기준과 함께 태스크 생성 API를 호출하고 반환된 TASK_ID로 이동해야 합니다.
    navigate("/tasks/task-101");
  };

  return (
    <AppShell user={user} title="새 태스크 만들기" description="성수 플래그십 스토어" backTo="/groups/group-1">
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
            <div className="task-create-fields-row">
              <div><label className="field-label" htmlFor="assignee">담당자</label><select className="text-input" id="assignee" defaultValue="서연"><option>서연</option><option>도윤</option><option>하린</option></select></div>
              <div><label className="field-label" htmlFor="due-date">마감 일시</label><input className="text-input" id="due-date" type="datetime-local" defaultValue="2026-08-19T09:30" /></div>
            </div>
          </section>
          <VerificationPanel
            enabled={verificationEnabled}
            onEnabledChange={setVerificationEnabled}
            method={verificationMethod}
            onMethodChange={setVerificationMethod}
          />
        </div>

        <div className="task-create-side">
          <GeneratedChecklist />
          <div className="task-create-submit page-card">
            <div><span>생성 후 상태</span><strong>대기</strong></div>
            <button className="primary-button" type="submit"><Sparkles size={15} /> AI로 태스크 생성 <ArrowRight size={15} /></button>
            <button className="ghost-button" type="button" onClick={() => navigate("/groups/group-1")}>임시 저장 후 나가기</button>
          </div>
        </div>
      </form>
    </AppShell>
  );
}
