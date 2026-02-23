function Message({ message, isMe, toggleReaction, user }) {
  const reactions = message.reactions || {};

  return (
    <div className={`message ${isMe ? "me" : ""}`}>
      {!isMe && <strong>{message.senderName}</strong>}
      
      <div>{message.text}</div>

      {/* Кнопки реакций */}
      <div className="reactions">
        {["👍", "🔥", "😂"].map((emoji) => (
          <button
            key={emoji}
            onClick={() =>
              toggleReaction(message.id, emoji, reactions)
            }
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Отображение количества */}
      <div className="reaction-counts">
        {Object.entries(reactions).map(([emoji, users]) =>
          users.length > 0 ? (
            <span key={emoji}>
              {emoji} {users.length}
            </span>
          ) : null
        )}
      </div>
    </div>
  );
}

export default Message;