import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAt,
  endAt,
} from "firebase/firestore";

function normalizeUsername(s) {
  return s.trim().toLowerCase().replace(/\s+/g, "_");
}

function SearchUsers() {
  const [qText, setQText] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const qNorm = useMemo(() => normalizeUsername(qText), [qText]);

  const search = async () => {
    setError("");
    setResults([]);
    if (!qNorm) return;

    setBusy(true);
    try {
      // prefix search по username
      const usersRef = collection(db, "users");
      const qq = query(
        usersRef,
        orderBy("username"),
        startAt(qNorm),
        endAt(qNorm + "\uf8ff"),
        limit(20)
      );

      const snap = await getDocs(qq);
      setResults(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setError(e?.message || "Ошибка поиска");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 520, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Link to="/">← Чат</Link>
        <Link to="/profile">Мой профиль</Link>
      </div>

      <h2>Поиск пользователей</h2>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Никнейм (например: sigma)"
          value={qText}
          onChange={(e) => setQText(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={search} disabled={busy}>
          {busy ? "..." : "Найти"}
        </button>
      </div>

      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
        Ищет по началу ника: <b>@{qNorm || "..."}</b>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {results.map((u) => (
          <Link
            key={u.id}
            to={`/u/${u.username}`}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 10,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            {u.photoBase64 ? (
              <img
                src={u.photoBase64}
                alt="avatar"
                style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#ddd" }} />
            )}
            <div>
              <div style={{ fontWeight: 800 }}>{u.name}</div>
              <div style={{ opacity: 0.75 }}>@{u.username}</div>
            </div>
          </Link>
        ))}

        {!busy && qNorm && results.length === 0 && (
          <div style={{ marginTop: 10, opacity: 0.7 }}>Ничего не найдено</div>
        )}
      </div>
    </div>
  );
}

export default SearchUsers;