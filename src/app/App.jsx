import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/dashboard/DashboardPage";

export default function App() {
  const [view, setView] = useState("landing");
  const [user, setUser] = useState(null);

  const handleLogin = () => {
    setUser({ name: "김민준", email: "minjun@company.io", initials: "김" });
    setView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setView("landing");
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
      {view === "landing" && <LandingPage onCTA={() => setView("auth")} />}
      {view === "auth" && (
        <AuthPage onLogin={handleLogin} onBack={() => setView("landing")} />
      )}
      {view === "dashboard" && user && (
        <DashboardPage user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
