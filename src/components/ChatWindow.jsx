import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  where,
  documentId,
} from "firebase/firestore";
import Message from "./Message";
import MessageInput from "./MessageInput";

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function ChatWindow({ user }) {
  if (!user) return null;

  const [messages, setMessages] = useState([]);
  const [profilesByUid, setProfilesByUid] = useState({}); // { uid: userDoc }
  const bottomRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, "chats", "globalChat", "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  // автоскролл
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Собираем uid авторов и догружаем их профили
  const senderUids = useMemo(() => {
    const s = new Set();
    for (const m of messages) if (m.senderId) s.add(m.senderId);
    return Array.from(s);
  }, [messages]);

  useEffect(() => {
    let cancelled = false;

    const loadMissingProfiles = async () => {
      const missing = senderUids.filter((uid) => !profilesByUid[uid]);
      if (missing.length === 0) return;

      // Firestore where(documentId(), 'in', [...]) максимум 10
      const chunks = chunk(missing, 10);
      const loaded = {};

      for (const part of chunks) {
        const q = query(
          collection(db, "users"),
          where(documentId(), "in", part)
        );
        const snap = await getDocs(q);
        snap.forEach((docSnap) => {
          loaded[docSnap.id] = docSnap.data();
        });
      }

      // на всякий случай: если кого-то нет в users (старые сообщения), отметим пустым
      for (const uid of missing) {
        if (!loaded[uid]) loaded[uid] = null;
      }

      if (!cancelled) {
        setProfilesByUid((prev) => ({ ...prev, ...loaded }));
      }
    };

    loadMissingProfiles();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [senderUids]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // Пишем в сообщение только senderId + text + createdAt
    // Всё остальное берём из users
    await addDoc(collection(db, "chats", "globalChat", "messages"), {
      text,
      senderId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  return (
    <div className="chat-window">
      <div className="chat-header">SigmaChat</div>

      <div className="messages">
        {messages.map((msg) => (
          <Message
            key={msg.id}
            message={msg}
            isMe={msg.senderId === user.uid}
            authorProfile={profilesByUid[msg.senderId] || null}
          />
        ))}
        <div ref={bottomRef}></div>
      </div>

      <MessageInput sendMessage={sendMessage} />
    </div>
  );
}

export default ChatWindow;