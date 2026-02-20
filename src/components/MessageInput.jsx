import { useState } from "react";

function MessageInput({ sendMessage }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    sendMessage(text);
    setText("");
  };

  return (
    <div className="input">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Введите сообщение..."
      />
      <button onClick={handleSend}>
        Отправить
      </button>
    </div>
  );
}

export default MessageInput;