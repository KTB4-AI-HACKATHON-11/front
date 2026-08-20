import { ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AppShell from "../../components/AppShell";
import StatusState from "../../components/StatusState";
import { ApiError } from "../../api/client";
import { getTaskDetail } from "../../api/taskApi";
import { groups } from "../../data/mockData";
import { toSubTask } from "../../lib/taskDisplay";
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
  const { taskId, subTaskId } = useParams();
  const [taskDetail, setTaskDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [captured, setCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [verified, setVerified] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const verifyTimeoutRef = useRef(null);
  const verifyIntervalRef = useRef(null);

  // 태스크 상세를 실제 API에서 불러옵니다. 이 화면은 이전에 mockData의 tasks 배열을 사용했기 때문에
  // 실제 태스크 id(예: 2)로 접근하면 항상 "태스크를 찾을 수 없어요"가 떴습니다. TaskDetailPage와 동일한
  // getTaskDetail API를 사용하도록 맞춰 이 문제를 해결합니다.
  useEffect(() => {
    let cancelled = false;

    async function loadTaskDetail() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await getTaskDetail({ taskId, requesterId: user?.memberId });
        if (!cancelled) setTaskDetail(data);
      } catch (error) {
        if (!cancelled) {
          setTaskDetail(null);
          setLoadError(error);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    if (user?.memberId) {
      loadTaskDetail();
    } else {
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [taskId, user?.memberId]);

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
    // TODO: 사진 인증 API가 연결되면 성공 응답에서 performed 상태를 받아 서버에 저장해야 합니다.
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

  if (!user?.memberId) {
    return <StatusState user={user} type="login" />;
  }

  if (isLoading) {
    return (
      <AppShell user={user} title="사진 검증 정보를 불러오는 중" description="잠시만 기다려주세요." backTo="/groups">
        <p className="group-grid__empty">사진 검증 정보를 불러오는 중이에요...</p>
      </AppShell>
    );
  }

  if (!taskDetail) {
    return (
      <StatusState
        user={user}
        type={loadError?.status === 403 ? "access" : "task"}
        description={loadError instanceof ApiError ? loadError.message : `요청하신 태스크(${taskId})를 찾을 수 없습니다.`}
      />
    );
  }

  const subTasks = (taskDetail.checklists ?? []).map(toSubTask);
  const subTaskIndex = subTasks.findIndex((item) => item.id === String(subTaskId));
  const subTask = subTaskIndex >= 0 ? subTasks[subTaskIndex] : null;

  // 체크리스트 항목이 아예 없거나(subTaskId 불일치), PHOTO 방식이 아닌 항목으로 접근한 경우입니다.
  if (!subTask || !subTask.photo) {
    return (
      <StatusState
        user={user}
        type="task"
        description={`요청하신 태스크(${taskId})의 사진 검증 항목(${subTaskId})을 찾을 수 없습니다.`}
      />
    );
  }

  if (subTask.completed) {
    return (
      <StatusState
        user={user}
        type="task"
        title="이미 수행 완료한 항목입니다"
        description="완료된 사진 검증 항목은 다시 접근할 수 없습니다. 태스크 상세 화면에서 다른 항목을 확인해주세요."
        actionLabel="태스크 상세로 돌아가기"
        actionPath={`/tasks/${taskId}`}
      />
    );
  }

  // 그룹 정보를 조회하는 API가 아직 없어, 태스크 상세 응답의 groupId로 mock 그룹 목록에서 이름만 보조적으로 찾습니다.
  const currentGroup = groups.find((group) => String(group.id) === String(taskDetail.groupId)) ?? groups[0];

  return (
    <AppShell
      user={user}
      title="사진 검증"
      description={`${taskDetail.title}의 현장 사진을 촬영하고 검증합니다.`}
      backTo={`/tasks/${taskId}`}
      breadcrumbs={[
        { label: "내 그룹", path: "/groups" },
        { label: currentGroup.name, path: `/groups/${currentGroup.id}` },
        { label: taskDetail.title, path: `/tasks/${taskId}` },
        { label: "사진 검증", path: `/tasks/${taskId}/verify/photo/${subTaskId}`, current: true },
      ]}
    >
      <div className={`photo-verification-layout ${verified || verifying ? "photo-verification-layout--result" : ""}`}>
        <section className="photo-camera-card page-card">
          {verified ? (
            <SuccessResult
              matchScore={verificationResult?.matchScore}
              onConfirm={() => navigate(`/tasks/${taskId}`, { state: { verifiedChecklistId: subTaskId } })}
            />
          ) : verifying ? (
            <VerifyingState progress={verifyProgress} />
          ) : (
            <>
              <div className="photo-camera-card__heading">
                <div>
                  <span>SUB_TASK {String(subTaskIndex + 1).padStart(2, "0")}</span>
                  <h2>{subTask.title}</h2>
                </div>
                <span className="status-pill status-pill--waiting">{subTask.completed ? "수행 완료" : "검증 대기"}</span>
              </div>
              <CameraFrame captured={captured} onCapture={handleCapture} onRetake={handleRetake} />
            </>
          )}
        </section>

        {!verified && !verifying && (
          <aside className="photo-criteria page-card">
            <div className="photo-criteria__heading"><span><ShieldCheck size={17} /></span><div><small>CHECK POINT</small><h2>사진 검증 기준</h2></div></div>
            <p className="photo-criteria__description">{subTask.rule || "아래 기준에 맞게 사진을 촬영해주세요."}</p>
            {subTask.referencePhotoUrl && (
              <div className="photo-criteria__reference">
                <img src={subTask.referencePhotoUrl} alt="기준 사진" />
              </div>
            )}
            <button className="primary-button" disabled={!captured} onClick={handleVerify}><ShieldCheck size={15} /> 사진으로 검증하기</button>
            <button className="ghost-button" onClick={() => navigate(`/tasks/${taskId}`)}>나중에 검증하기</button>
          </aside>
        )}
      </div>
    </AppShell>
  );
}
