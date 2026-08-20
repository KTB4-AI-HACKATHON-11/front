import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useBeforeUnload, useNavigate, useParams } from "react-router";
import AppShell from "../../components/AppShell";
import { ApiError } from "../../api/client";
import { generateTaskChecklist } from "../../api/taskApi";
import { groups } from "../../data/mockData";
import { members } from "../../data/mockData";
import { mergeGroups } from "../../lib/groupStorage";
import "./TaskCreatePage.css";

const TASK_TITLE_MAX_LENGTH = 200;
const TASK_MESSAGE_MAX_LENGTH = 1000;
const TASK_TITLE_PLACEHOLDER = "예: 오픈 전 매장 점검";
const TASK_MESSAGE_PLACEHOLDER =
  "예: 매장 오픈 전에 입구 청소 상태와 조명이 모두 켜졌는지 확인하고, 계산대 시재와 영수증 용지를 점검해줘. 마지막에는 매장 전경 사진도 찍어야 해.";
const TASK_CREATE_DRAFT_KEY_PREFIX = "checkon-task-create-draft";

function getDraftStorageKey(groupId) {
  return `${TASK_CREATE_DRAFT_KEY_PREFIX}-${groupId}`;
}

function loadDraft(groupId, workerMembers) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawDraft = window.sessionStorage.getItem(getDraftStorageKey(groupId));
    if (!rawDraft) {
      return null;
    }

    const parsedDraft = JSON.parse(rawDraft);
    const hasMatchingAssignee = workerMembers.some((member) => member.id === parsedDraft.assigneeId);

    return {
      assigneeId: hasMatchingAssignee ? parsedDraft.assigneeId : workerMembers[0]?.id ?? "",
      title: typeof parsedDraft.title === "string" ? parsedDraft.title : "",
      message: typeof parsedDraft.message === "string" ? parsedDraft.message : "",
    };
  } catch {
    return null;
  }
}

function hasTaskDraftValue({ title, message, assigneeId }, defaultAssigneeId) {
  return Boolean(title.trim() || message.trim() || (assigneeId && assigneeId !== defaultAssigneeId));
}

function validateTaskCreateForm({ title, message, assigneeId }) {
  const trimmedTitle = title.trim();
  const trimmedMessage = message.trim();

  if (!assigneeId) {
    return "담당자를 선택해주세요.";
  }

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
  const navigate = useNavigate();
  const { groupId } = useParams();
  const currentGroup = mergeGroups(groups).find((group) => group.id === groupId);
  const workerMembers = members.filter((member) => member.role === "WORKER");
  const defaultAssigneeId = workerMembers[0]?.id ?? "";
  const draft = loadDraft(groupId, workerMembers);
  const [assigneeId, setAssigneeId] = useState(draft?.assigneeId ?? defaultAssigneeId);
  const [title, setTitle] = useState(draft?.title ?? "");
  const [message, setMessage] = useState(draft?.message ?? "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [generatedChecklist, setGeneratedChecklist] = useState(null);
  const hasUnsavedChanges = hasTaskDraftValue({ title, message, assigneeId }, defaultAssigneeId) && !generatedChecklist;
  const hasValidMemberSession = Boolean(user?.memberId);
  const hasValidGroupId = /^\d+$/.test(groupId ?? "");

  useEffect(() => {
    if (generatedChecklist) {
      return;
    }

    if (!hasTaskDraftValue({ title, message, assigneeId }, defaultAssigneeId)) {
      window.sessionStorage.removeItem(getDraftStorageKey(groupId));
      return;
    }

    window.sessionStorage.setItem(
      getDraftStorageKey(groupId),
      JSON.stringify({ assigneeId, title, message })
    );
  }, [assigneeId, defaultAssigneeId, generatedChecklist, groupId, message, title]);

  useBeforeUnload((event) => {
    if (!hasUnsavedChanges) {
      return;
    }

    event.preventDefault();
    event.returnValue = "";
  });

  const confirmDiscardChanges = () => {
    if (!hasUnsavedChanges) {
      return true;
    }

    return window.confirm("작성 중인 내용이 있습니다. 이 페이지를 벗어나면 저장되지 않은 변경사항이 사라질 수 있습니다. 이동할까요?");
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (isGenerating) return;

    if (!hasValidMemberSession) {
      setErrorMessage("로그인 정보가 없어 태스크를 생성할 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    if (!hasValidGroupId) {
      setErrorMessage("유효하지 않은 그룹입니다. 그룹 목록으로 돌아가 다시 시도해주세요.");
      return;
    }

    const nextErrorMessage = validateTaskCreateForm({ title, message, assigneeId });
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
      setGeneratedChecklist({
        ...result,
        assigneeName: workerMembers.find((member) => member.id === assigneeId)?.name ?? "",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.message === "그룹에 접근할 수 없습니다.") {
          setErrorMessage("현재 로그인한 계정으로는 이 그룹에서 태스크를 생성할 수 없습니다. 그룹에 다시 참여했는지 확인해주세요.");
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage("체크리스트 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShell
      user={user}
      title="새 태스크 만들기"
      description={currentGroup ? `${currentGroup.name}에서 새 업무를 등록합니다.` : "그룹에 연결할 새 업무를 작성합니다."}
      backTo={`/groups/${groupId}`}
      onBeforeNavigate={confirmDiscardChanges}
      breadcrumbs={[
        { label: "내 그룹", path: "/groups" },
        ...(currentGroup ? [{ label: currentGroup.name, path: `/groups/${groupId}` }] : []),
        { label: "새 태스크 만들기", path: `/groups/${groupId}/tasks/new`, current: true },
      ]}
    >
      {!hasValidMemberSession ? (
        <section className="page-card task-create-result">
          <div className="form-section-heading">
            <span>LOGIN REQUIRED</span>
            <h2>다시 로그인해주세요</h2>
            <p>현재 세션에는 `memberId`가 없어 실제 태스크 생성 API를 호출할 수 없습니다.</p>
          </div>
          <div className="task-create-result__actions">
            <button className="primary-button" type="button" onClick={() => navigate("/login")}>
              로그인으로 이동
            </button>
          </div>
        </section>
      ) : !hasValidGroupId ? (
        <section className="page-card task-create-result">
          <div className="form-section-heading">
            <span>INVALID GROUP</span>
            <h2>유효하지 않은 그룹입니다</h2>
            <p>태스크 생성은 숫자형 그룹 ID에서만 진행할 수 있습니다.</p>
          </div>
          <div className="task-create-result__actions">
            <button className="primary-button" type="button" onClick={() => navigate("/groups")}>
              그룹 목록으로 이동
            </button>
          </div>
        </section>
      ) : generatedChecklist ? (
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
                <label className="field-label">담당자<span className="field-label__required">*</span></label>
                <div className="task-create-assignees" role="radiogroup" aria-label="담당자 선택">
                  {workerMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      className={`task-create-assignee ${assigneeId === member.id ? "is-selected" : ""}`}
                      onClick={() => setAssigneeId(member.id)}
                      disabled={isGenerating}
                      aria-pressed={assigneeId === member.id}
                    >
                      <span className={`member-avatar member-avatar--${member.color}`}>{member.initial}</span>
                      <strong>{member.name}</strong>
                      <small>알바</small>
                    </button>
                  ))}
                </div>
              </div>
              <div className="task-create-field">
                <label className="field-label" htmlFor="task-title">태스크 제목<span className="field-label__required">*</span></label>
                <input
                  className="text-input"
                  id="task-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={TASK_TITLE_PLACEHOLDER}
                  maxLength={TASK_TITLE_MAX_LENGTH}
                  required
                  disabled={isGenerating}
                />
                <div className="task-create-field__meta">
                  <span>업무 내용을 간단히 작성해주세요.</span>
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
                    placeholder={TASK_MESSAGE_PLACEHOLDER}
                    maxLength={TASK_MESSAGE_MAX_LENGTH}
                    required
                    disabled={isGenerating}
                  />
                  <span><Sparkles size={12} /> AI가 실행 가능한 목록으로 나눠요</span>
                </div>
                <div className="task-create-field__meta">
                  <span>필요한 작업을 구체적으로 설명해주세요.</span>
                  <strong>{message.length}/{TASK_MESSAGE_MAX_LENGTH}</strong>
                </div>
              </div>
            </section>

            {errorMessage && (
              <p className="task-create-form__error" role="alert">{errorMessage}</p>
            )}

            <div className="task-create-submit">
              {isGenerating ? (
                <div className="task-create-loading" aria-live="polite">
                  <span className="task-create-loading__spinner" />
                  <div><strong>AI가 태스크를 정리하고 있어요</strong><small>잠시만 기다려주세요.</small></div>
                </div>
              ) : (
                <button className="primary-button" type="submit"><Sparkles size={15} /> AI로 태스크 생성 <ArrowRight size={15} /></button>
              )}
            </div>
          </div>
        </form>
      )}
    </AppShell>
  );
}
