let deferredInstallPrompt = null;

function announceInstallAvailability() {
  window.dispatchEvent(new CustomEvent("checkon:install-availability-changed"));
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  announceInstallAvailability();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  announceInstallAvailability();
});

export function isIosDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function isMobileDevice() {
  return window.matchMedia("(max-width: 820px)").matches
    || /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

export function isStandaloneApp() {
  return window.matchMedia("(display-mode: standalone)").matches
    || navigator.standalone === true;
}

export function canPromptInstall() {
  return deferredInstallPrompt != null;
}

export async function promptInstall() {
  if (!deferredInstallPrompt) return { outcome: "unavailable" };

  const prompt = deferredInstallPrompt;
  deferredInstallPrompt = null;
  await prompt.prompt();
  const choice = await prompt.userChoice;
  announceInstallAvailability();
  return choice;
}
