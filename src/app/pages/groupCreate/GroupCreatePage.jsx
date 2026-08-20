import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useBeforeUnload } from "react-router";
import { useNavigate } from "react-router";
import AppShell from "../../components/AppShell";
import StatusState from "../../components/StatusState";
import GroupGuide from "./components/GroupGuide";
import { ApiError } from "../../api/client";
import { createGroup } from "../../api/groupApi";
import { formatGroupId, saveCreatedGroup } from "../../lib/groupStorage";
import "./GroupCreatePage.css";

const GROUP_NAME_MAX_LENGTH = 50;
const GROUP_DESCRIPTION_MAX_LENGTH = 200;
const GROUP_NAME_PLACEHOLDER = "예: 성수 플래그십 스토어";
const GROUP_DESCRIPTION_PLACEHOLDER = "예: 오픈 준비부터 마감 점검까지 매장 운영 업무를 함께 관리합니다.";
const GROUP_CREATE_DRAFT_KEY = "checkon-group-create-draft";

function loadGroupDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawDraft = window.sessionStorage.getItem(GROUP_CREATE_DRAFT_KEY);
    return rawDraft ? JSON.parse(rawDraft) : null;
  } catch {
    return null;
  }
}

function hasGroupDraftValue({ groupName, groupDescription }) {
  return Boolean(groupName.trim() || groupDescription.trim());
}

function validateGroupCreateForm({ groupName, groupDescription, memberId }) {
  const trimmedGroupName = groupName.trim();
  const trimmedGroupDescription = groupDescription.trim();

  if (!memberId) {
    return "로그인 정보가 없어 그룹을 생성할 수 없습니다. 다시 로그인해주세요.";
  }

  if (!trimmedGroupName) {
    return "그룹명을 입력해주세요.";
  }

  if (trimmedGroupName.length > GROUP_NAME_MAX_LENGTH) {
    return `그룹명은 ${GROUP_NAME_MAX_LENGTH}자 이하로 입력해주세요.`;
  }

  if (trimmedGroupDescription.length > GROUP_DESCRIPTION_MAX_LENGTH) {
    return `그룹 설명은 ${GROUP_DESCRIPTION_MAX_LENGTH}자 이하로 입력해주세요.`;
  }

  return "";
}

export default function GroupCreatePage({ user }) {
  const navigate = useNavigate();
  const draft = loadGroupDraft();
  const [groupName, setGroupName] = useState(draft?.groupName ?? "");
  const [groupDescription, setGroupDescription] = useState(draft?.groupDescription ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const hasUnsavedChanges = hasGroupDraftValue({ groupName, groupDescription });
  const isFormReady = Boolean(groupName.trim());

  useEffect(() => {
    if (!hasGroupDraftValue({ groupName, groupDescription })) {
      window.sessionStorage.removeItem(GROUP_CREATE_DRAFT_KEY);
      return;
    }

    window.sessionStorage.setItem(
      GROUP_CREATE_DRAFT_KEY,
      JSON.stringify({ groupName, groupDescription })
    );
  }, [groupDescription, groupName]);

  useBeforeUnload((event) => {
    if (!hasUnsavedChanges) {
      return;
    }

    event.preventDefault();
    event.returnValue = "";
  });

  const confirmDiscardChanges = () => {
    if (!hasUnsavedChanges || isSubmitting) {
      return true;
    }

    return window.confirm("작성 중인 내용이 있습니다. 이 페이지를 벗어나면 저장되지 않은 변경사항이 사라질 수 있습니다. 이동할까요?");
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrorMessage = validateGroupCreateForm({
      groupName,
      groupDescription,
      memberId: user?.memberId,
    });
    if (nextErrorMessage) {
      setErrorMessage(nextErrorMessage);
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const { groupId } = await createGroup({
        managerId: user.memberId,
        name: groupName.trim(),
        description: groupDescription.trim(),
      });
      const formattedGroupId = formatGroupId(groupId);
      saveCreatedGroup({
        id: formattedGroupId,
        name: groupName.trim(),
        description: groupDescription.trim() || "새로 만든 업무 그룹입니다.",
      });
      window.sessionStorage.removeItem(GROUP_CREATE_DRAFT_KEY);
      navigate(`/groups/${formattedGroupId}`);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "그룹 생성에 실패했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user?.memberId) {
    return <StatusState type="login" user={user} description="로그인 정보가 없어 그룹을 생성할 수 없습니다. 로그인 후 다시 시도해주세요." />;
  }

  return (
    <AppShell
      user={user}
      title="새 그룹 만들기"
      description="새로운 업무 공간을 만들고, 다음 단계에서 멤버를 초대할 수 있습니다."
      backTo="/groups"
      onBeforeNavigate={confirmDiscardChanges}
      breadcrumbs={[
        { label: "내 그룹", path: "/groups" },
        { label: "새 그룹 만들기", path: "/groups/new", current: true },
      ]}
    >
      <div className="group-create-layout">
        <section className="page-card group-create-form-card">
          <div className="form-section-heading">
            <span>GROUP SETUP</span>
            <h2>그룹 정보를 입력해주세요</h2>
            <p>그룹명은 멤버들이 가장 먼저 확인하는 이름입니다.</p>
            <div className="group-create-stepper" aria-label="그룹 생성 진행 상태">
              <div className={`group-create-step ${isFormReady ? "is-current" : "is-active"}`}>
                <span>1</span>
                <strong>기본 정보</strong>
              </div>
              <div className={`group-create-step ${isFormReady ? "is-active" : ""} ${isSubmitting ? "is-current" : ""}`}>
                <span>2</span>
                <strong>그룹 생성</strong>
              </div>
              <div className="group-create-step">
                <span>3</span>
                <strong>멤버 초대</strong>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreate}>
            <div className="group-create-field">
              <label className="field-label" htmlFor="group-name">그룹명<span className="field-label__required">*</span></label>
              <input
                className="text-input"
                id="group-name"
                placeholder={GROUP_NAME_PLACEHOLDER}
                maxLength={GROUP_NAME_MAX_LENGTH}
                required
                value={groupName}
                onChange={(event) => {
                  setGroupName(event.target.value);
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                disabled={isSubmitting}
              />
              <div className="group-create-field__meta">
                <span>팀, 매장, 프로젝트처럼 업무 단위를 알기 쉽게 적어주세요.</span>
                <strong>{groupName.length}/{GROUP_NAME_MAX_LENGTH}</strong>
              </div>
            </div>
            <div className="group-create-field">
              <label className="field-label" htmlFor="group-description">그룹 설명</label>
              <textarea
                className="text-area"
                id="group-description"
                placeholder={GROUP_DESCRIPTION_PLACEHOLDER}
                maxLength={GROUP_DESCRIPTION_MAX_LENGTH}
                value={groupDescription}
                onChange={(event) => {
                  setGroupDescription(event.target.value);
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                disabled={isSubmitting}
              />
              <div className="group-create-field__meta">
                <span>이 그룹에서 함께 관리할 업무 범위를 간단히 설명해주세요.</span>
                <strong>{groupDescription.length}/{GROUP_DESCRIPTION_MAX_LENGTH}</strong>
              </div>
            </div>

            {errorMessage && (
              <p className="group-create-form__error" role="alert">{errorMessage}</p>
            )}

            <div className="group-create-form-actions">
              <button type="button" className="secondary-button" onClick={() => navigate("/groups")} disabled={isSubmitting}>취소</button>
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? "생성 중..." : <>그룹 생성 <ArrowRight size={16} /></>}
              </button>
            </div>
          </form>
        </section>
        <GroupGuide />
      </div>
    </AppShell>
  );
}
