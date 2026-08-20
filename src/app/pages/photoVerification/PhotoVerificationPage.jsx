import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import AppShell from "../../components/AppShell";
import { groups, tasks } from "../../data/mockData";
import CameraFrame from "./components/CameraFrame";
import SuccessResult from "./components/SuccessResult";
import VerifyingState from "./components/VerifyingState";
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

// 실제 검증 API 응답을 기다리는 느낌을 주기 위한 임시 지연 시간(ms). API 연동 시 제거합니다.
const MOCK_VERIFY_DELAY_MS = 1500;
const MOCK_VERIFY_PROGRESS_STEP_MS = 30;

export default function PhotoVerificationPage({ user }) {
  const navigate = useNavigate();
  const currentTask = tasks[0];
  const currentGroup = groups[0];
  const [captured, setCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [verified, setVerified] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const verifyTimeoutRef = useRef(null);
  const verifyIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(verifyTimeoutRef.current);
      clearInterval(verifyIntervalRef.current);
    };
  }, []);

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
    // API 미구현으로 임시 목업 응답 값을 성공 화면에 보여줄 값으로 미리 설정해두고,
    // 실제 API 응답을 기다리는 흐름처럼 보이도록 짧은 지연 동안 진행률을 0 → 100%로 채웁니다.
    setVerifying(true);
    setVerifyProgress(0);

    const startedAt = Date.now();
    verifyIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setVerifyProgress(Math.min(100, Math.round((elapsed / MOCK_VERIFY_DELAY_MS) * 100)));
    }, MOCK_VERIFY_PROGRESS_STEP_MS);

    verifyTimeoutRef.current = setTimeout(() => {
      clearInterval(verifyIntervalRef.current);
      setVerifyProgress(100);
      setVerificationResult(MOCK_VERIFICATION_RESULT);
      setVerified(MOCK_VERIFICATION_RESULT.success);
      setVerifying(false);
    }, MOCK_VERIFY_DELAY_MS);
  };

  return (
    <AppShell
      user={user}
      title="사진 검증"
      description={`${currentTask.title}의 현장 사진을 촬영하고 검증합니다.`}
      backTo={`/tasks/${currentTask.id}`}
      breadcrumbs={[
        { label: "내 그룹", path: "/groups" },
        { label: currentGroup.name, path: `/groups/${currentGroup.id}` },
        { label: currentTask.title, path: `/tasks/${currentTask.id}` },
        { label: "사진 검증", path: `/tasks/${currentTask.id}/verify/photo`, current: true },
      ]}
    >
      <div className={`photo-verification-layout ${verified || verifying ? "photo-verification-layout--result" : ""}`}>
        <section className="photo-camera-card page-card">
          {verified ? (
            <SuccessResult matchScore={verificationResult?.matchScore} onConfirm={() => navigate("/tasks/task-101")} />
          ) : verifying ? (
            <VerifyingState progress={verifyProgress} />
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

        {!verified && !verifying && (
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
