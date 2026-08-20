import { Bot, Check, CornerDownLeft, LoaderCircle, LockKeyhole, Send, Sparkles, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ApiError } from "../../../api/client";
import { getGroupAgentHistory, getGroupAgentTurn, sendGroupAgentMessage } from "../../../api/agentApi";

const QUICK_REQUESTS = [
  {
    label: "진행 현황 요약",
    prompt:
      "현재 이 그룹에서 진행 중인 태스크를 담당자, 마감 시간, 완료한 체크리스트 수/전체 수, 완료율과 함께 정리해줘. 마감이 가까운 순서로 보여주고, 진행 중인 태스크가 없으면 없다고 알려줘.",
  },
  {
    label: "점검 태스크 생성",
    prompt:
      "‘오늘 매장 운영 점검’ 태스크를 지금부터 2시간 뒤 마감으로 만들어줘. 담당자는 현재 그룹에서 구성원 ID(memberId)가 가장 작은 WORKER에게 배정하고 완료 알림은 켜줘. 체크리스트는 ① 입구와 계산대 주변 정리 상태 확인(CHECK), ② POS 전원이 켜진 화면 촬영(PHOTO, 화면이 켜져 정상 동작하는 모습이 보여야 함), ③ 매장 전체 조명이 켜진 전경 촬영(PHOTO, 매장 내부 조명이 모두 켜진 모습이 보여야 함)으로 구성해줘. WORKER가 없으면 생성하지 말고 알려줘.",
  },
  {
    label: "오늘 행사 추가",
    prompt:
      "기존 매장 정보는 하나도 삭제하거나 수정하지 말고, 같은 내용이 없을 때만 행사 정보를 새로 추가해줘. 카테고리는 PROMOTION, 제목은 ‘오늘 아메리카노 할인’, 내용은 ‘오늘 영업시간 동안 아메리카노를 500원 할인한다. 다른 쿠폰과 중복 적용할 수 없으며 재고 소진 시 종료한다.’로 저장해줘. 이미 같은 행사가 있으면 중복 추가하지 말고 현재 내용을 알려줘.",
  },
  {
    label: "전체 알바생 알림",
    prompt:
      "현재 이 그룹의 모든 WORKER에게 ‘오늘 할당된 태스크와 마감 시간을 확인해 주세요. 완료한 항목은 바로 체크하고, 사진이 필요한 항목은 완료 상태가 잘 보이게 촬영해 주세요.’라는 알림을 보내줘. WORKER가 한 명도 없거나 전체 수신자를 확인할 수 없으면 임의로 보내지 말고 이유를 알려줘.",
  },
];
const RECOVERY_POLL_INTERVAL_MS = 1_500;
const RECOVERY_POLL_LIMIT = 80;
const LIVE_POLL_INTERVAL_MS = 650;
const LIVE_POLL_LIMIT = 200;
const INTERNAL_CONTEXT_PREFIX = "AI가 참고한 정보:";

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function waitForFinishedTurn({ groupId, managerId, requestId, initialTurn, isActive }) {
  let turn = initialTurn;
  for (let attempt = 0; turn?.status === "PROCESSING" && attempt < RECOVERY_POLL_LIMIT; attempt += 1) {
    await wait(RECOVERY_POLL_INTERVAL_MS);
    if (!isActive()) return turn;
    try {
      turn = await getGroupAgentTurn({ groupId, managerId, requestId });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) throw error;
      if (attempt === RECOVERY_POLL_LIMIT - 1) throw error;
    }
  }
  return turn;
}

async function watchTurn({ groupId, managerId, requestId, isActive, onUpdate }) {
  for (let attempt = 0; attempt < LIVE_POLL_LIMIT && isActive(); attempt += 1) {
    await wait(LIVE_POLL_INTERVAL_MS);
    if (!isActive()) return;
    try {
      const turn = await getGroupAgentTurn({ groupId, managerId, requestId });
      if (!isActive()) return;
      onUpdate(turn);
      if (turn?.status !== "PROCESSING") return;
    } catch (error) {
      if (!(error instanceof ApiError) || (error.status !== 404 && error.code !== "NETWORK_ERROR")) return;
    }
  }
}

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function userFacingAssistantMessage(value = "") {
  return value
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith(INTERNAL_CONTEXT_PREFIX))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function createRequestId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

function NotificationReceipt({ card }) {
  return (
    <article className={`agent-notification-receipt ${card.success ? "is-success" : "is-failed"}`}>
      <div className="agent-notification-receipt__rail">
        <span>{card.success ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}</span>
        <div>
          <strong>{card.success ? "알림 전송 예약" : "알림을 보내지 못함"}</strong>
          <small>WORKER MESSAGE</small>
        </div>
      </div>
      <div className="agent-notification-receipt__body">
        <div className="agent-notification-receipt__recipients">
          <span>수신자</span>
          <div>
            {(card.recipients ?? []).map((recipient) => (
              <em key={recipient.memberId}><UserRound size={11} />{recipient.nickname}</em>
            ))}
            {!card.recipients?.length && <em>확인되지 않음</em>}
          </div>
        </div>
        <p>{card.message}</p>
        {card.errorMessage && <small role="alert">{card.errorMessage}</small>}
      </div>
    </article>
  );
}

function ToolActivityTrail({ activities = [] }) {
  if (!activities.length) return null;
  return (
    <ol className="agent-tool-activities" aria-label="에이전트 작업 내역">
      {activities.map((activity, index) => (
        <li className={`is-${activity.status.toLowerCase()}`} key={`${activity.callId}-${index}`}>
          <span aria-hidden="true">
            {activity.status === "RUNNING" && <LoaderCircle className="is-spinning" size={12} />}
            {activity.status === "SUCCEEDED" && <Check size={11} strokeWidth={3} />}
            {activity.status === "FAILED" && <X size={11} strokeWidth={3} />}
          </span>
          <p>{activity.message}</p>
        </li>
      ))}
    </ol>
  );
}

function AgentTurn({ turn }) {
  const isProcessing = turn.status === "PROCESSING";
  const rawActivities = turn.activities ?? [];
  const activities = rawActivities.filter(
    (activity) => activity.tool?.toUpperCase() !== "SEND_NOTIFICATION"
  );
  const assistantMessage = userFacingAssistantMessage(turn.assistantMessage);
  return (
    <div className="group-agent-turn">
      <div className="group-agent-message group-agent-message--manager">
        <div className="group-agent-message__meta"><span>{turn.managerNickname || "매니저"}</span><time>{formatTime(turn.createdAt)}</time></div>
        <p>{turn.userMessage}</p>
      </div>
      <div className="group-agent-message group-agent-message--assistant">
        <span className="group-agent-message__avatar"><Bot size={15} /></span>
        <div className="group-agent-message__content">
          <div className="group-agent-message__meta"><span>CheckOn 에이전트</span><time>{formatTime(turn.createdAt)}</time></div>
          {isProcessing && !rawActivities.length ? (
            <p className="group-agent-message__thinking"><LoaderCircle size={14} /> 그룹 정보를 확인하고 있어요.</p>
          ) : null}
          <ToolActivityTrail activities={activities} />
          {!isProcessing && assistantMessage && <p>{assistantMessage}</p>}
          {(turn.notificationCards ?? []).map((card) => <NotificationReceipt key={card.callId} card={card} />)}
        </div>
      </div>
    </div>
  );
}

export default function GroupAgentPanel({ groupId, groupName, managerId, onMutated }) {
  const [turns, setTurns] = useState([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const viewportRef = useRef(null);
  const retryRequestRef = useRef(null);
  const mountedRef = useRef(true);
  const onMutatedRef = useRef(onMutated);
  const hasProcessingTurn = turns.some((turn) => turn.status === "PROCESSING");

  onMutatedRef.current = onMutated;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setErrorMessage("");
    getGroupAgentHistory({ groupId, managerId })
      .then((history) => {
        if (!cancelled) setTurns(history ?? []);
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(error instanceof ApiError ? error.message : "대화 기록을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [groupId, managerId]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: turns.length > 1 ? "smooth" : "auto" });
  }, [turns, isSending]);

  const showRecoveredTurn = (requestId, turn, message, mutated = false) => {
    if (!mountedRef.current) return;
    setTurns((current) => current.map((item) => item.requestId === requestId ? turn : item));
    retryRequestRef.current = null;
    if (turn?.status === "FAILED") setDraft(message);
    if (turn?.status === "COMPLETED" && mutated) onMutatedRef.current?.();
    if (turn?.status === "PROCESSING") {
      setErrorMessage("서버에서 요청을 계속 처리하고 있습니다. 잠시 후 대화 기록을 다시 확인해 주세요.");
    }
  };

  useEffect(() => {
    if (isLoading || isSending) return undefined;
    const pending = turns.slice().reverse().find((turn) => turn.status === "PROCESSING");
    if (!pending) return undefined;
    let active = true;
    void waitForFinishedTurn({
      groupId,
      managerId,
      requestId: pending.requestId,
      initialTurn: pending,
      isActive: () => active && mountedRef.current,
    })
      .then((turn) => {
        if (!active || !mountedRef.current) return;
        setTurns((current) => current.map((item) => item.requestId === pending.requestId ? turn : item));
        if (turn?.status === "COMPLETED") onMutatedRef.current?.();
      })
      .catch(() => {
        if (active && mountedRef.current) {
          setErrorMessage("처리 상태를 확인하지 못했습니다. 잠시 후 다시 열어 확인해 주세요.");
        }
      });
    return () => {
      active = false;
    };
  }, [groupId, isLoading, isSending, managerId, turns]);

  const submit = async (event) => {
    event?.preventDefault();
    const message = draft.trim();
    if (!message || isSending || hasProcessingTurn) return;

    const requestId = retryRequestRef.current?.message === message
      ? retryRequestRef.current.requestId
      : createRequestId();
    const optimisticTurn = {
      turnId: `pending-${requestId}`,
      requestId,
      managerNickname: "매니저",
      userMessage: message,
      assistantMessage: null,
      status: "PROCESSING",
      activities: [],
      notificationCards: [],
      createdAt: new Date().toISOString(),
    };
    setTurns((current) => [...current, optimisticTurn]);
    setDraft("");
    setErrorMessage("");
    setIsSending(true);
    let livePolling = true;
    void watchTurn({
      groupId,
      managerId,
      requestId,
      isActive: () => livePolling && mountedRef.current,
      onUpdate: (turn) => {
        setTurns((current) => current.map((item) => item.requestId === requestId ? turn : item));
      },
    });
    try {
      const result = await sendGroupAgentMessage({ groupId, managerId, requestId, message });
      const turn = await waitForFinishedTurn({
        groupId,
        managerId,
        requestId,
        initialTurn: result.turn,
        isActive: () => mountedRef.current,
      });
      livePolling = false;
      showRecoveredTurn(requestId, turn, message, result.mutated || result.turn?.status === "PROCESSING");
    } catch (error) {
      livePolling = false;
      const canRecover = error instanceof ApiError
        && (error.code === "TIMEOUT" || error.code === "NETWORK_ERROR" || error.status >= 500);
      if (error instanceof ApiError) {
        try {
          const existing = await getGroupAgentTurn({ groupId, managerId, requestId });
          const recovered = canRecover
            ? await waitForFinishedTurn({
                groupId,
                managerId,
                requestId,
                initialTurn: existing,
                isActive: () => mountedRef.current,
              })
            : existing;
          showRecoveredTurn(requestId, recovered, message, true);
          return;
        } catch {
          // 서버에 요청 기록이 없거나 조회도 실패한 경우에만 사용자가 직접 다시 보낼 수 있게 복원합니다.
        }
      }
      if (!mountedRef.current) return;
      setTurns((current) => current.filter((turn) => turn.requestId !== requestId));
      setDraft(message);
      retryRequestRef.current = { requestId, message };
      setErrorMessage(error instanceof ApiError ? error.message : "요청을 처리하지 못했습니다. 다시 시도해주세요.");
    } finally {
      livePolling = false;
      setIsSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <section className="group-agent-panel page-card" aria-label={`${groupName} 매니저 에이전트`}>
      <header className="group-agent-panel__header">
        <div className="group-agent-panel__identity">
          <span><Sparkles size={17} /></span>
          <div><small>MANAGER AGENT</small><h2>{groupName} 운영 에이전트</h2></div>
        </div>
        <div className="group-agent-panel__scope"><LockKeyhole size={12} /><span>이 그룹 안에서만 조회·실행</span></div>
      </header>

      <div className="group-agent-panel__viewport" ref={viewportRef} aria-live="polite">
        {isLoading ? (
          <div className="group-agent-panel__empty"><LoaderCircle className="is-spinning" size={20} /><p>대화 기록을 불러오는 중이에요.</p></div>
        ) : turns.length ? (
          turns.map((turn) => <AgentTurn key={turn.turnId} turn={turn} />)
        ) : (
          <div className="group-agent-panel__welcome">
            <span><Bot size={20} /></span>
            <div>
              <strong>무엇을 처리할까요?</strong>
              <p>태스크를 만들거나 수정하고, 진행 상황을 확인하고, 매장 정보를 정리하거나 알바생에게 알림을 보낼 수 있어요.</p>
            </div>
          </div>
        )}
      </div>

      {!turns.length && !isLoading && (
        <div className="group-agent-panel__quick-requests">
          {QUICK_REQUESTS.map(({ label, prompt }) => (
            <button type="button" key={label} title={prompt} onClick={() => setDraft(prompt)}>
              {label}
            </button>
          ))}
        </div>
      )}

      <form className="group-agent-composer" onSubmit={submit}>
        <div>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="예: 지우에게 내일 오전 9시까지 오픈 점검 태스크를 만들어줘"
            maxLength={2000}
            rows={2}
            disabled={isSending || hasProcessingTurn}
            aria-label="에이전트에게 요청"
          />
          <span>{draft.length.toLocaleString()} / 2,000</span>
        </div>
        <button type="submit" disabled={!draft.trim() || isSending || hasProcessingTurn} aria-label="요청 보내기">
          {isSending ? <LoaderCircle className="is-spinning" size={18} /> : <Send size={17} />}
        </button>
      </form>
      <div className="group-agent-panel__hint"><CornerDownLeft size={11} /> Enter로 전송 · Shift+Enter로 줄바꿈</div>
      {errorMessage && <p className="group-agent-panel__error" role="alert">{errorMessage}</p>}
    </section>
  );
}
