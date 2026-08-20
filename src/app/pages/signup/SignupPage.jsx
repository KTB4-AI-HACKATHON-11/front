import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router";
import BrandMark from "../../components/BrandMark";
import NicknamePreview from "./components/NicknamePreview";
import RoleSelector from "./components/RoleSelector";
import { ApiError } from "../../api/client";
import { signupMember } from "../../api/memberApi";
import "./SignupPage.css";

export default function SignupPage({ onSignup }) {
  const navigate = useNavigate();
  const [role, setRole] = useState("MANAGER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const nickname = (formData.get("nickname") ?? "").toString().trim();

    if (!nickname) {
      setErrorMessage("닉네임을 입력해주세요.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const member = await signupMember({ nickname, role });
      onSignup({
        memberId: member.memberId,
        nickname: member.nickname,
        role: member.role,
      });
      navigate("/groups");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <header className="signup-page__header">
        <Link className="signup-page__brand" to="/"><BrandMark compact /></Link>
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
            <input
              className="text-input"
              id="signup-nickname"
              name="nickname"
              placeholder="예: 민준"
              maxLength={30}
              required
              disabled={isSubmitting}
            />
            <p className="field-hint">그룹의 멤버 목록과 태스크 담당자 이름으로 표시됩니다.</p>
          </div>

          <fieldset className="signup-role-fieldset" disabled={isSubmitting}>
            <legend>역할 선택<span className="field-label__required">*</span></legend>
            <RoleSelector value={role} onChange={setRole} />
          </fieldset>

          {errorMessage && (
            <p className="signup-form__error" role="alert">{errorMessage}</p>
          )}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "가입 처리 중..." : <>회원가입 완료 <ArrowRight size={17} /></>}
          </button>
        </form>
      </main>
    </div>
  );
}
