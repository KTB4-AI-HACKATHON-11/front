import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/login/LoginPage";
import SignupPage from "./pages/signup/SignupPage";
import GroupListPage from "./pages/groups/GroupListPage";
import GroupCreatePage from "./pages/groupCreate/GroupCreatePage";
import GroupDetailPage from "./pages/groupDetail/GroupDetailPage";
import StoreInfoPage from "./pages/storeInfo/StoreInfoPage";
import StoreAskPage from "./pages/storeAsk/StoreAskPage";
import TaskCreatePage from "./pages/taskCreate/TaskCreatePage";
import TaskDetailPage from "./pages/taskDetail/TaskDetailPage";
import PhotoVerificationPage from "./pages/photoVerification/PhotoVerificationPage";
import { clearStoredUser, loadStoredUser, saveUser } from "./lib/authStorage";
import { getCurrentMember } from "./api/memberApi";
import { ApiError } from "./api/client";

function RequireAuth({ user, children }) {
  if (!user?.memberId) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const [user, setUser] = useState(() => loadStoredUser());

  useEffect(() => {
    if (!user?.memberId) return;
    let cancelled = false;
    getCurrentMember()
      .then((member) => {
        if (cancelled) return;
        const nextUser = {
          memberId: member.memberId,
          nickname: member.nickname,
          role: member.role,
        };
        setUser(nextUser);
        saveUser(nextUser);
      })
      .catch((error) => {
        if (cancelled) return;
        // 네트워크가 잠깐 끊겼다고 로그인 정보를 지우지는 않습니다. 서버가 세션이 없다고
        // 명확히 답한 경우에만 로컬 상태를 정리합니다.
        if (error instanceof ApiError && error.status === 401) {
          clearStoredUser();
          setUser(null);
        }
      });
    return () => {
      cancelled = true;
    };
    // 저장된 로그인 세션은 앱 시작 시 한 번만 검증합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 로그인/회원가입 성공 시 state와 localStorage를 함께 갱신합니다.
  // (localStorage에 저장해두지 않으면 새로고침할 때마다 memberId 등 로그인 정보가 사라집니다.)
  const handleAuthenticated = (nextUser) => {
    setUser(nextUser);
    saveUser(nextUser);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleAuthenticated} />} />
        <Route path="/signup" element={<SignupPage onSignup={handleAuthenticated} />} />
        <Route path="/groups" element={<RequireAuth user={user}><GroupListPage user={user} /></RequireAuth>} />
        <Route path="/groups/new" element={<RequireAuth user={user}><GroupCreatePage user={user} /></RequireAuth>} />
        <Route path="/groups/:groupId" element={<RequireAuth user={user}><GroupDetailPage user={user} /></RequireAuth>} />
        <Route path="/groups/:groupId/store-info" element={<RequireAuth user={user}><StoreInfoPage user={user} /></RequireAuth>} />
        <Route path="/groups/:groupId/ask" element={<RequireAuth user={user}><StoreAskPage user={user} /></RequireAuth>} />
        <Route path="/groups/:groupId/tasks/new" element={<RequireAuth user={user}><TaskCreatePage user={user} /></RequireAuth>} />
        <Route path="/tasks/:taskId" element={<RequireAuth user={user}><TaskDetailPage user={user} /></RequireAuth>} />
        <Route path="/task-runs/:runId" element={<RequireAuth user={user}><TaskDetailPage user={user} /></RequireAuth>} />
        <Route
          path="/tasks/:taskId/verify/photo/:subTaskId"
          element={<RequireAuth user={user}><PhotoVerificationPage user={user} /></RequireAuth>}
        />
        <Route
          path="/task-runs/:runId/verify/photo/:subTaskId"
          element={<RequireAuth user={user}><PhotoVerificationPage user={user} /></RequireAuth>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
