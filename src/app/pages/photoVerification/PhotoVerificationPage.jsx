import { ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import AppShell from "../../components/AppShell";
import StatusState from "../../components/StatusState";
import { ApiError } from "../../api/client";
import { getTaskDetail, submitPhotoAttempt } from "../../api/taskApi";
import { groups } from "../../data/mockData";
import { toSubTask } from "../../lib/taskDisplay";
import CameraFrame from "./components/CameraFrame";
import FailureResult from "./components/FailureResult";
import ReviewRequested from "./components/ReviewRequested";
import SuccessResult from "./components/SuccessResult";
import VerifyingState from "./components/VerifyingState";
import "./PhotoVerificationPage.css";

// 같은 항목에서 AI 검증에 연속 실패했을 때 "매니저에게 확인 요청"을 노출하는 기준 횟수
const MANAGER_REVIEW_FAIL_THRESHOLD = 3;
// TODO: 개발 단계에서는 업로드 사진의 EXIF 촬영일 검증을 잠시 꺼둡니다. exifDate.js 구현/테스트는
// 끝났으니, 실제 배포 전에는 이 값을 true로 되돌려 다시 켜야 합니다.
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getPhotoActionError(error) {
  if (error instanceof ApiError && ["WORKER_REQUIRED", "WORKER_NOT_IN_GROUP", "GROUP_ACCESS_DENIED"].includes(error.code)) {
    return "본인의 체크리스트가 아닙니다.";
  }

  return error instanceof ApiError ? error.message : "사진 검증에 실패했습니다. 잠시 후 다시 시도해주세요.";
}

export default function PhotoVerificationPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId, subTaskId } = useParams();
  const [taskDetail, setTaskDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [captured, setCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null); // { file, previewUrl }
  const [uploadError, setUploadError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState(null); // { success, status, reason, fix }
  const [failCount, setFailCount] = useState(0);
  const [reviewRequested, setReviewRequested] = useState(false);
  const capturedImageRef = useRef(capturedImage);
  const progressIntervalRef = useRef(null);
  const isMountedRef = useRef(true);

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

  // 다른 체크리스트 항목(subTaskId)으로 이동하면 이전 항목에서 남아있던 촬영/검증 상태가 그대로
  // 보이지 않도록 초기화합니다. 이 페이지는 같은 라우트 패턴이라 subTaskId만 바뀌면 컴포넌트가
  // 재마운트되지 않습니다.
  useEffect(() => {
    setCapturedImage((current) => {
      if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
    setCaptured(false);
    setUploadError("");
    setVerificationResult(null);
    setFailCount(0);
    setReviewRequested(false);
  }, [subTaskId]);

  useEffect(() => {
    capturedImageRef.current = capturedImage;
  }, [capturedImage]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearInterval(progressIntervalRef.current);
      if (capturedImageRef.current?.previewUrl) {
        URL.revokeObjectURL(capturedImageRef.current.previewUrl);
      }
    };
  }, []);

  const setCapturedFile = (file) => {
    setCapturedImage((current) => {
      if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);
      return { file, previewUrl: URL.createObjectURL(file) };
    });
    setUploadError("");
    setVerificationResult(null);
    setCaptured(true);
  };

  const handleUpload = (file) => {
    setUploadError("");
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setUploadError("JPEG, PNG, WebP 형식의 사진만 업로드할 수 있어요.");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setUploadError("사진 파일은 10MB 이하만 업로드할 수 있어요.");
      return;
    }
    setCapturedFile(file);
  };

  const handleRetake = () => {
    setCapturedImage((current) => {
      if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
    setCaptured(false);
    setUploadError("");
    setVerificationResult(null);
  };

  const handleVerify = async (subTask) => {
    if (!capturedImage?.file) return;
    if (!subTask.assignmentId) {
      setUploadError("사진 인증에 필요한 업무 배정 정보를 찾을 수 없습니다.");
      return;
    }

    setVerifying(true);
    setVerifyProgress(0);
    setVerificationResult(null);
    setUploadError("");
    clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = window.setInterval(() => {
      setVerifyProgress((current) => Math.min(current + 5, 95));
    }, 120);
    try {
      const result = await submitPhotoAttempt({
        assignmentId: subTask.assignmentId,
        workerId: taskDetail.workerId,
        photo: capturedImage.file,
      });
      if (!isMountedRef.current) return;

      clearInterval(progressIntervalRef.current);
      setVerifyProgress(100);
      setVerificationResult({
        ...result,
        success: result?.status === "PASS",
      });
      if (result?.status === "RETAKE") setFailCount((current) => Math.max(current + 1, result.attemptNumber ?? 0));
    } catch (error) {
      clearInterval(progressIntervalRef.current);
      if (isMountedRef.current) {
        setUploadError(getPhotoActionError(error));
      }
    } finally {
      if (isMountedRef.current) setVerifying(false);
    }
  };

  const handleRequestReview = () => {
    // TODO: 매니저 확인 요청 API가 아직 없어 화면 상태만 변경합니다. 연동 시 이 체크리스트를
    // "매니저 확인 대기" 상태로 서버에 저장하는 API를 호출해야 합니다.
    setReviewRequested(true);
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

  if (taskDetail.workerId == null || String(taskDetail.workerId) !== String(user.memberId)) {
    return <StatusState user={user} type="access" description="본인의 체크리스트가 아닙니다." />;
  }

  const taskAssignmentId = taskDetail.assignmentId
    ?? taskDetail.taskAssignmentId
    ?? taskDetail.assignment?.assignmentId
    ?? taskDetail.assignment?.id
    ?? taskDetail.taskAssignment?.id;
  const subTasks = (taskDetail.checklists ?? []).map((item) => toSubTask(item, taskAssignmentId));
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
  const currentGroupId = location.state?.groupId ?? taskDetail.groupId;
  const currentGroup = groups.find((group) => String(group.id) === String(currentGroupId)) ?? groups[0];
  const isResultView = Boolean(verificationResult) || verifying || reviewRequested;
  const canRequestReview = failCount >= MANAGER_REVIEW_FAIL_THRESHOLD;

  return (
    <AppShell
      user={user}
      title="사진 검증"
      description={`${taskDetail.title}의 현장 사진을 촬영하고 검증합니다.`}
      backTo={`/tasks/${taskId}`}
      breadcrumbs={[
        { label: "내 그룹", path: "/groups" },
        { label: currentGroup.name, path: `/groups/${currentGroupId}` },
        { label: taskDetail.title, path: `/tasks/${taskId}` },
        { label: "사진 검증", path: `/tasks/${taskId}/verify/photo/${subTaskId}`, current: true },
      ]}
    >
      <div className={`photo-verification-layout ${isResultView ? "photo-verification-layout--result" : ""}`}>
        <section className="photo-camera-card page-card">
          {reviewRequested ? (
            <ReviewRequested onConfirm={() => navigate(`/tasks/${taskId}`, { state: { groupId: currentGroupId } })} />
          ) : verificationResult?.success ? (
            <SuccessResult
              description={subTask.instruction ? `${subTask.instruction} 기준으로 확인되었습니다.` : undefined}
              onConfirm={() => navigate(`/tasks/${taskId}`, { state: { groupId: currentGroupId, verifiedChecklistId: subTaskId } })}
            />
          ) : verificationResult && !verificationResult.success ? (
            <FailureResult
              reason={verificationResult.reason}
              fix={verificationResult.fix}
              status={verificationResult.status}
              attemptCount={failCount}
              canRequestReview={canRequestReview}
              onRetake={handleRetake}
              onRequestReview={handleRequestReview}
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
              <CameraFrame
                captured={captured}
                previewUrl={capturedImage?.previewUrl}
                hint="검증 기준에 맞는 사진을 업로드해주세요."
                onUpload={handleUpload}
                onRetake={handleRetake}
              />
              {uploadError && <p className="photo-camera-card__error" role="alert">{uploadError}</p>}
            </>
          )}
        </section>

        {!isResultView && (
          <aside className="photo-criteria page-card">
            <div className="photo-criteria__heading"><span><ShieldCheck size={17} /></span><div><small>CHECK POINT</small><h2>사진 검증 기준</h2></div></div>
            <p className="photo-criteria__description">{subTask.rule || "아래 기준에 맞게 사진을 촬영해주세요."}</p>
            {subTask.referencePhotoUrl && (
              <div className="photo-criteria__reference">
                <img src={subTask.referencePhotoUrl} alt="기준 사진" />
              </div>
            )}
            <button className="primary-button" disabled={!captured} onClick={() => handleVerify(subTask)}>
              <ShieldCheck size={15} /> 사진으로 검증하기
            </button>
            <button className="ghost-button" onClick={() => navigate(`/tasks/${taskId}`, { state: { groupId: currentGroupId } })}>나중에 검증하기</button>
          </aside>
        )}
      </div>
    </AppShell>
  );
}
