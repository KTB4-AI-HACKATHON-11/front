import { ImagePlus, RotateCcw } from "lucide-react";
import { useRef } from "react";

const DEFAULT_HINT = "검증할 사진 파일을 선택해주세요.";

export default function CameraFrame({ captured, previewUrl, disabled, hint, onUpload, onRetake }) {
  const uploadInputRef = useRef(null);

  const handleUploadInputChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onUpload(file);
  };

  return (
    <div className={`camera-frame ${captured ? "camera-frame--captured" : ""}`}>
      <div className="camera-frame__scene" aria-label="업로드 사진 미리보기 영역">
        {captured && previewUrl ? (
          <img className="camera-frame__preview" src={previewUrl} alt="제출할 사진 미리보기" />
        ) : (
          <div className="camera-frame__empty">
            <ImagePlus size={30} />
            <strong>사진 파일을 업로드해주세요</strong>
            <span>JPEG, PNG, WebP · 최대 10MB</span>
          </div>
        )}
        {captured && <div className="camera-frame__captured-label">사진 준비 완료</div>}
      </div>

      <div className="camera-upload-controls">
        <label className={`camera-upload-button ${disabled ? "is-disabled" : ""}`}>
          <ImagePlus size={17} />
          <span>{captured ? "다른 사진 선택" : "사진 파일 선택"}</span>
          <input ref={uploadInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="camera-frame__hidden-input" onChange={handleUploadInputChange} disabled={disabled} />
        </label>
        {captured && (
          <button type="button" className="camera-retake-button" onClick={onRetake} disabled={disabled}>
            <RotateCcw size={15} /> 사진 제거
          </button>
        )}
      </div>
      <p className="camera-frame__hint">{hint || DEFAULT_HINT}</p>
    </div>
  );
}
