import { useEffect, useMemo, useState } from "react";
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
  return (s || "").trim().toLowerCase().replace(/\s+/g, "_");
}

function SearchUsers() {
  const [qText, setQText] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const qNorm = useMemo(() => normalizeUsername(qText), [qText]);

  const search = async (needle) => {
    setError("");
    setResults([]);
    if (!needle) return;

    setBusy(true);
    try {
      // prefix search по username
      const usersRef = collection(db, "users");
      const qq = query(
        usersRef,
        orderBy("username"),
        startAt(needle),
        endAt(needle + "\uf8ff"),
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

  // Автопоиск с debounce (250ms)
  useEffect(() => {
    if (!qNorm) {
      setResults([]);
      setError("");
      setBusy(false);
      return;
    }

    const t = setTimeout(() => {
      search(qNorm);
    }, 250);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qNorm]);

  const onSubmit = (e) => {
    e.preventDefault();
    search(qNorm);
  };

  const clear = () => {
    setQText("");
    setResults([]);
    setError("");
  };

  return (
    <div className="search-container">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <Link to="/">← Чат</Link>
        <Link to="/profile">Мой профиль</Link>
      </div>

      <h2 style={{ marginTop: 0 }}>Поиск пользователей</h2>

      <form onSubmit={onSubmit} style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          className="search-input"
          placeholder="Никнейм (например: sigma)"
          value={qText}
          onChange={(e) => setQText(e.target.value)}
        />

        <button className="top-btn search" type="submit" disabled={busy || !qNorm}>
          {busy ? "..." : "Найти"}
        </button>

        <button
          className="top-btn logout"
          type="button"
          onClick={clear}
          disabled={busy && !qText}
        >
          Очистить
        </button>
      </form>

      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
        Ищет по началу ника: <b>@{qNorm || "..."}</b>
      </div>

      {error && <p className="auth-error">{error}</p>}

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {results.map((u) => (
          <Link key={u.id} to={`/u/${u.username}`} className="search-result">
            <img
              src={u.photoBase64}
              alt="avatar"
              className="search-avatar"
            />
            <div>
              <div className="search-name">{u.name}</div>
              <div className="search-username">@{u.username}</div>
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