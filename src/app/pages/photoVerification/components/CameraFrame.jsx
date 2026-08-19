import { Camera, ImagePlus, RotateCcw, SwitchCamera } from "lucide-react";

export default function CameraFrame({ captured, onCapture, onRetake }) {
  return (
    <div className={`camera-frame ${captured ? "camera-frame--captured" : ""}`}>
      <div className="camera-frame__scene" aria-label="카메라 미리보기 영역">
        <div className="camera-scene__ceiling" />
        <div className="camera-scene__shelf camera-scene__shelf--left"><span /><span /><span /></div>
        <div className="camera-scene__counter"><span /><span /><span /></div>
        <div className="camera-scene__shelf camera-scene__shelf--right"><span /><span /></div>
        <div className="camera-frame__guide"><i /><i /><i /><i /></div>
        {captured && <div className="camera-frame__captured-label">촬영 완료</div>}
      </div>
      <div className="camera-controls">
        <button type="button" className="camera-control-button" title="사진 불러오기"><ImagePlus size={19} /></button>
        {captured ? (
          <button type="button" className="camera-shutter camera-shutter--retake" onClick={onRetake} title="다시 촬영"><RotateCcw size={21} /></button>
        ) : (
          <button type="button" className="camera-shutter" onClick={onCapture} title="사진 촬영"><span /></button>
        )}
        <button type="button" className="camera-control-button" title="카메라 전환"><SwitchCamera size={19} /></button>
      </div>
      <p className="camera-frame__hint"><Camera size={12} /> 가이드 안에 매장 전체가 보이도록 촬영해주세요.</p>
    </div>
  );
}
