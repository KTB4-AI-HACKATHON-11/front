import { ArrowRight, Camera, Check, ChevronLeft, ShieldCheck, ShieldOff } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import AppShell from "../../components/AppShell";
import { members } from "../../data/mockData";
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

export default function TaskVerificationPage({ user }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const items = state?.items || fallbackItems;
  const workers = members.filter((member) => member.role === "WORKER");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [enabled, setEnabled] = useState(() => Object.fromEntries(items.map((item) => [item, true])));
  const [rules, setRules] = useState(() => Object.fromEntries(items.map((item) => [item, ""])));

  const toggleVerification = (item) => {
    setEnabled((current) => ({ ...current, [item]: !current[item] }));
  };

  const updateRule = (item, value) => {
    setRules((current) => ({ ...current, [item]: value }));
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!assignee) {
      return;
    }

    if (isInvalidDueDate(dueDate)) {
      window.alert("마감 일시는 현재 시각 이후부터 2035년 12월 31일까지 설정해주세요.");
      return;
    }

    const hasInvalidRule = items.some((item) => enabled[item] && !rules[item].trim());
    if (hasInvalidRule) {
      window.alert("검증을 사용하는 항목은 검증 기준을 입력해주세요.");
      return;
    }

    const hasRuleTooLong = items.some((item) => enabled[item] && rules[item].trim().length > VERIFICATION_RULE_MAX_LENGTH);
    if (hasRuleTooLong) {
      window.alert(`검증 기준은 ${VERIFICATION_RULE_MAX_LENGTH}자 이하로 입력해주세요.`);
      return;
    }

    // TODO: 담당 워커, 마감일시, TASK_ID, SUB_TASK_ID별 검증 설정을 서버에 저장해야 합니다.
    navigate("/tasks/task-101");
  };

  return (
    <AppShell user={user} title="태스크 검증 설정" description={state?.taskTitle || "오픈 전 매장 점검"} backTo="/tasks/new">
      <div className="task-verification-page">
        <form className="task-verification-form" onSubmit={handleSave}>
          <div className="task-verification-form__heading">
            <span><ShieldCheck size={14} /> AI CHECKLIST</span>
            <h2>체크리스트별 검증 기준</h2>
            <p>각 항목이 완료되었다고 판단할 기준을 설정해주세요.</p>
          </div>

          <div className="task-verification-assignment">
            <div className="task-verification-assignment__field">
              <label className="field-label" htmlFor="task-assignee">담당자<span className="field-label__required">*</span></label>
              <select className="text-input" id="task-assignee" value={assignee} onChange={(event) => setAssignee(event.target.value)} required>
                <option value="" disabled>워커를 선택해주세요</option>
                {workers.map((worker) => <option value={worker.name} key={worker.id}>{worker.name}</option>)}
              </select>
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
                onChange={(event) => setDueDate(formatDueDateInput(event.target.value))}
                required
              />
              <small className="task-verification-assignment__hint">
                숫자로 바로 입력할 수 있습니다. 예: `202608211530` 또는 `2026-08-21 15:30`
              </small>
            </div>
          </div>

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
                      onChange={(event) => updateRule(item, event.target.value)}
                      placeholder="예: 입구 유리문에 얼룩이 없어야 합니다."
                      maxLength={VERIFICATION_RULE_MAX_LENGTH}
                      required
                    />
                    <small>{rules[item].length}/{VERIFICATION_RULE_MAX_LENGTH}</small>
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
