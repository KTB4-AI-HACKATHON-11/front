import { ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import AppShell from "../../components/AppShell";
import StatusState from "../../components/StatusState";
import { ApiError } from "../../api/client";
import { getTaskDetail } from "../../api/taskApi";
import { groups } from "../../data/mockData";
import { isSameLocalDate, readJpegCapturedAt } from "../../lib/exifDate";
import { toSubTask } from "../../lib/taskDisplay";
import CameraFrame from "./components/CameraFrame";
import FailureResult from "./components/FailureResult";
import ReviewRequested from "./components/ReviewRequested";
import SuccessResult from "./components/SuccessResult";
import VerifyingState from "./components/VerifyingState";
import "./PhotoVerificationPage.css";

// TODO: 사진 검증 API 연동 전까지 사용하는 임시 목업 지연/판정 로직입니다.
// 실제 API가 준비되면 verifyPhotoMock 호출부를 taskApi의 실제 검증 API 호출로 교체하면 됩니다.
// (요청/응답 형태는 이 함수의 인자·반환값과 최대한 맞춰뒀습니다.)
const MOCK_VERIFY_DELAY_MS = 1500;
const MOCK_VERIFY_PROGRESS_STEP_MS = 30;
const MOCK_VERIFY_THRESHOLD = 80;
// 실패/재검증 화면을 로컬에서 확인하려면 이 값을 1 이상으로 바꾸세요.
// (지금까지의 실패 횟수가 이 값보다 작으면 검증이 실패하는 것으로 목업합니다.) 실제 API 연동 시
// 이 상수와 verifyPhotoMock의 판정 로직 전체를 제거하고 서버 응답으로 대체해야 합니다.
const MOCK_FORCE_FAIL_ATTEMPTS = 0;
// 같은 항목에서 AI 검증에 연속 실패했을 때 "매니저에게 확인 요청"을 노출하는 기준 횟수
const MANAGER_REVIEW_FAIL_THRESHOLD = 3;
// TODO: 개발 단계에서는 업로드 사진의 EXIF 촬영일 검증을 잠시 꺼둡니다. exifDate.js 구현/테스트는
// 끝났으니, 실제 배포 전에는 이 값을 true로 되돌려 다시 켜야 합니다.
const ENABLE_UPLOAD_DATE_CHECK = false;

function verifyPhotoMock({ failCount, rule }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const willFail = failCount < MOCK_FORCE_FAIL_ATTEMPTS;
      if (willFail) {
        resolve({
          success: false,
          matchScore: 54,
          threshold: MOCK_VERIFY_THRESHOLD,
          reason: rule
            ? `제출한 사진이 "${rule}" 기준과 일치하지 않았어요.`
            : "제출한 사진이 검증 기준과 일치하지 않았어요.",
        });
      } else {
        resolve({ success: true, matchScore: 96, threshold: MOCK_VERIFY_THRESHOLD });
      }
    }, MOCK_VERIFY_DELAY_MS);
  });
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
  const [isCheckingUpload, setIsCheckingUpload] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState(null); // { success, matchScore, threshold, reason }
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

  // 카메라로 바로 촬영한 사진입니다. 그 자리에서 찍은 사진이라고 보고 별도의 촬영 시각 검증은 하지 않습니다.
  const handleCapture = (file) => {
    setCapturedFile(file);
  };

  // 갤러리에서 불러온 사진입니다. 예전에 찍어둔 사진을 제출하는 것을 막기 위해 EXIF 촬영 시각이
  // 오늘 날짜인지 확인한 뒤에만 사용합니다. EXIF를 읽을 수 없는 파일(HEIC 등)은 안전하게 거부합니다.
  // TODO: ENABLE_UPLOAD_DATE_CHECK가 개발 단계라 꺼져 있어 지금은 이 검증을 건너뜁니다.
  const handleUpload = async (file) => {
    setUploadError("");
    setIsCheckingUpload(true);
    try {
      if (ENABLE_UPLOAD_DATE_CHECK) {
        const takenAt = await readJpegCapturedAt(file);
        if (!isMountedRef.current) return; // 확인 중 다른 화면으로 이동한 경우 상태 갱신을 건너뜁니다.

        if (!takenAt) {
          setUploadError("사진 촬영 시각을 확인할 수 없어요. 카메라로 바로 촬영해주세요.");
          return;
        }
        if (!isSameLocalDate(takenAt, new Date())) {
          setUploadError("오늘 촬영한 사진만 업로드할 수 있어요.");
          return;
        }
      }
      setCapturedFile(file);
    } finally {
      if (isMountedRef.current) setIsCheckingUpload(false);
    }
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
    // TODO: 촬영/업로드한 이미지(capturedImage.file)와 검증 기준을 사진 검증 API로 전송하고
    // 성공 여부를 받아야 합니다. 백엔드 API가 준비되면 아래 verifyPhotoMock 호출을 실제 API 호출로
    // 교체하면 됩니다.
    // TODO: 사진 인증 API가 연결되면 성공 응답에서 performed 상태를 받아 서버에 저장해야 합니다.
    setVerifying(true);
    setVerifyProgress(0);
    setVerificationResult(null);

    const startedAt = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setVerifyProgress(Math.min(100, Math.round((elapsed / MOCK_VERIFY_DELAY_MS) * 100)));
    }, MOCK_VERIFY_PROGRESS_STEP_MS);

    const result = await verifyPhotoMock({ failCount, rule: subTask.rule });
    clearInterval(progressIntervalRef.current);
    if (!isMountedRef.current) return; // 검증 중 다른 화면으로 이동한 경우 상태 갱신을 건너뜁니다.

    setVerifyProgress(100);
    setVerifying(false);
    setVerificationResult(result);
    if (!result.success) {
      setFailCount((current) => current + 1);
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
              matchScore={verificationResult.matchScore}
              description={subTask.instruction ? `${subTask.instruction} 기준으로 확인되었습니다.` : undefined}
              onConfirm={() => navigate(`/tasks/${taskId}`, { state: { groupId: currentGroupId, verifiedChecklistId: subTaskId } })}
            />
          ) : verificationResult && !verificationResult.success ? (
            <FailureResult
              reason={verificationResult.reason}
              matchScore={verificationResult.matchScore}
              threshold={verificationResult.threshold}
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
                disabled={isCheckingUpload}
                // TODO: ENABLE_UPLOAD_DATE_CHECK를 다시 켜면 이 안내 문구도 함께 되돌려야 합니다.
                hint={
                  ENABLE_UPLOAD_DATE_CHECK
                    ? "가이드 안에 매장 전체가 보이도록 촬영해주세요. 불러온 사진은 오늘 촬영한 사진만 사용할 수 있어요."
                    : "가이드 안에 매장 전체가 보이도록 촬영해주세요."
                }
                onCapture={handleCapture}
                onUpload={handleUpload}
                onRetake={handleRetake}
              />
              {isCheckingUpload && <p className="photo-camera-card__notice">불러온 사진의 촬영 시각을 확인하고 있어요...</p>}
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
            <button className="primary-button" disabled={!captured || isCheckingUpload} onClick={() => handleVerify(subTask)}>
              <ShieldCheck size={15} /> 사진으로 검증하기
            </button>
            <button className="ghost-button" onClick={() => navigate(`/tasks/${taskId}`, { state: { groupId: currentGroupId } })}>나중에 검증하기</button>
          </aside>
        )}
      </div>
    </AppShell>
  );
}
