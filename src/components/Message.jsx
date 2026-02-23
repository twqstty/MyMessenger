import { useState, useRef, useEffect } from "react";

function Message({ message, isMe, toggleReaction, user }) {
  const [showReactions, setShowReactions] = useState(false);
  const reactions = message.reactions || {};
  const popupRef = useRef(null);

  const emojiList = ["👍", "🔥", "😂", "❤️", "😎", "🛐", "🐷", "🫥", "✅", "🍑", "🤡", "🥊", "🕷️", "🦍", "💋"];

  // Закрытие при клике вне сообщения
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowReactions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`message ${isMe ? "me" : ""}`}
      style={{ position: "relative" }}
      ref={popupRef}
    >
      {!isMe && <strong>{message.senderName}</strong>}

      {/* Текст сообщения */}
      <div
        onClick={() => setShowReactions(true)}
        style={{ cursor: "pointer" }}
      >
        {message.text}
      </div>

      {/* POPUP */}
      {showReactions && (
        <div className="reaction-popup">
          {emojiList.map((emoji) => (
            <span
              key={emoji}
              className="emoji-option"
              onClick={() => {
                toggleReaction(message.id, emoji, reactions);
                setShowReactions(false);
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}

      {/* Отображение выбранных реакций */}
      <div className="reaction-counts">
        {Object.entries(reactions).map(([emoji, users]) =>
          users.length > 0 ? (
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