import { CircleAlert, Sparkles, UserRound } from "lucide-react";

export default function ChatMessage({ message }) {
  if (message.role === "user") {
    return (
      <div className="chat-message chat-message--user">
        <div className="chat-message__bubble">{message.content}</div>
        <span className="chat-message__avatar"><UserRound size={14} /></span>
      </div>
    );
  }

  const isPending = message.status === "pending";
  const isError = message.status === "error";

  return (
    <div className="chat-message chat-message--assistant">
      <span className="chat-message__avatar chat-message__avatar--ai"><Sparkles size={14} /></span>
      <div className={`chat-message__bubble chat-message__bubble--assistant ${isError ? "is-warning" : ""}`}>
        {isPending ? (
          <span className="chat-message__typing" aria-live="polite">
            <span /><span /><span />
          </span>
        ) : (
          <>
            {isError && <CircleAlert size={13} />}
            <span>{message.content}</span>
          </>
        )}
      </div>
    </div>
  );
}
