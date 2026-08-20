import { ArrowRight, Camera, Check, ChevronLeft, ShieldCheck, ShieldOff } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import AppShell from "../../components/AppShell";
import "./TaskVerificationPage.css";

const fallbackItems = [
  "출입구와 유리문 청결 상태 확인",
  "조명과 디지털 사이니지 전원 켜기",
  "계산대 시재와 영수증 용지 확인",
  "메인 테이블 상품 진열 상태 확인",
  "오픈 준비가 끝난 매장 전경 촬영",
];

export default function TaskVerificationPage({ user }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const items = state?.items || fallbackItems;
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
    // TODO: TASK_ID, SUB_TASK_ID별 검증 설정을 서버에 저장하고 태스크 상세로 이동해야 합니다.
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
                      required
                    />
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
