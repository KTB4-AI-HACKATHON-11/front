import { apiMutation, apiRequest } from "./client";

export function getGroupAgentHistory({ groupId, managerId, limit = 100 }) {
  return apiRequest(
    `/groups/${groupId}/agent/turns?managerId=${encodeURIComponent(managerId)}&limit=${limit}`
  );
}

export function getGroupAgentTurn({ groupId, managerId, requestId }) {
  return apiRequest(
    `/groups/${groupId}/agent/turns/${encodeURIComponent(requestId)}?managerId=${encodeURIComponent(managerId)}`,
    { timeoutMs: 10_000 }
  );
}

export function sendGroupAgentMessage({ groupId, managerId, requestId, message }) {
  return apiMutation(`/groups/${groupId}/agent/messages`, {
    method: "POST",
    body: { managerId, requestId, message },
    timeoutMs: 60_000,
  });
}
