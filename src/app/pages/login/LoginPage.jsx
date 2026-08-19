import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router";
import BrandMark from "../../components/BrandMark";
import LoginPreview from "./components/LoginPreview";
import { ApiError } from "../../api/client";
import "./LoginPage.css";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") ?? "").toString().trim();
    const password = (formData.get("password") ?? "").toString();

    if (!email || !password) {
      setErrorMessage("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);
    try {
      // TODO: 로그인 API 연동 (백엔드 로그인 엔드포인트 확정 후 memberApi.js에 loginMember 추가하여 교체)
      // const member = await loginMember({ email, password });
      const member = { nickname: "민준", email };

      onLogin({
        nickname: member.nickname,
        email: member.email,
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
        <div className="auth-layout__brand"><BrandMark /></div>
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
          <div className="auth-panel__mobile-brand"><BrandMark compact /></div>
          <div className="auth-panel__heading">
            <span>WELCOME BACK</span>
            <h2>로그인</h2>
            <p>계속하려면 계정 정보를 입력해주세요.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="auth-field">
              <label className="field-label" htmlFor="login-email">이메일</label>
              <input
                className="text-input"
                id="login-email"
                name="email"
                type="email"
                placeholder="you@checkon.team"
                autoComplete="email"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="auth-field">
              <div className="auth-field__label-row">
                <label className="field-label" htmlFor="login-password">비밀번호</label>
                <button type="button">비밀번호 찾기</button>
              </div>
              <div className="password-input">
                <input
                  className="text-input"
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력해주세요"
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                />
                <button type="button" title="비밀번호 표시" onClick={() => setShowPassword((current) => !current)}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
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
