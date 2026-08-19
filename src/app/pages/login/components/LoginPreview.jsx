export default function LoginPreview() {
  return (
    <div className="auth-visual-board" aria-hidden="true">
      <div className="auth-visual-board__header"><span />오늘의 오픈 준비 <b>4 / 6</b></div>
      <div className="auth-visual-board__row is-done"><i>✓</i> 출입구 청결 확인</div>
      <div className="auth-visual-board__row is-done"><i>✓</i> 조명 전원 켜기</div>
      <div className="auth-visual-board__row"><i /> 매장 전경 촬영 <em>사진 검증</em></div>
    </div>
  );
}
