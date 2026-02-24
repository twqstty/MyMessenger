import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { makeDefaultAvatarDataUri } from "../utils/avatar";

function normalizeUsername(s) {
  return (s || "").trim().toLowerCase().replace(/\s+/g, "_");
}

function UserProfile() {
  const params = useParams();
  const usernameParam = params.username;

  const username = useMemo(() => normalizeUsername(usernameParam), [usernameParam]);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      setProfile(null);

      try {
        if (!username) {
          setError("Пользователь не найден");
          return;
        }

        // 1) usernames/{username} -> uid
        const unameRef = doc(db, "usernames", username);
        const unameSnap = await getDoc(unameRef);
        if (!unameSnap.exists()) {
          setError("Пользователь не найден");
          return;
        }

        const uid = unameSnap.data()?.uid;
        if (!uid) {
          setError("Пользователь не найден");
          return;
        }

        // 2) users/{uid}
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          setError("Профиль не найден");
          return;
        }

        setProfile(userSnap.data());
      } catch (e) {
        setError(e?.message || "Ошибка");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [username]);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  const avatarSrc =
    profile?.photoBase64 || makeDefaultAvatarDataUri(profile?.username || profile?.name || username);

  return (
    <div style={{ padding: 20, maxWidth: 520, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link to="/">← Чат</Link>
        <Link to="/search" style={{ opacity: 0.75 }}>
          Поиск
        </Link>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {profile && (
        <>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
            <img
              src={avatarSrc}
              alt="avatar"
              style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover" }}
            />

            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{profile.name || "Unknown"}</div>
              <div style={{ opacity: 0.75 }}>@{profile.username || username}</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700 }}>О себе</div>
            <div style={{ whiteSpace: "pre-wrap", opacity: 0.9 }}>
              {profile.bio ? profile.bio : "Пусто"}
            </div>
          </div>

          {profile.birthdate && (
            <div style={{ marginTop: 12, opacity: 0.8 }}>
              Дата рождения: {profile.birthdate}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UserProfile;