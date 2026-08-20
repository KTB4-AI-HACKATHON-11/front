import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import AppShell from "../../components/AppShell";
import GroupGuide from "./components/GroupGuide";
import "./GroupCreatePage.css";

const GROUP_DESCRIPTION_MAX_LENGTH = 200;

export default function GroupCreatePage({ user }) {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  const handleCreate = (event) => {
    event.preventDefault();

    // 추후 그룹 생성 API에 전달할 요청 payload
    const groupCreatePayload = {
      name: groupName.trim(),
      description: groupDescription.trim(),
    };

    // TODO: 그룹 생성 API 연동
    // - 요청: groupCreatePayload 를 body로 전달
    // - 응답: 생성된 그룹의 GROUP_ID를 받아 아래 groupId 변수에 대입
    // 예)
    //   const { data } = await createGroup(groupCreatePayload);
    //   const groupId = data.groupId;
    const groupId = "group-1"; // TODO: API 응답의 GROUP_ID로 교체 (현재는 임시 목업 값)

    console.log("[GroupCreatePage] 그룹 생성 요청 예정 payload", groupCreatePayload);
    navigate(`/groups/${groupId}`);
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
              <input
                className="text-input"
                id="group-name"
                placeholder="예: 성수 플래그십 스토어"
                required
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
              />
              <p className="field-hint">팀, 매장, 프로젝트처럼 업무가 진행되는 단위를 입력하세요.</p>
            </div>
            <div className="group-create-field">
              <label className="field-label" htmlFor="group-description">그룹 설명</label>
              <textarea className="text-area" id="group-description" placeholder="그룹에서 함께 진행할 업무를 간단히 설명해주세요." />
              <div className="character-count">0 / 200</div>
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
