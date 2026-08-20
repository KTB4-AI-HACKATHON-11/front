import { Camera, ImagePlus, RotateCcw } from "lucide-react";
import { useRef } from "react";

const DEFAULT_HINT = "가이드 안에 매장 전체가 보이도록 촬영해주세요.";

export default function CameraFrame({ captured, previewUrl, disabled, hint, onCapture, onUpload, onRetake }) {
  const captureInputRef = useRef(null);
  const uploadInputRef = useRef(null);

  const handleCaptureInputChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 초기화합니다.
    if (file) onCapture(file);
  };

  const handleUploadInputChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onUpload(file);
  };

  return (
    <div className={`camera-frame ${captured ? "camera-frame--captured" : ""}`}>
      <div className="camera-frame__scene" aria-label="카메라 미리보기 영역">
        {captured && previewUrl ? (
          <img className="camera-frame__preview" src={previewUrl} alt="제출할 사진 미리보기" />
        ) : (
          <>
            <div className="camera-scene__ceiling" />
            <div className="camera-scene__shelf camera-scene__shelf--left"><span /><span /><span /></div>
            <div className="camera-scene__counter"><span /><span /><span /></div>
            <div className="camera-scene__shelf camera-scene__shelf--right"><span /><span /></div>
            <div className="camera-frame__guide"><i /><i /><i /><i /></div>
          </>
        )}
        {captured && <div className="camera-frame__captured-label">사진 준비 완료</div>}
      </div>
      <div className="camera-controls">
        <button
          type="button"
          className="camera-control-button"
          title="사진 불러오기"
          disabled={disabled}
          onClick={() => uploadInputRef.current?.click()}
        >
          <ImagePlus size={19} />
        </button>
        {captured ? (
          <button
            type="button"
            className="camera-shutter camera-shutter--retake"
            onClick={onRetake}
            disabled={disabled}
            title="다시 촬영"
          >
            <RotateCcw size={21} />
          </button>
        ) : (
          <button
            type="button"
            className="camera-shutter"
            title="사진 촬영"
            disabled={disabled}
            onClick={() => captureInputRef.current?.click()}
          >
            <span />
          </button>
        )}
        <span className="camera-controls__spacer" aria-hidden="true" />
      </div>
      <p className="camera-frame__hint">
        <Camera size={12} /> {hint || DEFAULT_HINT}
      </p>

      {/* capture 속성이 있으면 모바일 브라우저에서 바로 카메라 앱이 열립니다. */}
      <input
        ref={captureInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="camera-frame__hidden-input"
        onChange={handleCaptureInputChange}
      />
      {/* capture 속성 없이 갤러리에서 사진을 선택합니다. */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="camera-frame__hidden-input"
        onChange={handleUploadInputChange}
      />
    </div>
  );
}
