import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router";
import BrandMark from "../../components/BrandMark";
import LoginPreview from "./components/LoginPreview";
import { ApiError } from "../../api/client";
import { loginMember } from "../../api/memberApi";
import "./LoginPage.css";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event) => {
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
      const member = await loginMember({ nickname });

      onLogin({
        memberId: member.memberId,
        nickname: member.nickname,
        role: member.role,
      });
      navigate("/groups");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "로그인에 실패했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-layout__visual">
        <Link className="auth-layout__brand" to="/"><BrandMark /></Link>
        <div className="auth-visual-copy">
          <span className="auth-kicker">TEAM TASK CHECK</span>
          <h1>해야 할 일을 분명하게,<br />완료 확인은 정확하게.</h1>
          <p>CheckOn에서 팀의 업무를 체크리스트로 만들고<br />현장의 완료 여부를 한눈에 확인하세요.</p>
        </div>
        <LoginPreview />
        <p className="auth-layout__copyright">© 2026 CheckOn</p>
      </section>

      <main className="auth-panel">
        <div className="auth-panel__inner">
          <Link className="auth-panel__mobile-brand" to="/"><BrandMark compact /></Link>
          <div className="auth-panel__heading">
            <span>WELCOME BACK</span>
            <h2>로그인</h2>
            <p>계속하려면 계정 정보를 입력해주세요.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="auth-field">
              <label className="field-label" htmlFor="login-nickname">닉네임</label>
              <input
                className="text-input"
                id="login-nickname"
                name="nickname"
                placeholder="지아나"
                autoComplete="username"
                maxLength={30}
                required
                disabled={isSubmitting}
              />
            </div>

            {errorMessage && (
              <p className="auth-form__error" role="alert">{errorMessage}</p>
            )}

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "로그인 중..." : <>로그인 <ArrowRight size={17} /></>}
            </button>
          </form>

          <p className="auth-switch">아직 계정이 없나요? <Link to="/signup">회원가입</Link></p>
        </div>
      </main>
    </div>
  );
}
