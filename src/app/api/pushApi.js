import { ApiError, apiRequest } from "./client";

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

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new ApiError(
      "PUSH_PERMISSION_DENIED",
      "브라우저 알림 권한이 허용되지 않았습니다. 브라우저 설정에서 CheckOn 알림을 허용해주세요.",
      0
    );
  }

  const config = await apiRequest("/push/public-key");
  if (!config?.enabled || !config.publicKey) {
    throw new ApiError("PUSH_DISABLED", "현재 브라우저 알림 서버가 준비되지 않았습니다.", 503);
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.publicKey),
    });
  }

  const saved = await apiRequest("/push/subscriptions", {
    method: "PUT",
    body: subscription.toJSON(),
  });
  return { subscription, saved };
}
