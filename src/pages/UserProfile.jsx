import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

function UserProfile() {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      setProfile(null);

      try {
        // 1) usernames/{username} -> uid
        const unameRef = doc(db, "usernames", username);
        const unameSnap = await getDoc(unameRef);
        if (!unameSnap.exists()) {
          setError("Пользователь не найден");
          setLoading(false);
          return;
        }

        const uid = unameSnap.data()?.uid;
        if (!uid) {
          setError("Пользователь не найден");
          setLoading(false);
          return;
        }

        // 2) users/{uid}
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          setError("Профиль не найден");
          setLoading(false);
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

  return (
    <div style={{ padding: 20, maxWidth: 520, margin: "0 auto" }}>
      <Link to="/">← Чат</Link>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {profile && (
        <>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
            {profile.photoBase64 ? (
              <img
                src={profile.photoBase64}
                alt="avatar"
                style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ddd" }} />
            )}

            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{profile.name}</div>
              <div style={{ opacity: 0.75 }}>@{profile.username}</div>
            </div>
          </div>

          {profile.bio && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700 }}>О себе</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{profile.bio}</div>
            </div>
          )}

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