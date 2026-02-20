function Message({ message, isMe }) {
  return (
    <div className={`message ${isMe ? "me" : ""}`}>
      {!isMe && <strong>{message.senderName}</strong>}
      <div>{message.text}</div>
    </div>
  );
}

export default Message;