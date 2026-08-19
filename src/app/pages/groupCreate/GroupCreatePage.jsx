import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import AppShell from "../../components/AppShell";
import GroupGuide from "./components/GroupGuide";
import "./GroupCreatePage.css";

export default function GroupCreatePage({ user }) {
  const navigate = useNavigate();

  const handleCreate = (event) => {
    event.preventDefault();
    // TODO: 그룹 생성 API에 그룹명과 설명을 전달하고 생성된 GROUP_ID를 받아야 합니다.
    navigate("/groups/group-1");
  };

  return (
    <AppShell user={user} title="새 그룹 만들기" description="함께 업무를 관리할 그룹을 생성합니다." backTo="/groups">
      <div className="group-create-layout">
        <section className="page-card group-create-form-card">
          <div className="form-section-heading">
            <span>기본 정보</span>
            <h2>그룹 정보를 입력해주세요</h2>
            <p>그룹명은 멤버들이 가장 먼저 확인하는 이름입니다.</p>
          </div>

          <form onSubmit={handleCreate}>
            <div className="group-create-field">
              <label className="field-label" htmlFor="group-name">그룹명<span className="field-label__required">*</span></label>
              <input className="text-input" id="group-name" placeholder="예: 성수 플래그십 스토어" required />
              <p className="field-hint">팀, 매장, 프로젝트처럼 업무가 진행되는 단위를 입력하세요.</p>
            </div>
            <div className="group-create-field">
              <label className="field-label" htmlFor="group-description">그룹 설명</label>
              <input className="text-input" id="group-description" placeholder="그룹에서 함께 진행할 업무를 간단히 설명해주세요." />
            </div>

            <div className="group-create-form-actions">
              <button type="button" className="secondary-button" onClick={() => navigate("/groups")}>취소</button>
              <button type="submit" className="primary-button">그룹 생성 <ArrowRight size={16} /></button>
            </div>
          </form>
        </section>
        <GroupGuide />
      </div>
    </AppShell>
  );
}
