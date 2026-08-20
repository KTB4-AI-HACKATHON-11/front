import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router";
import AppShell from "../../components/AppShell";
import { ApiError } from "../../api/client";
import { generateTaskChecklist } from "../../api/taskApi";
import "./TaskCreatePage.css";

const TASK_TITLE_MAX_LENGTH = 200;
const TASK_MESSAGE_MAX_LENGTH = 1000;

function validateTaskCreateForm({ title, message }) {
  const trimmedTitle = title.trim();
  const trimmedMessage = message.trim();

  if (!trimmedTitle) {
    return "태스크 제목을 입력해주세요.";
  }

  if (trimmedTitle.length > TASK_TITLE_MAX_LENGTH) {
    return `태스크 제목은 ${TASK_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`;
  }

  if (!trimmedMessage) {
    return "업무 요구사항을 입력해주세요.";
  }

  if (trimmedMessage.length > TASK_MESSAGE_MAX_LENGTH) {
    return `업무 요구사항은 ${TASK_MESSAGE_MAX_LENGTH}자 이하로 입력해주세요.`;
  }

  return "";
}

export default function TaskCreatePage({ user }) {
  const { groupId } = useParams();
  const [title, setTitle] = useState("오픈 전 매장 점검");
  const [message, setMessage] = useState(
    "매장 오픈 전에 입구 청소 상태와 조명이 모두 켜졌는지 확인하고, 계산대 시재와 영수증 용지를 점검해줘. 마지막에는 매장 전경 사진도 찍어야 해."
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [generatedChecklist, setGeneratedChecklist] = useState(null);

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (isGenerating) return;

    const nextErrorMessage = validateTaskCreateForm({ title, message });
    if (nextErrorMessage) {
      setErrorMessage(nextErrorMessage);
      return;
    }

    setErrorMessage("");
    setIsGenerating(true);
    try {
      // taskApi.generateTaskChecklist는 실제 AI 체크리스트 생성 API를 호출합니다.
      // 이 API는 결과를 저장하지 않고 미리보기만 반환하므로, 태스크를 실제로 저장하는
      // API가 준비되면 여기 이어서(저장 버튼 클릭 시) 연동하면 됩니다.
      const result = await generateTaskChecklist({
        groupId,
        managerId: user.memberId,
        title: title.trim(),
        message: message.trim(),
      });
      setGeneratedChecklist(result);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "체크리스트 생성에 실패했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShell user={user} title="새 태스크 만들기" description="성수 플래그십 스토어" backTo={`/groups/${groupId}`}>
      {generatedChecklist ? (
        <section className="page-card task-create-result">
          <div className="form-section-heading">
            <span>AI CHECKLIST</span>
            <h2>{generatedChecklist.title}</h2>
            {generatedChecklist.assigneeName || generatedChecklist.dueAt ? (
              <p>
                {generatedChecklist.assigneeName ? `담당자 ${generatedChecklist.assigneeName}` : ""}
                {generatedChecklist.assigneeName && generatedChecklist.dueAt ? " · " : ""}
                {generatedChecklist.dueAt ? `마감 ${new Date(generatedChecklist.dueAt).toLocaleString("ko-KR")}` : ""}
              </p>
            ) : null}
          </div>
          <ul className="task-create-checklist">
            {generatedChecklist.checklists.map((item) => (
              <li key={item.sequence}>
                <div className="task-create-checklist__top">
                  <strong>{item.sequence + 1}. {item.title}</strong>
                  <span className={`task-create-checklist__type ${item.completionType === "PHOTO" ? "is-photo" : ""}`}>
                    {item.completionType === "PHOTO" ? "사진 검증" : "체크 검증"}
                  </span>
                </div>
                <p>{item.instruction}</p>
                {item.rule && <small>검증 기준: {item.rule}</small>}
              </li>
            ))}
          </ul>
          <p className="task-create-result__note">
            아직 이 체크리스트를 실제로 저장하는 API가 준비되지 않아, 저장하기 버튼은 연동 전입니다.
          </p>
          <div className="task-create-result__actions">
            <button className="ghost-button" type="button" onClick={() => setGeneratedChecklist(null)}>
              다시 생성하기
            </button>
          </div>
        </section>
      ) : (
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
                <input
                  className="text-input"
                  id="task-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={TASK_TITLE_MAX_LENGTH}
                  required
                  disabled={isGenerating}
                />
                <div className="task-create-field__meta">
                  <span>간결하게 핵심만 입력해주세요.</span>
                  <strong>{title.length}/{TASK_TITLE_MAX_LENGTH}</strong>
                </div>
              </div>
              <div className="task-create-field">
                <label className="field-label" htmlFor="task-prompt">업무 요구사항<span className="field-label__required">*</span></label>
                <div className="task-prompt-wrap">
                  <textarea
                    className="text-area"
                    id="task-prompt"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    maxLength={TASK_MESSAGE_MAX_LENGTH}
                    required
                    disabled={isGenerating}
                  />
                  <span><Sparkles size={12} /> AI가 실행 가능한 목록으로 나눠요</span>
                </div>
                <div className="task-create-field__meta">
                  <span>최대 {TASK_MESSAGE_MAX_LENGTH}자까지 입력할 수 있습니다.</span>
                  <strong>{message.length}/{TASK_MESSAGE_MAX_LENGTH}</strong>
                </div>
              </div>
            </section>

            {errorMessage && (
              <p className="task-create-form__error" role="alert">{errorMessage}</p>
            )}

            <div className="task-create-submit page-card">
              {isGenerating ? (
                <div className="task-create-loading" aria-live="polite">
                  <span className="task-create-loading__spinner" />
                  <div><strong>AI가 태스크를 정리하고 있어요</strong><small>잠시만 기다려주세요.</small></div>
                </div>
              ) : (
                <>
                  <div><span>생성 후 다음 단계</span><strong>체크리스트 검토</strong></div>
                  <button className="primary-button" type="submit"><Sparkles size={15} /> AI로 태스크 생성 <ArrowRight size={15} /></button>
                </>
              )}
            </div>
          </div>
        </form>
      )}
    </AppShell>
  );
}
