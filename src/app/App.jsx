import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/login/LoginPage";
import SignupPage from "./pages/signup/SignupPage";
import GroupListPage from "./pages/groups/GroupListPage";
import GroupCreatePage from "./pages/groupCreate/GroupCreatePage";
import GroupDetailPage from "./pages/groupDetail/GroupDetailPage";
import TaskCreatePage from "./pages/taskCreate/TaskCreatePage";
import TaskDetailPage from "./pages/taskDetail/TaskDetailPage";
import PhotoVerificationPage from "./pages/photoVerification/PhotoVerificationPage";

const initialUser = {
  nickname: "민준",
  email: "minjun@checkon.team",
};

export default function App() {
  const [user, setUser] = useState(initialUser);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLogin={setUser} />} />
        <Route path="/signup" element={<SignupPage onSignup={setUser} />} />
        <Route path="/groups" element={<GroupListPage user={user} />} />
        <Route path="/groups/new" element={<GroupCreatePage user={user} />} />
        <Route path="/groups/:groupId" element={<GroupDetailPage user={user} />} />
        <Route path="/groups/:groupId/tasks/new" element={<TaskCreatePage user={user} />} />
        <Route path="/tasks/:taskId" element={<TaskDetailPage user={user} />} />
        <Route
          path="/tasks/:taskId/verify/photo"
          element={<PhotoVerificationPage user={user} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
