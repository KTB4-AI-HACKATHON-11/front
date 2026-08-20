import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import AppShell from "../../components/AppShell";
import CameraFrame from "./components/CameraFrame";
import SuccessResult from "./components/SuccessResult";
import "./PhotoVerificationPage.css";

// TODO: 사진 검증 API 연동 전까지 사용하는 임시 목업 값입니다. API 연동 시 실제 응답 데이터로 대체해야 합니다.
const MOCK_CAPTURED_IMAGE = {
  fileName: "store-front-preview.jpg",
  previewUrl: "/mock/photo-verification/store-front-preview.jpg", // 실제 촬영 이미지가 들어갈 자리 (CameraFrame은 CSS 일러스트를 그대로 사용하므로 화면에는 반영되지 않음)
};

const MOCK_VERIFICATION_RESULT = {
  success: true,
  matchScore: 96,
};

export default function PhotoVerificationPage({ user }) {
  const navigate = useNavigate();
  const [captured, setCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [verified, setVerified] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleCapture = () => {
    // TODO: 모바일 카메라 권한 요청 후 촬영한 이미지 파일을 상태에 저장해야 합니다.
    // API 미구현으로 임시 목업 이미지 값을 상태에 저장해둡니다.
    setCapturedImage(MOCK_CAPTURED_IMAGE);
    setCaptured(true);
  };

  const handleRetake = () => {
    setCaptured(false);
    setCapturedImage(null);
  };

  const handleVerify = () => {
    // TODO: 촬영 이미지(capturedImage)와 검증 기준을 사진 검증 API로 전송하고 성공 여부를 받아야 합니다.
    // TODO: 성공 시 해당 SUB_TASK의 performed boolean을 true로 갱신해야 합니다.
    // API 미구현으로 임시 목업 응답 값을 성공 화면에 보여줄 값으로 미리 설정해둡니다.
    setVerificationResult(MOCK_VERIFICATION_RESULT);
    setVerified(MOCK_VERIFICATION_RESULT.success);
  };

  return (
    <AppShell user={user} title="사진 검증" description="오픈 전 매장 점검" backTo="/tasks/task-101">
      <div className="photo-verification-layout">
        <section className="photo-camera-card page-card">
          {verified ? (
            <SuccessResult matchScore={verificationResult?.matchScore} onConfirm={() => navigate("/tasks/task-101")} />
          ) : (
            <>
              <div className="photo-camera-card__heading">
                <div><span>SUB_TASK 05</span><h2>오픈 준비가 끝난 매장 전경 촬영</h2></div>
                <span className="status-pill status-pill--waiting">검증 대기</span>
              </div>
              <CameraFrame captured={captured} onCapture={handleCapture} onRetake={handleRetake} />
            </>
          )}
        </section>

        {!verified && (
          <aside className="photo-criteria page-card">
            <div className="photo-criteria__heading"><span><ShieldCheck size={17} /></span><div><small>CHECK POINT</small><h2>사진 검증 기준</h2></div></div>
            <p className="photo-criteria__description">아래 항목이 사진에서 명확하게 보여야 검증에 성공합니다.</p>
            <div className="photo-criteria__list">
              <p><CheckCircle2 size={14} /><span><strong>매장 전체 전경</strong><small>출입구부터 메인 공간까지 포함</small></span></p>
              <p><CheckCircle2 size={14} /><span><strong>조명 켜짐</strong><small>천장과 진열장 조명이 모두 켜진 상태</small></span></p>
              <p><CheckCircle2 size={14} /><span><strong>메인 진열대</strong><small>상품과 진열 상태를 식별할 수 있는 선명도</small></span></p>
            </div>
            <button className="primary-button" disabled={!captured} onClick={handleVerify}><ShieldCheck size={15} /> 사진으로 검증하기</button>
            <button className="ghost-button" onClick={() => navigate("/tasks/task-101")}>나중에 검증하기</button>
          </aside>
        )}
      </div>
    </AppShell>
  );
}
