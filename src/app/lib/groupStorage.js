const CREATED_GROUPS_KEY = "checkon:created-groups";

export function formatGroupId(groupId) {
  return String(groupId).padStart(6, "0");
}

export function loadCreatedGroups() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(CREATED_GROUPS_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export function saveCreatedGroup(group) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedGroup = {
    id: formatGroupId(group.id),
    name: group.name,
    description: group.description,
    memberCount: group.memberCount ?? 1,
    taskCount: group.taskCount ?? 0,
    completedCount: group.completedCount ?? 0,
    status: group.status ?? "active",
    accent: group.accent ?? "gold",
    currentUserRole: group.currentUserRole ?? "MANAGER",
  };

  const nextGroups = [
    normalizedGroup,
    ...loadCreatedGroups().filter((item) => item.id !== normalizedGroup.id),
  ];

  window.localStorage.setItem(CREATED_GROUPS_KEY, JSON.stringify(nextGroups));
}

export function mergeGroups(baseGroups) {
  const createdGroups = loadCreatedGroups();
  return [...createdGroups, ...baseGroups.filter((group) => !createdGroups.some((item) => item.id === group.id))];
}
