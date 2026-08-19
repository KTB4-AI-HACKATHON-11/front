import { FolderPlus, ListChecks, UserPlus } from "lucide-react";

const steps = [
  { icon: FolderPlus, title: "그룹 생성", text: "팀이나 현장 단위로 업무 공간을 만듭니다." },
  { icon: UserPlus, title: "멤버 초대", text: "생성 후 워커를 그룹에 초대할 수 있어요." },
  { icon: ListChecks, title: "태스크 배정", text: "자연어로 태스크와 체크리스트를 만듭니다." },
];

export default function GroupGuide() {
  return (
    <aside className="group-guide">
      <span className="group-guide__label">GROUP SETUP</span>
      <h2>하나의 그룹에서<br />업무를 함께 확인하세요.</h2>
      <p>그룹 생성 후 멤버와 태스크를 추가할 수 있습니다.</p>
      <div className="group-guide__steps">
        {steps.map(({ icon: Icon, title, text }, index) => (
          <div className="group-guide__step" key={title}>
            <span><Icon size={17} /></span>
            <div><small>0{index + 1}</small><strong>{title}</strong><p>{text}</p></div>
          </div>
        ))}
      </div>
    </aside>
  );
}
