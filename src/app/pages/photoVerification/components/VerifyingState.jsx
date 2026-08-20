export default function VerifyingState({ progress = 0 }) {
  return (
    <div className="photo-verifying">
      <div className="photo-verifying__ring" style={{ "--progress": `${progress * 3.6}deg` }}>
        <div><strong>{progress}%</strong></div>
      </div>
      <span className="photo-verifying__eyebrow">AI VERIFYING</span>
      <h2>사진을 검증하고 있어요</h2>
      <p>매장 전경과 조명, 메인 진열대 상태를<br />확인하는 중입니다. 잠시만 기다려주세요.</p>
    </div>
  );
}
