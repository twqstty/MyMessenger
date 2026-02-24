import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

function Message({ message, isMe, authorProfile }) {
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

      {showReactions && (
        <div className="reaction-popup">
          {emojiList.map((emoji) => (
            <span
              key={emoji}
              className="emoji-option"
              onClick={() => {
                setShowReactions(false);
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}

      <div className="reaction-counts">
        {Object.entries(reactions).map(([emoji, users]) =>
          users?.length > 0 ? (
            <span key={emoji} className="reaction-badge">
              {emoji} {users.length}
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}

export default Message;






