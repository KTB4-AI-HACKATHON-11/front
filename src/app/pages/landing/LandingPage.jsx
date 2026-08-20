import { ArrowRight, Camera, ListChecks, Sparkles, UsersRound } from "lucide-react";
import { Link } from "react-router";
import BrandMark from "../../components/BrandMark";
import ProductPreview from "./components/ProductPreview";
import "./LandingPage.css";

const features = [
  { icon: Sparkles, number: "01", title: "말로 만드는 태스크", text: "업무 요구사항을 자연어로 입력하면 AI가 바로 수행할 수 있는 체크리스트로 나눕니다." },
  { icon: UsersRound, number: "02", title: "그룹별 역할 관리", text: "같은 사람도 그룹에 따라 매니저 또는 워커로 참여하고 필요한 업무만 확인합니다." },
  { icon: Camera, number: "03", title: "확실한 완료 검증", text: "사진이나 텍스트 기준을 설정해 현장에서 업무가 제대로 끝났는지 확인합니다." },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <Link className="landing-header__brand" to="/"><BrandMark compact /></Link>
        <nav aria-label="랜딩 메뉴">
          <a href="#features">기능</a>
          <a href="#workflow">사용 방법</a>
        </nav>
        <div className="landing-header__actions">
          <Link className="landing-login" to="/login">로그인</Link>
          <Link className="primary-button" to="/signup">무료로 시작하기</Link>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <span className="landing-eyebrow"><Sparkles size={12} /> AI TASK CHECK</span>
            <h1>CheckOn</h1>
            <h2>해야 할 일부터<br />완료 확인까지 한 번에.</h2>
            <p>말로 설명한 업무를 체크리스트로 만들고,<br />팀의 수행 여부를 정확하게 확인하세요.</p>
            <div className="landing-hero__actions">
              <Link className="landing-main-cta" to="/signup">무료로 시작하기 <ArrowRight size={16} /></Link>
              <Link className="landing-demo-cta" to="/login">화면 둘러보기</Link>
            </div>
            <div className="landing-hero__proof">
              <span><ListChecks size={14} /> 자연어 체크리스트</span>
              <span><Camera size={14} /> 사진 검증</span>
              <span><UsersRound size={14} /> 그룹별 역할</span>
            </div>
          </div>
          <div className="landing-hero__visual"><ProductPreview /></div>
        </section>

        <section className="landing-features" id="features">
          <div className="landing-section-heading">
            <span>WHAT CHECKON DOES</span>
            <h2>말로 전달하던 업무를<br />확인 가능한 과정으로 바꿉니다.</h2>
          </div>
          <div className="landing-feature-grid">
            {features.map(({ icon: Icon, number, title, text }) => (
              <article key={number}>
                <div><span><Icon size={19} /></span><small>{number}</small></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-workflow" id="workflow">
          <div className="landing-workflow__copy">
            <span>ONE SIMPLE FLOW</span>
            <h2>현장 업무가<br />더 이상 흩어지지 않게.</h2>
            <p>생성부터 수행, 검증까지 하나의 태스크 안에서 이어집니다.</p>
          </div>
          <ol>
            <li><span>01</span><div><strong>그룹 만들기</strong><p>함께 일할 공간과 멤버를 구성합니다.</p></div></li>
            <li><span>02</span><div><strong>태스크 설명하기</strong><p>필요한 업무를 평소 말하듯 입력합니다.</p></div></li>
            <li><span>03</span><div><strong>체크하고 검증하기</strong><p>각 항목을 수행하고 정해진 기준으로 확인합니다.</p></div></li>
          </ol>
        </section>

        <section className="landing-final-cta">
          <div><span>START CHECKING</span><h2>오늘의 업무부터 CheckOn하세요.</h2></div>
          <Link to="/signup">시작하기 <ArrowRight size={16} /></Link>
        </section>
      </main>

      <footer className="landing-footer"><BrandMark compact /><span>© 2026 CheckOn</span></footer>
    </div>
  );
}
