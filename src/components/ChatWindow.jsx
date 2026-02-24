import { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
  where,
  documentId,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
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
  const [profilesByUid, setProfilesByUid] = useState({});
  const bottomRef = useRef(null);

  // 1) realtime сообщения
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

  // 2) автоскролл
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3) uid авторов
  const senderUids = useMemo(() => {
    const s = new Set();
    for (const m of messages) if (m.senderId) s.add(m.senderId);
    return Array.from(s);
  }, [messages]);

  // 4) догружаем профили авторов пачками (in max 10)
  useEffect(() => {
    let cancelled = false;

    const loadMissingProfiles = async () => {
      const missing = senderUids.filter((uid) => !(uid in profilesByUid));
      if (missing.length === 0) return;

      const chunks = chunk(missing, 10);
      const loaded = {};

      for (const part of chunks) {
        const q = query(collection(db, "users"), where(documentId(), "in", part));
        const snap = await getDocs(q);
        snap.forEach((docSnap) => {
          loaded[docSnap.id] = docSnap.data();
        });
      }

      for (const uid of missing) {
        if (!(uid in loaded)) loaded[uid] = null;
      }

      if (!cancelled && Object.keys(loaded).length > 0) {
        setProfilesByUid((prev) => ({ ...prev, ...loaded }));
      }
    };

    loadMissingProfiles();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [senderUids]);

  // 5) отправка сообщения
  const sendMessage = async (text) => {
    if (!text.trim()) return;

    await addDoc(collection(db, "chats", "globalChat", "messages"), {
      text,
      senderId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  // 6) toggle реакции (сохранение в Firestore)
  const toggleReaction = async (messageId, emoji, currentReactions) => {
    const messageRef = doc(db, "chats", "globalChat", "messages", messageId);
    const users = currentReactions?.[emoji] || [];

    if (users.includes(user.uid)) {
      await updateDoc(messageRef, {
        [`reactions.${emoji}`]: arrayRemove(user.uid),
      });
    } else {
      await updateDoc(messageRef, {
        [`reactions.${emoji}`]: arrayUnion(user.uid),
      });
    }
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
            toggleReaction={toggleReaction}
            currentUid={user.uid}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <MessageInput sendMessage={sendMessage} />
    </div>
  );
}

export default ChatWindow;