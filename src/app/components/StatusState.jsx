import { ArrowRight, CircleAlert, LockKeyhole, SearchX } from "lucide-react";
import { useNavigate } from "react-router";
import AppShell from "./AppShell";
import "./StatusState.css";

const stateConfig = {
  login: {
    eyebrow: "LOGIN REQUIRED",
    icon: LockKeyhole,
    title: "로그인이 필요합니다",
    description: "로그인 정보가 없어 이 화면을 이용할 수 없습니다. 로그인 후 다시 시도해주세요.",
    actionLabel: "로그인으로 이동",
    actionPath: "/login",
  },
  group: {
    eyebrow: "GROUP NOT FOUND",
    icon: SearchX,
    title: "그룹을 찾을 수 없어요",
    description: "그룹 ID가 잘못되었거나 더 이상 참여할 수 없는 그룹입니다. 그룹 목록에서 다시 확인해주세요.",
    actionLabel: "그룹 목록으로 이동",
    actionPath: "/groups",
  },
  task: {
    eyebrow: "TASK NOT FOUND",
    icon: SearchX,
    title: "태스크를 찾을 수 없어요",
    description: "태스크 ID가 잘못되었거나 삭제된 태스크입니다. 그룹 목록에서 다른 태스크를 확인해주세요.",
    actionLabel: "그룹 목록으로 이동",
    actionPath: "/groups",
  },
  access: {
    eyebrow: "ACCESS DENIED",
    icon: CircleAlert,
    title: "이 화면에 접근할 수 없습니다",
    description: "현재 로그인한 계정에는 이 그룹을 확인할 권한이 없습니다. 참여 중인 그룹을 다시 확인해주세요.",
    actionLabel: "그룹 목록으로 이동",
    actionPath: "/groups",
  },
};

export default function StatusState({ user, type, title, description, actionLabel, actionPath, onAction, embedded = false }) {
  const navigate = useNavigate();
  const config = stateConfig[type] ?? stateConfig.access;
  const Icon = config.icon;
  const handleAction = () => {
    if (onAction) {
      onAction();
      return;
    }

    navigate(actionPath ?? config.actionPath);
  };

  const content = (
    <section className="status-state page-card" role="alert">
      <span className="status-state__icon"><Icon size={22} /></span>
      <span className="status-state__eyebrow">{config.eyebrow}</span>
      <h2>{title ?? config.title}</h2>
      <p>{description ?? config.description}</p>
      <button className="primary-button" type="button" onClick={handleAction}>
        {actionLabel ?? config.actionLabel} <ArrowRight size={15} />
      </button>
    </section>
  );

  return embedded ? content : (
    <AppShell user={user} title={title ?? config.title} description={description ?? config.description} backTo="/groups">
      {content}
    </AppShell>
  );
}
