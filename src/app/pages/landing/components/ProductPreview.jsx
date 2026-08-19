import { Camera, Check, Sparkles } from "lucide-react";

const checklist = [
  { label: "출입구 청결 상태 확인", done: true },
  { label: "조명과 사이니지 전원 켜기", done: true },
  { label: "계산대 시재 확인", done: true },
  { label: "오픈 준비 매장 전경 촬영", done: false, photo: true },
];

export default function ProductPreview() {
  return (
    <div className="landing-preview" aria-label="CheckOn 태스크 화면 미리보기">
      <div className="landing-preview__topbar">
        <div><i /><i /><i /></div>
        <span>성수 플래그십 스토어</span>
        <small>오늘 09:30</small>
      </div>
      <div className="landing-preview__body">
        <aside>
          <span className="landing-preview__logo"><Check size={13} strokeWidth={3} /></span>
          <i className="is-active" /><i /><i />
        </aside>
        <div className="landing-preview__main">
          <div className="landing-preview__heading">
            <div><small>TASK_ID · 101</small><strong>오픈 전 매장 점검</strong></div>
            <span>67%</span>
          </div>
          <div className="landing-preview__ai"><Sparkles size={13} /> AI가 업무 설명을 6개의 체크리스트로 정리했어요.</div>
          <div className="landing-preview__list">
            {checklist.map((item, index) => (
              <div className={item.done ? "is-done" : ""} key={item.label}>
                <span>{item.done && <Check size={11} strokeWidth={3} />}</span>
                <p><small>0{index + 1}</small>{item.label}</p>
                {item.photo && <em><Camera size={10} /> 사진 검증</em>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
