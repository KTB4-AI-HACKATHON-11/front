import { ApiError, apiRequest } from "./client";

const PUSH_SETUP_TIMEOUT_MS = 10_000;

async function withPushTimeout(operation, message) {
  let timeoutId;
  try {
    return await Promise.race([
      operation,
      new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(new ApiError("PUSH_SETUP_TIMEOUT", message, 0));
        }, PUSH_SETUP_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

function urlBase64ToUint8Array(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

export function supportsWebPush() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function getPushPermission() {
  return "Notification" in window ? Notification.permission : "unsupported";
}

export async function ensurePushSubscription() {
  if (!supportsWebPush()) {
    throw new ApiError(
      "PUSH_UNSUPPORTED",
      "이 브라우저에서는 알림을 사용할 수 없습니다. iPhone은 홈 화면에 추가한 CheckOn 앱에서 시도해주세요.",
      0
    );
  }

  const permission = getPushPermission() === "default"
    ? await Notification.requestPermission()
    : getPushPermission();
  if (permission !== "granted") {
    throw new ApiError(
      "PUSH_PERMISSION_DENIED",
      "브라우저 알림 권한이 허용되지 않았습니다. 브라우저 설정에서 CheckOn 알림을 허용해주세요.",
      0
    );
  }

  const config = await apiRequest("/push/public-key", { timeoutMs: PUSH_SETUP_TIMEOUT_MS });
  if (!config?.enabled || !config.publicKey) {
    throw new ApiError("PUSH_DISABLED", "현재 브라우저 알림 서버가 준비되지 않았습니다.", 503);
  }

  let registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    registration = await withPushTimeout(
      navigator.serviceWorker.register("/sw.js"),
      "알림 서비스를 시작하지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요."
    );
  }
  if (!registration.active) {
    registration = await withPushTimeout(
      navigator.serviceWorker.ready,
      "알림 서비스 준비가 지연되고 있습니다. 페이지를 새로고침한 뒤 다시 시도해주세요."
    );
  }

  let subscription = await withPushTimeout(
    registration.pushManager.getSubscription(),
    "이 기기의 기존 알림 구독을 확인하지 못했습니다."
  );
  if (!subscription) {
    subscription = await withPushTimeout(
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.publicKey),
      }),
      "이 기기의 알림 구독 생성이 지연되고 있습니다. 잠시 후 다시 시도해주세요."
    );
  }

  const saved = await apiRequest("/push/subscriptions", {
    method: "PUT",
    body: subscription.toJSON(),
    timeoutMs: PUSH_SETUP_TIMEOUT_MS,
  });
  return { subscription, saved };
}
