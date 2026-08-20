export default function VerifyingState() {
  return (
    <div className="photo-verifying" role="status" aria-live="polite" aria-busy="true">
      <div className="photo-verifying__ring" aria-hidden="true" />
      <span className="photo-verifying__eyebrow">AI VERIFYING</span>
      <h2>사진을 검증하고 있어요</h2>
      <p>검증 결과가 준비되는 즉시 보여드릴게요.</p>
    </div>
  );
}
