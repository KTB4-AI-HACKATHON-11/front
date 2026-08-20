import { CircleAlert, MessageSquarePlus, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import AppShell from "../../components/AppShell";
import StatusState from "../../components/StatusState";
import { ApiError } from "../../api/client";
import { askStoreQuestion } from "../../api/askApi";
import { getGroupDetail } from "../../api/groupApi";
import { getStoreInfoList } from "../../api/storeInfoApi";
import ChatMessage from "./components/ChatMessage";
import "./StoreAskPage.css";

const SUGGESTED_QUESTIONS = [
  "택배는 몇 시까지 접수하나요?",
  "이번 달 진행 중인 행사가 있나요?",
  "포스기 사용법을 알려주세요",
  "마감할 때 확인해야 할 게 있나요?",
];

// AI 백엔드 명세(POST /v1/knowledge/answer)의 question 필드 상한(1~200자)에 맞춥니다.
const QUESTION_MAX_LENGTH = 200;

function getConversationStorageKey(groupId) {
  return `checkon:store-ask-conversation:${groupId}`;
}

function loadConversationId(groupId) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(getConversationStorageKey(groupId)) || null;
}

let messageIdCounter = 0;
function nextMessageId() {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
}

export default function StoreAskPage({ user }) {
  const { groupId } = useParams();
  const [currentGroup, setCurrentGroup] = useState(null);
  const [isGroupLoading, setIsGroupLoading] = useState(true);
  const [groupLoadError, setGroupLoadError] = useState(null);
  // 매장 정보 등록 여부를 확인하기 전까지는 힌트 배너를 띄우지 않도록 낙관적으로 true로 둡니다.
  const [hasStoreInfo, setHasStoreInfo] = useState(true);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(() => loadConversationId(groupId));
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const listEndRef = useRef(null);

  const hasValidMemberSession = Boolean(user?.memberId);

  useEffect(() => {
    if (!hasValidMemberSession) {
      setIsGroupLoading(false);
      return;
    }

    let cancelled = false;

    async function loadGroupAndStoreInfo() {
      setIsGroupLoading(true);
      // 그룹 상세와 매장 정보 등록 여부는 서로 다른 API라 하나가 실패해도 나머지는 반영되도록
      // allSettled로 독립적으로 처리합니다.
      const [groupResult, storeInfoResult] = await Promise.allSettled([
        getGroupDetail({ groupId, memberId: user.memberId }),
        getStoreInfoList({ groupId, requesterId: user.memberId }),
      ]);

      if (cancelled) return;

      if (groupResult.status === "fulfilled") {
        setCurrentGroup(groupResult.value);
      } else {
        setCurrentGroup(null);
        setGroupLoadError(groupResult.reason);
      }

      // 매장 정보 목록 조회가 실패해도 Q&A 자체를 막지는 않고, 등록 여부 힌트만 생략합니다.
      setHasStoreInfo(storeInfoResult.status === "fulfilled" ? (storeInfoResult.value ?? []).length > 0 : true);
      setIsGroupLoading(false);
    }

    loadGroupAndStoreInfo();
    return () => {
      cancelled = true;
    };
  }, [groupId, hasValidMemberSession, user?.memberId]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    setConversationId(loadConversationId(groupId));
    setMessages([]);
    setQuestion("");
  }, [groupId]);

  const startNewConversation = () => {
    window.localStorage.removeItem(getConversationStorageKey(groupId));
    setConversationId(null);
    setMessages([]);
    setQuestion("");
  };

  const submitQuestion = async (rawQuestion) => {
    const trimmed = rawQuestion.trim();
    if (!trimmed || isAsking) return;

    const userMessageId = nextMessageId();
    const assistantMessageId = nextMessageId();

    setMessages((current) => [
      ...current,
      { id: userMessageId, role: "user", content: trimmed },
      { id: assistantMessageId, role: "assistant", content: "", status: "pending" },
    ]);
    setQuestion("");
    setIsAsking(true);

    try {
      const result = await askStoreQuestion({ conversationId, question: trimmed });
      const nextConversationId = result?.conversationId ?? conversationId;
      setConversationId(nextConversationId);
      if (nextConversationId) {
        window.localStorage.setItem(getConversationStorageKey(groupId), String(nextConversationId));
      }
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId ? { ...message, status: "done", content: result?.answer ?? "" } : message
        )
      );
    } catch (error) {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                status: "error",
                content:
                  error instanceof ApiError
                    ? error.message
                    : "답변을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.",
              }
            : message
        )
      );
    } finally {
      setIsAsking(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitQuestion(question);
  };

  if (!hasValidMemberSession) {
    return <StatusState user={user} type="login" />;
  }

  if (isGroupLoading) {
    return (
      <AppShell user={user} title="매장 Q&A를 불러오는 중" description="잠시만 기다려주세요." backTo="/groups">
        <p className="group-grid__empty">그룹 정보를 불러오는 중이에요...</p>
      </AppShell>
    );
  }

  if (!currentGroup) {
    return (
      <StatusState
        user={user}
        type={groupLoadError instanceof ApiError && groupLoadError.status === 403 ? "access" : "group"}
        description={groupLoadError instanceof ApiError ? groupLoadError.message : undefined}
      />
    );
  }

  const canManage = currentGroup.role === "MANAGER";

  return (
    <AppShell
      user={user}
      title="매장 AI에게 물어보기"
      description={`${currentGroup.name}에 등록된 매장 정보를 바탕으로 AI가 답변해요.`}
      backTo={`/groups/${groupId}`}
      actions={messages.length > 0 ? (
        <button className="secondary-button" type="button" onClick={startNewConversation}>
          <MessageSquarePlus size={15} /> 새 대화
        </button>
      ) : null}
      breadcrumbs={[
        { label: "내 그룹", path: "/groups" },
        { label: currentGroup.name, path: `/groups/${groupId}` },
        { label: "AI에게 물어보기", path: `/groups/${groupId}/ask`, current: true },
      ]}
    >
      {!hasStoreInfo && (
        <div className="store-ask-hint page-card">
          <CircleAlert size={15} />
          <p>
            {canManage
              ? "아직 등록된 매장 정보가 없어요. 매장 정보를 등록해야 AI가 정확하게 답변할 수 있어요."
              : "아직 매니저가 등록한 매장 정보가 없어요. 매니저에게 매장 정보 등록을 요청해보세요."}
          </p>
        </div>
      )}

      <section className="page-card store-ask-panel">
        <div className="store-ask-thread">
          {messages.length === 0 ? (
            <div className="store-ask-empty">
              <span className="store-ask-empty__icon"><Sparkles size={20} /></span>
              <h2>궁금한 걸 편하게 물어보세요</h2>
              <p>등록된 매장 정보(상품 위치, 행사, 택배 접수 시간, 장비 사용법, 운영 규칙 등)를 바탕으로 답변해요.</p>
              <div className="store-ask-suggestions">
                {SUGGESTED_QUESTIONS.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => submitQuestion(suggestion)} disabled={isAsking}>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={listEndRef} />
            </>
          )}
        </div>

        <form className="store-ask-composer" onSubmit={handleSubmit}>
          <div className="store-ask-composer__row">
            <input
              className="text-input"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="예: 우산은 어디에 있나요?"
              maxLength={QUESTION_MAX_LENGTH}
              disabled={isAsking}
              aria-label="질문 입력"
            />
            <button className="primary-button" type="submit" disabled={isAsking || !question.trim()}>
              {isAsking ? "답변 생성 중..." : <><Send size={15} /> 전송</>}
            </button>
          </div>
          <div className="store-ask-composer__meta">
            <span>{question.length}/{QUESTION_MAX_LENGTH}자</span>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
