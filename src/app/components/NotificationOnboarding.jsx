import {
  BellRing,
  Check,
  CheckCircle2,
  Download,
  LoaderCircle,
  PlusSquare,
  Settings,
  Share2,
  Smartphone,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import { ApiError } from "../api/client";
import { ensurePushSubscription, getPushPermission, supportsWebPush } from "../api/pushApi";
import {
  canPromptInstall,
  isIosDevice,
  isMobileDevice,
  isStandaloneApp,
  promptInstall,
} from "../lib/pwaInstall";
import "./NotificationOnboarding.css";

const AUTH_PATHS = new Set(["/", "/login", "/signup"]);

function deviceState() {
  return {
    ios: isIosDevice(),
    mobile: isMobileDevice(),
    standalone: isStandaloneApp(),
    installPromptAvailable: canPromptInstall(),
    pushSupported: supportsWebPush(),
  };
}

function InstallGuide({ environment, isInstalling, installOutcome, onInstall }) {
  if (!environment.mobile || environment.standalone) return null;

  if (environment.ios) {
    return (
      <section className="notification-onboarding__install-guide">
        <div className="notification-onboarding__install-heading">
          <Smartphone size={15} />
          <div>
            <strong>먼저 홈 화면에 추가해 주세요</strong>
            <p>iPhone은 홈 화면에서 실행한 CheckOn에서만 업무 알림을 켤 수 있어요.</p>
          </div>
        </div>
        <ol className="notification-onboarding__steps">
          <li><span><Share2 size={16} /></span><strong>공유</strong><small>브라우저의 공유 버튼</small></li>
          <li><span><PlusSquare size={16} /></span><strong>홈 화면에 추가</strong><small>메뉴에서 항목 선택</small></li>
          <li><span><Smartphone size={16} /></span><strong>CheckOn 열기</strong><small>로그인 후 알림 허용</small></li>
        </ol>
      </section>
    );
  }

  return (
    <section className="notification-onboarding__install-nudge">
      <div>
        <Download size={15} />
        <p><strong>홈 화면에서 더 빠르게 열기</strong><span>앱처럼 열고 업무 알림을 바로 확인하세요.</span></p>
      </div>
      {environment.installPromptAvailable ? (
        <button type="button" onClick={onInstall} disabled={isInstalling}>
          {isInstalling ? <LoaderCircle className="is-spinning" size={13} /> : <Download size={13} />}
          {isInstalling ? "추가 중" : "홈 화면에 추가"}
        </button>
      ) : (
        <small>{installOutcome === "accepted" ? "홈 화면에 추가했습니다." : "브라우저 메뉴에서 ‘홈 화면에 추가’를 선택하세요."}</small>
      )}
    </section>
  );
}

export default function NotificationOnboarding({ user, trigger }) {
  const location = useLocation();
  const [pendingOpen, setPendingOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState(getPushPermission);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [environment, setEnvironment] = useState(deviceState);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installOutcome, setInstallOutcome] = useState("");
  const dialogRef = useRef(null);

  const requiresIosInstall = environment.ios && environment.mobile && !environment.standalone;
  const canRequestNotifications = environment.pushSupported && !requiresIosInstall && permission !== "denied";

  const receiptState = useMemo(() => {
    if (status === "success") return { label: "준비 완료", tone: "ready" };
    if (status === "subscribing") return { label: "알림 연결 중", tone: "install" };
    if (status === "error") return { label: "연결 확인 필요", tone: "blocked" };
    if (permission === "granted") return { label: "구독 확인 중", tone: "waiting" };
    if (permission === "denied") return { label: "브라우저에서 차단됨", tone: "blocked" };
    if (requiresIosInstall) return { label: "홈 화면 추가 필요", tone: "install" };
    if (!environment.pushSupported) return { label: "알림 미지원", tone: "blocked" };
    return { label: "권한 확인 필요", tone: "waiting" };
  }, [environment.pushSupported, permission, requiresIosInstall, status]);

  useEffect(() => {
    if (trigger > 0) setPendingOpen(true);
  }, [trigger]);

  useEffect(() => {
    if (!pendingOpen || !user?.memberId || AUTH_PATHS.has(location.pathname)) return;
    setIsOpen(true);
    setPendingOpen(false);
  }, [location.pathname, pendingOpen, user?.memberId]);

  useEffect(() => {
    const open = () => {
      if (!user?.memberId) return;
      setEnvironment(deviceState());
      setPermission(getPushPermission());
      setStatus("idle");
      setMessage("");
      setIsOpen(true);
    };
    const refreshEnvironment = () => setEnvironment(deviceState());
    window.addEventListener("checkon:open-notification-onboarding", open);
    window.addEventListener("checkon:install-availability-changed", refreshEnvironment);
    return () => {
      window.removeEventListener("checkon:open-notification-onboarding", open);
      window.removeEventListener("checkon:install-availability-changed", refreshEnvironment);
    };
  }, [user?.memberId]);

  useEffect(() => {
    if (!isOpen || permission !== "granted" || status !== "idle") return;
    let cancelled = false;
    setStatus("subscribing");
    ensurePushSubscription()
      .then(() => {
        if (cancelled) return;
        setStatus("success");
        setMessage(`${user.nickname}님, 이 기기로 업무 알림을 받을 준비가 됐어요.`);
        window.dispatchEvent(new CustomEvent("checkon:notification-state-changed"));
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(error instanceof ApiError ? error.message : "알림 구독을 확인하지 못했습니다.");
      });
    return () => { cancelled = true; };
  }, [isOpen, permission, status, user?.nickname]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector("button")?.focus();
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      previousFocus?.focus?.();
    };
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setMessage("");
    setStatus("idle");
  };

  const enableNotifications = async () => {
    if (status === "subscribing") return;
    setStatus("subscribing");
    setMessage("");
    try {
      await ensurePushSubscription();
      setPermission(getPushPermission());
      setStatus("success");
      setMessage(`${user.nickname}님, 이제 태스크와 매니저 메시지를 이 기기에서 알려드릴게요.`);
      window.dispatchEvent(new CustomEvent("checkon:notification-state-changed"));
    } catch (error) {
      setPermission(getPushPermission());
      setStatus("error");
      setMessage(error instanceof ApiError ? error.message : "알림을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const install = async () => {
    setIsInstalling(true);
    try {
      const result = await promptInstall();
      setInstallOutcome(result.outcome);
      setEnvironment(deviceState());
    } finally {
      setIsInstalling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-onboarding__backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) close();
    }}>
      <section ref={dialogRef} className="notification-onboarding" role="dialog" aria-modal="true" aria-labelledby="notification-onboarding-title">
        <header className="notification-onboarding__header">
          <div className="notification-onboarding__identity">
            <span><BellRing size={18} /></span>
            <div><small>WORK ALERT</small><strong>업무 알림 준비</strong></div>
          </div>
          <button type="button" onClick={close} aria-label="알림 안내 닫기"><X size={17} /></button>
        </header>

        <div className={`notification-onboarding__receipt is-${receiptState.tone}`}>
          <span>THIS DEVICE</span>
          <strong>{receiptState.label}</strong>
          <em>{environment.standalone ? "HOME APP" : environment.mobile ? "MOBILE WEB" : "WEB"}</em>
        </div>

        <div className="notification-onboarding__copy">
          {status === "success" ? (
            <>
              <span className="notification-onboarding__success-icon"><CheckCircle2 size={23} /></span>
              <h2 id="notification-onboarding-title">알림 준비가 끝났어요</h2>
              <p>{message}</p>
            </>
          ) : permission === "denied" ? (
            <>
              <span className="notification-onboarding__settings-icon"><Settings size={21} /></span>
              <h2 id="notification-onboarding-title">브라우저에서 알림이 차단되어 있어요</h2>
              <p>checkon.cloud의 알림을 허용한 뒤 아래 버튼으로 다시 확인해 주세요.</p>
            </>
          ) : requiresIosInstall ? (
            <>
              <h2 id="notification-onboarding-title">업무 알림을 놓치지 않게 준비할까요?</h2>
              <p>매니저가 보낸 메시지와 맡은 업무의 변화를 앱을 닫아도 확인할 수 있어요.</p>
            </>
          ) : !environment.pushSupported ? (
            <>
              <h2 id="notification-onboarding-title">이 브라우저는 업무 알림을 지원하지 않아요</h2>
              <p>Chrome, Edge 또는 홈 화면에 추가한 최신 iPhone CheckOn에서 다시 열어 주세요.</p>
            </>
          ) : (
            <>
              <h2 id="notification-onboarding-title">이 기기에서 업무 알림을 받을까요?</h2>
              <p>태스크 알림과 매니저가 보낸 메시지를 CheckOn을 열지 않아도 알려드려요.</p>
            </>
          )}
        </div>

        <InstallGuide
          environment={environment}
          isInstalling={isInstalling}
          installOutcome={installOutcome}
          onInstall={install}
        />

        {message && status === "error" && <p className="notification-onboarding__error" role="alert">{message}</p>}

        <div className="notification-onboarding__actions">
          {status === "success" ? (
            <button type="button" className="notification-onboarding__primary" onClick={close}><Check size={15} /> 확인</button>
          ) : permission === "denied" ? (
            <button type="button" className="notification-onboarding__primary" onClick={() => {
              setPermission(getPushPermission());
              setStatus("idle");
            }}><Settings size={15} /> 다시 확인</button>
          ) : canRequestNotifications ? (
            <button type="button" className="notification-onboarding__primary" onClick={enableNotifications} disabled={status === "subscribing"}>
              {status === "subscribing" ? <LoaderCircle className="is-spinning" size={15} /> : <BellRing size={15} />}
              {status === "subscribing" ? "알림 연결 중" : "이 기기에서 알림 받기"}
            </button>
          ) : requiresIosInstall ? (
            <button type="button" className="notification-onboarding__primary" onClick={close}><Check size={15} /> 설치 방법 확인했어요</button>
          ) : (
            <button type="button" className="notification-onboarding__primary" onClick={close}><Check size={15} /> 확인</button>
          )}
          {status !== "success" && <button type="button" className="notification-onboarding__later" onClick={close}>나중에</button>}
        </div>
      </section>
    </div>
  );
}
