import { ChevronLeft, LayoutGrid, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import BrandMark from "./BrandMark";
import { clearStoredUser } from "../lib/authStorage";
import "./AppShell.css";

const navigation = [
  { label: "내 그룹", icon: LayoutGrid, path: "/groups" },
];

function buildBreadcrumbs(pathname, title) {
  if (pathname === "/groups") {
    return [{ label: "내 그룹", path: "/groups", current: true }];
  }

  if (pathname === "/groups/new") {
    return [
      { label: "내 그룹", path: "/groups" },
      { label: "새 그룹", path: "/groups/new", current: true },
    ];
  }

  const groupTaskCreateMatch = pathname.match(/^\/groups\/([^/]+)\/tasks\/new$/);
  if (groupTaskCreateMatch) {
    const [, groupId] = groupTaskCreateMatch;
    return [
      { label: "내 그룹", path: "/groups" },
      { label: "그룹 상세", path: `/groups/${groupId}` },
      { label: "새 태스크", path: pathname, current: true },
    ];
  }

  const storeInfoMatch = pathname.match(/^\/groups\/([^/]+)\/store-info$/);
  if (storeInfoMatch) {
    const [, groupId] = storeInfoMatch;
    return [
      { label: "내 그룹", path: "/groups" },
      { label: "그룹 상세", path: `/groups/${groupId}` },
      { label: "매장 정보 관리", path: pathname, current: true },
    ];
  }

  const storeAskMatch = pathname.match(/^\/groups\/([^/]+)\/ask$/);
  if (storeAskMatch) {
    const [, groupId] = storeAskMatch;
    return [
      { label: "내 그룹", path: "/groups" },
      { label: "그룹 상세", path: `/groups/${groupId}` },
      { label: "AI에게 물어보기", path: pathname, current: true },
    ];
  }

  const groupDetailMatch = pathname.match(/^\/groups\/([^/]+)$/);
  if (groupDetailMatch) {
    return [
      { label: "내 그룹", path: "/groups" },
      { label: title || "그룹 상세", path: pathname, current: true },
    ];
  }

  const photoVerificationMatch = pathname.match(/^\/tasks\/([^/]+)\/verify\/photo$/);
  if (photoVerificationMatch) {
    const [, taskId] = photoVerificationMatch;
    return [
      { label: "내 그룹", path: "/groups" },
      { label: "태스크 상세", path: `/tasks/${taskId}` },
      { label: "사진 검증", path: pathname, current: true },
    ];
  }

  const taskDetailMatch = pathname.match(/^\/tasks\/([^/]+)$/);
  if (taskDetailMatch) {
    return [
      { label: "내 그룹", path: "/groups" },
      { label: title || "태스크 상세", path: pathname, current: true },
    ];
  }

  return title ? [{ label: title, path: pathname, current: true }] : [];
}

export default function AppShell({ user, children, title, description, backTo, actions, onBeforeNavigate, breadcrumbs }) {
  const navigate = useNavigate();
  const location = useLocation();
  const displayUser = user ?? { nickname: "CheckOn 멤버", email: "" };
  const brandPath = location.pathname.startsWith("/groups") || location.pathname.startsWith("/tasks") ? "/groups" : "/";
  const resolvedBreadcrumbs = breadcrumbs?.length ? breadcrumbs : buildBreadcrumbs(location.pathname, title);
  const confirmNavigation = () => (typeof onBeforeNavigate === "function" ? onBeforeNavigate() : true);
  const handleNavigate = (path) => {
    if (!confirmNavigation()) {
      return;
    }

    navigate(path);
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link
          className="app-sidebar__brand"
          to={brandPath}
          onClick={(event) => {
            if (confirmNavigation()) {
              return;
            }

            event.preventDefault();
          }}
        >
          <BrandMark compact />
        </Link>

        <nav className="app-sidebar__nav" aria-label="주요 메뉴">
          <p className="app-sidebar__section-label">WORKSPACE</p>
          {navigation.map(({ label, icon: Icon, path }) => {
            const isActive = location.pathname.startsWith("/groups") || location.pathname.startsWith("/tasks/");

            return (
              <button
                className={`app-sidebar__item ${isActive ? "app-sidebar__item--active" : ""}`}
                key={label}
                onClick={() => handleNavigate(path)}
              >
                <Icon size={17} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="app-sidebar__profile">
          <div className="app-sidebar__avatar">{displayUser.nickname.slice(0, 1)}</div>
          <div className="app-sidebar__profile-copy">
            <strong>{displayUser.nickname}</strong>
            <span>{displayUser.email || "CheckOn 멤버"}</span>
          </div>
          <button
            className="icon-button"
            onClick={() => {
              if (!confirmNavigation()) {
                return;
              }

              clearStoredUser();
              navigate("/login");
            }}
            title="로그아웃"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="app-shell__content">
        <header className="app-header">
          <div className="app-header__title-wrap">
            {backTo && (
              <button className="icon-button icon-button--bordered" onClick={() => handleNavigate(backTo)} title="뒤로">
                <ChevronLeft size={19} />
              </button>
            )}
            <div className="app-header__title-copy">
              {resolvedBreadcrumbs.length > 0 && (
                <nav className="app-breadcrumb" aria-label="breadcrumb">
                  {resolvedBreadcrumbs.map((item, index) => (
                    <span className="app-breadcrumb__item" key={`${item.path}-${item.label}`}>
                      {item.current ? (
                        <strong>{item.label}</strong>
                      ) : (
                        <Link
                          to={item.path}
                          onClick={(event) => {
                            if (confirmNavigation()) {
                              return;
                            }

                            event.preventDefault();
                          }}
                        >
                          {item.label}
                        </Link>
                      )}
                      {index < resolvedBreadcrumbs.length - 1 ? <span className="app-breadcrumb__separator">/</span> : null}
                    </span>
                  ))}
                </nav>
              )}
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
