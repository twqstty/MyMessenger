function ChatList({ chats, selectedChat, setSelectedChat }) {
  return (
    <div className="chat-list">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`chat-item ${
            selectedChat === chat.id ? "active" : ""
          }`}
          onClick={() => setSelectedChat(chat.id)}
        >
          {chat.name}
        </div>
      ))}
    </div>
  );
}

export default ChatList;