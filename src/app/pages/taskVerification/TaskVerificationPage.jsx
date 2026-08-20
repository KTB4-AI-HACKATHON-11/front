import { ArrowRight, Camera, Check, ChevronLeft, ShieldCheck, ShieldOff } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import AppShell from "../../components/AppShell";
import { groups, members, tasks } from "../../data/mockData";
import "./TaskVerificationPage.css";

const fallbackItems = [
  "출입구와 유리문 청결 상태 확인",
  "조명과 디지털 사이니지 전원 켜기",
  "계산대 시재와 영수증 용지 확인",
  "메인 테이블 상품 진열 상태 확인",
  "오픈 준비가 끝난 매장 전경 촬영",
];
const VERIFICATION_RULE_MAX_LENGTH = 300;
const MAX_DUE_DATE = "2035-12-31T23:59";
const DUE_DATE_PLACEHOLDER = "YYYY-MM-DD HH:mm";

function formatDueDateInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 12);

  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  if (digits.length <= 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  }

  if (digits.length <= 10) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)} ${digits.slice(8)}`;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)} ${digits.slice(8, 10)}:${digits.slice(10, 12)}`;
}

function parseDueDate(value) {
  const matched = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/);

  if (!matched) {
    return null;
  }

  const [, yearText, monthText, dayText, hourText, minuteText] = matched;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const parsedDate = new Date(year, month - 1, day, hour, minute);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day ||
    parsedDate.getHours() !== hour ||
    parsedDate.getMinutes() !== minute
  ) {
    return null;
  }

  return parsedDate;
}

function isInvalidDueDate(value) {
  const selectedDate = parseDueDate(value);
  if (!selectedDate) {
    return true;
  }

  const now = new Date();
  const maxDate = parseDueDate(MAX_DUE_DATE);
  return selectedDate < now || selectedDate > maxDate;
}

function validateVerificationForm({ assigneeId, dueDate, items, enabled, rules }) {
  if (!assigneeId) {
    return "담당자를 선택해주세요.";
  }

  if (!dueDate.trim()) {
    return "마감 일시를 입력해주세요.";
  }

  if (isInvalidDueDate(dueDate)) {
    return "마감 일시는 현재 시각 이후부터 2035년 12월 31일까지 설정해주세요.";
  }

  const hasInvalidRule = items.some((item) => enabled[item] && !rules[item].trim());
  if (hasInvalidRule) {
    return "검증을 사용하는 항목은 검증 기준을 입력해주세요.";
  }

  const hasRuleTooLong = items.some((item) => enabled[item] && rules[item].trim().length > VERIFICATION_RULE_MAX_LENGTH);
  if (hasRuleTooLong) {
    return `검증 기준은 ${VERIFICATION_RULE_MAX_LENGTH}자 이하로 입력해주세요.`;
  }

  return "";
}

export default function TaskVerificationPage({ user }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const currentTask = tasks.find((task) => task.title === state?.taskTitle) ?? tasks[0];
  const currentGroup = groups[0];
  const items = state?.items || fallbackItems;
  const workers = members.filter((member) => member.role === "WORKER");
  const defaultAssigneeId = workers[0]?.id ?? "";
  const [assigneeId, setAssigneeId] = useState(defaultAssigneeId);
  const [dueDate, setDueDate] = useState("");
  const [enabled, setEnabled] = useState(() => Object.fromEntries(items.map((item) => [item, true])));
  const [rules, setRules] = useState(() => Object.fromEntries(items.map((item) => [item, ""])));
  const [errorMessage, setErrorMessage] = useState("");

  const toggleVerification = (item) => {
    setEnabled((current) => ({ ...current, [item]: !current[item] }));
  };

  const updateRule = (item, value) => {
    setRules((current) => ({ ...current, [item]: value }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    const nextErrorMessage = validateVerificationForm({ assigneeId, dueDate, items, enabled, rules });
    if (nextErrorMessage) {
      setErrorMessage(nextErrorMessage);
      return;
    }

    setErrorMessage("");
    // TODO: 담당 워커, 마감일시, TASK_ID, SUB_TASK_ID별 검증 설정을 서버에 저장해야 합니다.
    navigate("/tasks/task-101");
  };

  return (
    <AppShell
      user={user}
      title="검증 기준 설정"
      description={`${currentTask.title}의 완료 기준과 담당자를 최종 설정합니다.`}
      backTo={`/tasks/${currentTask.id}`}
      breadcrumbs={[
        { label: "내 그룹", path: "/groups" },
        { label: currentGroup.name, path: `/groups/${currentGroup.id}` },
        { label: currentTask.title, path: `/tasks/${currentTask.id}` },
        { label: "검증 기준 설정", path: `/tasks/${currentTask.id}/verification`, current: true },
      ]}
    >
      <div className="task-verification-page">
        <form className="task-verification-form" onSubmit={handleSave}>
          <div className="task-verification-form__heading">
            <span><ShieldCheck size={14} /> AI CHECKLIST</span>
            <h2>{currentTask.title} 검증 기준</h2>
            <p>각 체크리스트를 어떤 방식으로 완료 처리할지 마지막 기준을 정리합니다.</p>
          </div>

          <div className="task-verification-assignment">
            <div className="task-verification-assignment__field">
              <label className="field-label">담당자<span className="field-label__required">*</span></label>
              <div className="task-verification-assignees" role="radiogroup" aria-label="담당자 선택">
                {workers.map((worker) => (
                  <button
                    key={worker.id}
                    type="button"
                    className={`task-verification-assignee ${assigneeId === worker.id ? "is-selected" : ""}`}
                    onClick={() => setAssigneeId(worker.id)}
                    aria-pressed={assigneeId === worker.id}
                  >
                    <span className={`member-avatar member-avatar--${worker.color}`}>{worker.initial}</span>
                    <strong>{worker.name}</strong>
                    <small>알바</small>
                  </button>
                ))}
              </div>
              <div className="task-verification-assignment__meta">
                <span>체크리스트를 실제로 수행할 멤버를 선택해주세요.</span>
                <strong>{workers.length}명</strong>
              </div>
            </div>
            <div className="task-verification-assignment__field">
              <label className="field-label" htmlFor="task-due-date">마감일시<span className="field-label__required">*</span></label>
              <input
                className="text-input"
                id="task-due-date"
                type="text"
                value={dueDate}
                inputMode="numeric"
                placeholder={DUE_DATE_PLACEHOLDER}
                onChange={(event) => {
                  setDueDate(formatDueDateInput(event.target.value));
                  if (errorMessage) {
                    setErrorMessage("");
                  }
                }}
                required
              />
              <small className="task-verification-assignment__hint">
                숫자로 바로 입력할 수 있습니다. 예: 202608211530 또는 2026-08-21 15:30
              </small>
            </div>
          </div>

          {errorMessage && (
            <p className="task-verification-form__error" role="alert">{errorMessage}</p>
          )}

          <div className="task-verification-items">
            {items.map((item, index) => (
              <section className="task-verification-item page-card" key={item}>
                <div className="task-verification-item__top">
                  <span className="task-verification-item__number">{index + 1}</span>
                  <strong>{item}</strong>
                  <button
                    type="button"
                    className={`switch-control ${enabled[item] ? "switch-control--on" : ""}`}
                    onClick={() => toggleVerification(item)}
                    aria-label={`${item} 검증 기능 사용 여부`}
                    title={enabled[item] ? "검증 끄기" : "검증 켜기"}
                  ><span /></button>
                </div>

                {enabled[item] ? (
                  <div className="task-verification-item__body">
                    <div className="task-verification-method">
                      <span><Camera size={16} /></span>
                      <div><strong>사진 촬영으로 검증</strong><small>현장 사진으로 완료 여부를 확인합니다.</small></div>
                    </div>
                    <label className="field-label" htmlFor={`verification-rule-${index}`}>검증 기준<span className="field-label__required">*</span></label>
                    <textarea
                      className="text-area"
                      id={`verification-rule-${index}`}
                      value={rules[item]}
                      onChange={(event) => {
                        updateRule(item, event.target.value);
                        if (errorMessage) {
                          setErrorMessage("");
                        }
                      }}
                      placeholder="예: 입구 유리문에 얼룩이 없어야 합니다."
                      maxLength={VERIFICATION_RULE_MAX_LENGTH}
                      required
                    />
                    <div className="task-verification-item__meta">
                      <span>현장에서 확인할 수 있게 짧고 구체적으로 적어주세요.</span>
                      <strong>{rules[item].length}/{VERIFICATION_RULE_MAX_LENGTH}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="task-verification-item__disabled"><ShieldOff size={16} /><span>검증 없음</span></div>
                )}
              </section>
            ))}
          </div>

          <div className="task-verification-form__actions">
            <button className="ghost-button" type="button" onClick={() => navigate(-1)}><ChevronLeft size={15} /> 이전</button>
            <button className="primary-button" type="submit"><Check size={15} /> 검증 기준 저장 <ArrowRight size={15} /></button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
