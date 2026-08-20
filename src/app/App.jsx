import { useState } from "react";
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
import { loadStoredUser, saveUser } from "./lib/authStorage";

const initialUser = {
  nickname: "민준",
  email: "minjun@checkon.team",
};

export default function App() {
  const [user, setUser] = useState(() => loadStoredUser() ?? initialUser);

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
        <Route path="/groups" element={<GroupListPage user={user} />} />
        <Route path="/groups/new" element={<GroupCreatePage user={user} />} />
        <Route path="/groups/:groupId" element={<GroupDetailPage user={user} />} />
        <Route path="/groups/:groupId/store-info" element={<StoreInfoPage user={user} />} />
        <Route path="/groups/:groupId/ask" element={<StoreAskPage user={user} />} />
        <Route path="/groups/:groupId/tasks/new" element={<TaskCreatePage user={user} />} />
        <Route path="/tasks/:taskId" element={<TaskDetailPage user={user} />} />
        <Route
          path="/tasks/:taskId/verify/photo/:subTaskId"
          element={<PhotoVerificationPage user={user} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
