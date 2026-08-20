
  import { createRoot } from "react-dom/client";
  import App from "./app/App.jsx";
  import "./app/lib/pwaInstall.js";
  import "./styles/index.css";

  createRoot(document.getElementById("root")).render(<App />);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // 알림 미지원 환경에서도 앱의 기본 기능은 그대로 사용할 수 있어야 합니다.
      });
    });
  }
  
