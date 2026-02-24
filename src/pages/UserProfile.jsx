import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { makeDefaultAvatarDataUri } from "../utils/avatar";
import "../styles.css";

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
  <div className="profile-wrapper">
    <div className="profile-card">

      <Link to="/" className="profile-back">
        ← Назад в чат
      </Link>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {profile && (
        <>
          <div className="profile-top">
            <img
              src={profile.photoBase64}
              alt="avatar"
              className="profile-avatar"
            />

            <div className="profile-info">
              <div className="profile-name">
                {profile.name}
              </div>
              <div className="profile-username">
                @{profile.username}
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="profile-section-title">О себе</div>
            <div className="profile-bio">
              {profile.bio || "Пользователь ничего не написал."}
            </div>
          </div>

          {profile.birthdate && (
            <div className="profile-birth">
              Дата рождения: {profile.birthdate}
            </div>
          )}
        </>
      )}

    </div>
  </div>
);
}

export default UserProfile;