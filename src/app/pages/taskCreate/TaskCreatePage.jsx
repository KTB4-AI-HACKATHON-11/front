import { ArrowRight, Camera, Save, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBeforeUnload, useNavigate, useParams } from "react-router";
import AppShell from "../../components/AppShell";
import StatusState from "../../components/StatusState";
import { ApiError } from "../../api/client";
import { createTask, generateTaskChecklist } from "../../api/taskApi";
import { getGroupDetail } from "../../api/groupApi";
import { members } from "../../data/mockData";
import "./TaskCreatePage.css";

const TASK_TITLE_MAX_LENGTH = 200;
const TASK_MESSAGE_MAX_LENGTH = 1000;
// 태스크 최종 등록 API가 체크리스트를 최대 20개까지만 허용합니다.
const TASK_CHECKLIST_MAX_LENGTH = 20;
const TASK_TITLE_PLACEHOLDER = "예: 오픈 전 매장 점검";
const TASK_MESSAGE_PLACEHOLDER =
  "예: 매장 오픈 전에 입구 청소 상태와 조명이 모두 켜졌는지 확인하고, 계산대 시재와 영수증 용지를 점검해줘. 마지막에는 매장 전경 사진도 찍어야 해.";
const TASK_CREATE_DRAFT_KEY_PREFIX = "checkon-task-create-draft";

function getDraftStorageKey(groupId) {
  return `${TASK_CREATE_DRAFT_KEY_PREFIX}-${groupId}`;
}

// datetime-local input이 요구하는 "YYYY-MM-DDTHH:mm" 형식으로 변환합니다.
function toDateTimeLocalValue(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
      dueAt: typeof parsedDraft.dueAt === "string" ? parsedDraft.dueAt : "",
    };
  } catch {
    return null;
  }
}

function hasTaskDraftValue({ title, message, assigneeId, dueAt }, defaultAssigneeId) {
  return Boolean(title.trim() || message.trim() || dueAt || (assigneeId && assigneeId !== defaultAssigneeId));
}

function validateTaskCreateForm({ title, message, assigneeId, dueAt }) {
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

  if (!dueAt) {
    return "마감 일시를 선택해주세요.";
  }

  const dueDate = new Date(dueAt);
  if (Number.isNaN(dueDate.getTime()) || dueDate.getTime() <= Date.now()) {
    return "마감 일시는 현재 시간 이후로 설정해주세요.";
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
  // TODO: 그룹의 실제 멤버를 조회하는 API가 아직 없어 mockData.js의 WORKER(id 1~5)를 담당자 후보로 사용합니다.
  // 백엔드에 "그룹 멤버 목록 조회" API가 추가되면 workerMembers를 실제 데이터로 교체해야
  // 태스크 최종 등록 시 보내는 workerId가 해당 그룹에 실제로 속한 멤버 ID와 일치합니다.
  const workerMembers = members.filter((member) => member.role === "WORKER");
  const defaultAssigneeId = workerMembers[0]?.id ?? "";
  const draft = loadDraft(groupId, workerMembers);
  const [assigneeId, setAssigneeId] = useState(draft?.assigneeId ?? defaultAssigneeId);
  const [title, setTitle] = useState(draft?.title ?? "");
  const [message, setMessage] = useState(draft?.message ?? "");
  const [dueAt, setDueAt] = useState(draft?.dueAt ?? "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [generatedChecklist, setGeneratedChecklist] = useState(null);
  const [taskTitleDraft, setTaskTitleDraft] = useState("");
  const [checklistDraft, setChecklistDraft] = useState([]); // 사용자가 직접 수정 가능한 체크리스트 편집본
  const [referencePhotos, setReferencePhotos] = useState({}); // { [sequence]: { file, previewUrl } }
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [isGroupLoading, setIsGroupLoading] = useState(true);
  const minDueAt = useMemo(() => toDateTimeLocalValue(new Date()), []);
  const referencePhotosRef = useRef(referencePhotos);
  const hasUnsavedChanges = hasTaskDraftValue({ title, message, assigneeId, dueAt }, defaultAssigneeId) && !generatedChecklist;
  const hasValidMemberSession = Boolean(user?.memberId);
  const hasValidGroupId = Boolean(currentGroup);
  const hasManagerAccess = currentGroup?.role === "MANAGER";
  const photoChecklistItems = checklistDraft.filter((item) => item.completionType === "PHOTO");
  const missingPhotoCount = photoChecklistItems.filter((item) => !referencePhotos[item.sequence]).length;

  useEffect(() => {
    if (!hasValidMemberSession) {
      setIsGroupLoading(false);
      return;
    }

    let cancelled = false;

    async function loadGroup() {
      setIsGroupLoading(true);
      try {
        const data = await getGroupDetail({ groupId, memberId: user.memberId });
        if (!cancelled) setCurrentGroup(data);
      } catch {
        if (!cancelled) setCurrentGroup(null);
      } finally {
        if (!cancelled) setIsGroupLoading(false);
      }
    }

    loadGroup();
    return () => {
      cancelled = true;
    };
  }, [groupId, hasValidMemberSession, user?.memberId]);

  useEffect(() => {
    if (generatedChecklist) {
      return;
    }

    if (!hasTaskDraftValue({ title, message, assigneeId, dueAt }, defaultAssigneeId)) {
      window.sessionStorage.removeItem(getDraftStorageKey(groupId));
      return;
    }

    window.sessionStorage.setItem(
      getDraftStorageKey(groupId),
      JSON.stringify({ assigneeId, title, message, dueAt })
    );
  }, [assigneeId, defaultAssigneeId, dueAt, generatedChecklist, groupId, message, title]);

  // 선택된 기준 사진의 object URL은 컴포넌트가 사라질 때 모두 해제합니다.
  // ref에 최신 상태를 계속 반영해두고 언마운트 시점의 값을 사용합니다.
  useEffect(() => {
    referencePhotosRef.current = referencePhotos;
  }, [referencePhotos]);

  useEffect(() => {
    return () => {
      Object.values(referencePhotosRef.current).forEach((entry) => URL.revokeObjectURL(entry.previewUrl));
    };
  }, []);

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

  const clearReferencePhotos = () => {
    Object.values(referencePhotos).forEach((entry) => URL.revokeObjectURL(entry.previewUrl));
    setReferencePhotos({});
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

    if (!hasManagerAccess) {
      setAccessDenied(true);
      return;
    }

    const nextErrorMessage = validateTaskCreateForm({ title, message, assigneeId, dueAt });
    if (nextErrorMessage) {
      setErrorMessage(nextErrorMessage);
      return;
    }

    setErrorMessage("");
    setIsGenerating(true);
    try {
      // taskApi.generateTaskChecklist는 실제 AI 체크리스트 생성 API를 호출합니다.
      // 이 API는 결과를 저장하지 않고 미리보기만 반환하므로, 아래 결과 화면에서
      // "저장하기"를 누르면 taskApi.createTask(태스크 최종 등록 API)로 이어서 저장합니다.
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
      setTaskTitleDraft(result.title || title.trim());
      // AI가 만든 체크리스트를 편집 가능한 상태로 복사해둡니다. 항목의 sequence는 화면/파일 매핑용
      // 내부 식별자로만 쓰고, 실제 등록 시 sequence는 화면에 보이는 순서(1부터)로 다시 매깁니다.
      setChecklistDraft(
        result.checklists.map((item) => ({
          sequence: item.sequence,
          title: item.title,
          instruction: item.instruction,
          completionType: item.completionType,
          rule: item.completionType === "PHOTO" ? (item.rule ?? "") : "",
        }))
      );
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.message === "그룹에 접근할 수 없습니다.") {
          setAccessDenied(true);
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

  const handleRegenerate = () => {
    clearReferencePhotos();
    setSaveError("");
    setGeneratedChecklist(null);
    setTaskTitleDraft("");
    setChecklistDraft([]);
  };

  const handleChecklistFieldChange = (sequence, field, value) => {
    setChecklistDraft((current) =>
      current.map((item) => (item.sequence === sequence ? { ...item, [field]: value } : item))
    );
    if (saveError) {
      setSaveError("");
    }
  };

  const handleToggleCompletionType = (sequence) => {
    setChecklistDraft((current) =>
      current.map((item) =>
        item.sequence === sequence
          ? { ...item, completionType: item.completionType === "PHOTO" ? "CHECK" : "PHOTO" }
          : item
      )
    );
    if (saveError) {
      setSaveError("");
    }
  };

  const handleSelectPhoto = (sequence, fileList) => {
    const file = fileList?.[0];
    if (!file) return;

    setReferencePhotos((current) => {
      const next = { ...current };
      if (next[sequence]) {
        URL.revokeObjectURL(next[sequence].previewUrl);
      }
      next[sequence] = { file, previewUrl: URL.createObjectURL(file) };
      return next;
    });
    if (saveError) {
      setSaveError("");
    }
  };

  const handleRemovePhoto = (sequence) => {
    setReferencePhotos((current) => {
      if (!current[sequence]) {
        return current;
      }
      const next = { ...current };
      URL.revokeObjectURL(next[sequence].previewUrl);
      delete next[sequence];
      return next;
    });
  };

  const handleSave = async () => {
    if (isSaving || !generatedChecklist) return;

    const trimmedTaskTitle = taskTitleDraft.trim();
    if (!trimmedTaskTitle) {
      setSaveError("태스크 제목을 입력해주세요.");
      return;
    }

    if (checklistDraft.some((item) => !item.title.trim() || !item.instruction.trim())) {
      setSaveError("모든 체크리스트 항목의 제목과 내용을 입력해주세요.");
      return;
    }

    if (photoChecklistItems.some((item) => !item.rule.trim())) {
      setSaveError("사진 검증으로 설정한 항목에는 검증 기준을 입력해주세요.");
      return;
    }

    if (missingPhotoCount > 0) {
      setSaveError("사진 검증 항목에는 기준 사진이 반드시 필요합니다. 모든 항목에 사진을 첨부해주세요.");
      return;
    }

    if (checklistDraft.length > TASK_CHECKLIST_MAX_LENGTH) {
      setSaveError(`체크리스트는 최대 ${TASK_CHECKLIST_MAX_LENGTH}개까지 등록할 수 있습니다. 다시 생성해 항목 수를 줄여주세요.`);
      return;
    }

    setSaveError("");
    setIsSaving(true);
    try {
      const referencePhotoFiles = [];
      const checklists = checklistDraft.map((item, index) => {
        const isPhoto = item.completionType === "PHOTO";

        return {
          // 백엔드는 sequence를 1부터 순서대로 요구합니다. 편집 중 내부적으로 쓰는 sequence(AI 생성 시
          // 부여된 값)를 그대로 보내지 않고 실제 등록 순서(index + 1)로 다시 매깁니다.
          sequence: index + 1,
          title: item.title.trim(),
          instruction: item.instruction.trim(),
          completionType: item.completionType,
          // CHECK 항목은 rule과 기준 사진을 사용할 수 없어 null로 보냅니다. PHOTO 항목만 rule과
          // referencePhotoIndex를 채웁니다.
          rule: isPhoto ? item.rule.trim() : null,
          referencePhotoIndex: isPhoto ? referencePhotoFiles.push(referencePhotos[item.sequence].file) - 1 : null,
        };
      });

      await createTask({
        groupId,
        managerId: user.memberId,
        title: trimmedTaskTitle,
        message: (generatedChecklist.message || message).trim(),
        workerId: assigneeId,
        dueAt: new Date(dueAt).toISOString(),
        checklists,
        referencePhotos: referencePhotoFiles,
      });

      window.sessionStorage.removeItem(getDraftStorageKey(groupId));
      navigate(`/groups/${groupId}`);
    } catch (error) {
      setSaveError(
        error instanceof ApiError
          ? error.message
          : "태스크 저장에 실패했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsSaving(false);
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
        <StatusState type="login" user={user} embedded />
      ) : isGroupLoading ? (
        <p className="group-grid__empty">그룹 정보를 불러오는 중이에요...</p>
      ) : !hasValidGroupId ? (
        <StatusState type="group" user={user} embedded />
      ) : !hasManagerAccess || accessDenied ? (
        <StatusState type="access" user={user} embedded description="현재 로그인한 계정으로는 이 그룹에서 태스크를 생성할 수 없습니다. 그룹에 다시 참여했는지 확인해주세요." />
      ) : generatedChecklist ? (
        <section className="page-card task-create-result">
          <div className="form-section-heading">
            <span>AI CHECKLIST</span>
            <input
              className="task-create-result__title-input"
              value={taskTitleDraft}
              onChange={(event) => setTaskTitleDraft(event.target.value)}
              placeholder={TASK_TITLE_PLACEHOLDER}
              maxLength={TASK_TITLE_MAX_LENGTH}
              disabled={isSaving}
              aria-label="태스크 제목"
            />
            {generatedChecklist.assigneeName || dueAt ? (
              <p>
                {generatedChecklist.assigneeName ? `담당자 ${generatedChecklist.assigneeName}` : ""}
                {generatedChecklist.assigneeName && dueAt ? " · " : ""}
                {dueAt ? `마감 ${new Date(dueAt).toLocaleString("ko-KR")}` : ""}
              </p>
            ) : null}
          </div>
          <ul className="task-create-checklist">
            {checklistDraft.map((item, index) => {
              const isPhoto = item.completionType === "PHOTO";
              return (
                <li key={item.sequence}>
                  <div className="task-create-checklist__top">
                    {/* 등록 시 실제로 전송되는 sequence(index + 1)와 화면에 보이는 번호를 일치시킵니다. */}
                    <span className="task-create-checklist__index">{index + 1}.</span>
                    <input
                      className="task-create-checklist__title-input"
                      value={item.title}
                      onChange={(event) => handleChecklistFieldChange(item.sequence, "title", event.target.value)}
                      placeholder="체크리스트 제목"
                      disabled={isSaving}
                      aria-label={`체크리스트 ${index + 1} 제목`}
                    />
                    <button
                      type="button"
                      className={`task-create-checklist__toggle ${isPhoto ? "is-on" : ""}`}
                      onClick={() => handleToggleCompletionType(item.sequence)}
                      disabled={isSaving}
                      aria-pressed={isPhoto}
                      title="사진 검증 사용 여부"
                    >
                      <span className="task-create-checklist__toggle-track"><span className="task-create-checklist__toggle-thumb" /></span>
                      {isPhoto ? "사진 검증" : "체크 검증"}
                    </button>
                  </div>
                  <textarea
                    className="task-create-checklist__instruction-input"
                    value={item.instruction}
                    onChange={(event) => handleChecklistFieldChange(item.sequence, "instruction", event.target.value)}
                    placeholder="수행 방법을 설명해주세요."
                    disabled={isSaving}
                    rows={2}
                    aria-label={`체크리스트 ${index + 1} 내용`}
                  />
                  {isPhoto && (
                    <>
                      <input
                        className="task-create-checklist__rule-input"
                        value={item.rule}
                        onChange={(event) => handleChecklistFieldChange(item.sequence, "rule", event.target.value)}
                        placeholder="검증 기준을 입력해주세요. 예: 원두 호퍼가 80% 이상 채워져 있어야 함"
                        disabled={isSaving}
                        aria-label={`체크리스트 ${index + 1} 검증 기준`}
                      />
                      <div className="task-create-checklist__photo">
                        {referencePhotos[item.sequence] ? (
                          <div className="task-create-photo-preview">
                            <img src={referencePhotos[item.sequence].previewUrl} alt={`${item.title} 기준 사진`} />
                            <div>
                              <strong>{referencePhotos[item.sequence].file.name}</strong>
                              <button type="button" onClick={() => handleRemovePhoto(item.sequence)} disabled={isSaving}>
                                <X size={12} /> 사진 제거
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className={`task-create-photo-upload ${isSaving ? "is-disabled" : ""}`}>
                            <Camera size={14} />
                            <span>기준 사진 첨부<em>*</em></span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isSaving}
                              onChange={(event) => handleSelectPhoto(item.sequence, event.target.files)}
                            />
                          </label>
                        )}
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>

          {saveError && (
            <p className="task-create-form__error" role="alert">{saveError}</p>
          )}

          <div className="task-create-result__actions">
            <button className="ghost-button" type="button" onClick={handleRegenerate} disabled={isSaving}>
              다시 생성하기
            </button>
            <button className="primary-button" type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "저장 중..." : <><Save size={15} /> 저장하기</>}
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
                <label className="field-label" htmlFor="task-due-at">마감 일시<span className="field-label__required">*</span></label>
                <input
                  className="text-input"
                  id="task-due-at"
                  type="datetime-local"
                  value={dueAt}
                  min={minDueAt}
                  onChange={(event) => setDueAt(event.target.value)}
                  required
                  disabled={isGenerating}
                />
                <div className="task-create-field__meta">
                  <span>담당자가 이 시간까지 체크리스트를 완료해야 합니다.</span>
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
