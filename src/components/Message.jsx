import { Link } from "react-router-dom";
import { useState, useRef, useEffect, useMemo } from "react";

function formatTime(ts) {
  if (!ts) return "…"; // пока сервер не проставил время
  const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
  // HH:MM
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatDateIfNotToday(ts) {
  if (!ts) return "";
  const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
  const now = new Date();

  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (sameDay) return "";

  // DD.MM.YYYY
  const dd = String(d.getDate()).padStart(2, "0");
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}.${mo}.${yy}`;
}

function Message({ message, isMe, authorProfile, toggleReaction, currentUid }) {
  const [showReactions, setShowReactions] = useState(false);
  const popupRef = useRef(null);

  const reactions = message.reactions || {};
  const emojiList = ["👍", "🔥", "😂", "❤️", "😎", "🛐", "🐷", "🫥", "✅", "🍑", "🤡", "🥊", "🕷️", "🦍", "💋"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowReactions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const username = authorProfile?.username;
  const name = authorProfile?.name;
  const avatar = authorProfile?.photoBase64;

  const iReacted = (emoji) => (reactions?.[emoji] || []).includes(currentUid);

  const timeText = useMemo(() => formatTime(message.createdAt), [message.createdAt]);
  const dateText = useMemo(() => formatDateIfNotToday(message.createdAt), [message.createdAt]);

  return (
    <div
      className={`message ${isMe ? "me" : ""}`}
      style={{ position: "relative" }}
      ref={popupRef}
    >
      {!isMe && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
          {avatar ? (
            <img
              src={avatar}
              alt="avatar"
              style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#ddd" }} />
          )}

          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontWeight: 700 }}>{name || "Unknown"}</span>
            {username ? (
              <Link to={`/u/${username}`} style={{ fontSize: 12, opacity: 0.75 }}>
                @{username}
              </Link>
            ) : (
              <span style={{ fontSize: 12, opacity: 0.6 }}>(no username)</span>
            )}
          </div>
        </div>
      )}

      <div onClick={() => setShowReactions(true)} style={{ cursor: "pointer" }}>
        {message.text}
      </div>

      {/* время/дата */}
      <div className={`msg-meta ${isMe ? "me-meta" : ""}`}>
        {dateText ? `${dateText} ${timeText}` : timeText}
      </div>

      {showReactions && (
        <div className="reaction-popup">
          {emojiList.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="emoji-option"
              onClick={() => {
                toggleReaction(message.id, emoji, reactions);
                setShowReactions(false);
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 18,
                opacity: iReacted(emoji) ? 1 : 0.8,
                transform: iReacted(emoji) ? "scale(1.1)" : "scale(1)",
              }}
              title={iReacted(emoji) ? "Убрать реакцию" : "Поставить реакцию"}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="reaction-counts">
        {Object.entries(reactions).map(([emoji, users]) =>
          Array.isArray(users) && users.length > 0 ? (
            <span
              key={emoji}
              className="reaction-badge"
              style={{
                fontWeight: (users || []).includes(currentUid) ? 800 : 400,
              }}
              title={(users || []).includes(currentUid) ? "Ты поставил" : ""}
            >
              {emoji} {users.length}
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}

export default Message;