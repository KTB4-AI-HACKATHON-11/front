import { GripVertical, Plus, Sparkles, Trash2 } from "lucide-react";

const previewItems = [
  "출입구와 유리문 청결 상태 확인",
  "조명과 디지털 사이니지 전원 켜기",
  "계산대 시재와 영수증 용지 확인",
  "메인 테이블 상품 진열 상태 확인",
  "오픈 준비가 끝난 매장 전경 촬영",
];

export default function GeneratedChecklist() {
  return (
    <section className="generated-checklist page-card">
      <div className="generated-checklist__heading">
        <div><span><Sparkles size={13} /> AI 생성 미리보기</span><h2>생성될 체크리스트</h2></div>
        <small>예상 5개</small>
      </div>
      <div className="generated-checklist__items">
        {previewItems.map((item, index) => (
          <div className="generated-checklist__item" key={item}>
            <GripVertical size={14} />
            <span>{index + 1}</span>
            <p>{item}</p>
            <button className="icon-button" title="항목 삭제"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
      <button className="generated-checklist__add"><Plus size={14} /> 직접 항목 추가</button>
      <p className="generated-checklist__notice">실제 목록은 GPT 응답 후 표시되며, 생성 전에 자유롭게 수정할 수 있습니다.</p>
    </section>
  );
}
