import express from "express";
import cors from "cors";
import { getDatabase, ref, push } from "firebase/database";
import { app as firebaseApp } from "./firebase.js";

const db = getDatabase(firebaseApp);
const server = express();

server.use(cors());
server.use(express.json());

server.post("/send-message", (req, res) => {
  const { message, sender } = req.body;
  if (!message) return res.status(400).json({ error: "Empty message" });

  push(ref(db, "messages"), {
    text: message,
    sender: sender || "friend",
    timestamp: Date.now()
  });

  res.json({ status: "ok" });
});

server.listen(3001, () => console.log("Server running on port 3001"));