import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import Message from "./Message";
import MessageInput from "./MessageInput";

function ChatWindow({ user }) {
  if (!user) return null;

  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, "chats", "globalChat", "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    await addDoc(
      collection(db, "chats", "globalChat", "messages"),
      {
        text,
        senderId: user.uid,
        senderName: user.displayName,
        createdAt: serverTimestamp(),
      }
    );
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        SigmaChat
      </div>

      <div className="messages">
        {messages.map((msg) => (
          <Message
            key={msg.id}
            message={msg}
            isMe={msg.senderId === user.uid}
          />
        ))}
        <div ref={bottomRef}></div>
      </div>

      <MessageInput sendMessage={sendMessage} />
    </div>
  );
}

export default ChatWindow;