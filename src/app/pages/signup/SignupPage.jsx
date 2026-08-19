import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router";
import BrandMark from "../../components/BrandMark";
import NicknamePreview from "./components/NicknamePreview";
import RoleSelector from "./components/RoleSelector";
import "./SignupPage.css";

export default function SignupPage({ onSignup }) {
  const navigate = useNavigate();
  const [role, setRole] = useState("MANAGER");

  const handleSignup = (event) => {
    event.preventDefault();
    // TODO: 회원가입 API에 닉네임과 선택한 역할을 전달하고 생성된 계정 정보를 저장해야 합니다.
    const formData = new FormData(event.currentTarget);
    onSignup({
      nickname: formData.get("nickname") || "새 사용자",
      role,
    });
    navigate("/groups");
  };

  return (
    <div className="signup-page">
      <header className="signup-page__header">
        <BrandMark compact />
        <Link to="/login"><ArrowLeft size={15} /> 로그인으로</Link>
      </header>

      <main className="signup-form-wrap">
        <div className="signup-heading">
          <span>CREATE ACCOUNT</span>
          <h1>CheckOn 시작하기</h1>
          <p>CheckOn에서 사용할 닉네임을 입력해주세요.</p>
        </div>

        <form onSubmit={handleSignup} className="signup-form">
          <NicknamePreview />
          <div className="signup-nickname-field">
            <label className="field-label" htmlFor="signup-nickname">닉네임<span className="field-label__required">*</span></label>
            <input className="text-input" id="signup-nickname" name="nickname" placeholder="예: 민준" required />
            <p className="field-hint">그룹의 멤버 목록과 태스크 담당자 이름으로 표시됩니다.</p>
          </div>

          <fieldset className="signup-role-fieldset">
            <legend>역할 선택<span className="field-label__required">*</span></legend>
            <RoleSelector value={role} onChange={setRole} />
          </fieldset>

          <button className="auth-submit" type="submit">회원가입 완료 <ArrowRight size={17} /></button>
        </form>
      </main>
    </div>
  );
}
