import { ChevronLeft, LayoutGrid, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import BrandMark from "./BrandMark";
import "./AppShell.css";

const navigation = [
  { label: "내 그룹", icon: LayoutGrid, path: "/groups" },
];

export default function AppShell({ user, children, title, description, backTo, actions }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar__brand">
          <BrandMark compact />
        </div>

        <nav className="app-sidebar__nav" aria-label="주요 메뉴">
          <p className="app-sidebar__section-label">WORKSPACE</p>
          {navigation.map(({ label, icon: Icon, path }) => {
            const isActive = location.pathname.startsWith("/groups") || location.pathname.startsWith("/tasks/");

            return (
              <button
                className={`app-sidebar__item ${isActive ? "app-sidebar__item--active" : ""}`}
                key={label}
                onClick={() => navigate(path)}
              >
                <Icon size={17} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="app-sidebar__profile">
          <div className="app-sidebar__avatar">{user.nickname.slice(0, 1)}</div>
          <div className="app-sidebar__profile-copy">
            <strong>{user.nickname}</strong>
            <span>{user.email || "CheckOn 멤버"}</span>
          </div>
          <button className="icon-button" onClick={() => navigate("/login")} title="로그아웃">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="app-shell__content">
        <header className="app-header">
          <div className="app-header__title-wrap">
            {backTo && (
              <button className="icon-button icon-button--bordered" onClick={() => navigate(backTo)} title="뒤로">
                <ChevronLeft size={19} />
              </button>
            )}
            <div>
              <h1>{title}</h1>
              {description && <p>{description}</p>}
            </div>
          </div>
          <div className="app-header__actions">
            {actions}
          </div>
        </header>
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
