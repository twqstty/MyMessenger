import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { makeDefaultAvatarDataUri } from "../utils/avatar";

function normalizeUsername(s) {
  return s.trim().toLowerCase().replace(/\s+/g, "_");
}

function Profile({ user }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [name, setName] = useState("");
  const [usernameRaw, setUsernameRaw] = useState("");
  const [bio, setBio] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  const username = useMemo(() => normalizeUsername(usernameRaw), [usernameRaw]);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : null;

      setProfile(data);

      setName(data?.name || user.displayName || "");
      setUsernameRaw(data?.username || "");
      setBio(data?.bio || "");
      setBirthdate(data?.birthdate || "");
      setLoading(false);
    };

    load();
  }, [user.uid, user.displayName]);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");
    setBusy(true);

    try {
      if (!name.trim()) throw new Error("Имя обязательно");
      if (!username) throw new Error("Никнейм обязателен");
      if (username.length < 3) throw new Error("Никнейм минимум 3 символа");

      const newPhotoBase64 = photoFile ? await toBase64(photoFile) : null;
      const oldUsername = profile?.username;
      const finalPhoto = newPhotoBase64 || profile?.photoBase64 || makeDefaultAvatarDataUri(username || name);
      
      await runTransaction(db, async (tx) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error("Профиль не найден");

        // смена никнейма
        if (oldUsername && username !== oldUsername) {
          const oldRef = doc(db, "usernames", oldUsername);
          const newRef = doc(db, "usernames", username);

          const newSnap = await tx.get(newRef);
          if (newSnap.exists()) throw new Error("Этот никнейм уже занят");

          const oldSnap = await tx.get(oldRef);
          if (oldSnap.exists() && oldSnap.data()?.uid === user.uid) {
            tx.delete(oldRef);
          }

          tx.set(newRef, { uid: user.uid, updatedAt: serverTimestamp() });
        }

        tx.update(userRef, {
        name: name.trim(),
        username,
        bio: bio.trim() || null,
        birthdate: birthdate || null,
        photoBase64: finalPhoto,
        updatedAt: serverTimestamp(),
        });         
      });

      await updateProfile(auth.currentUser, { displayName: name.trim() });

      // перезагрузим локально
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      setProfile(snap.data());
      setOk("Сохранено ✅");
    } catch (err) {
      setError(err.message || err.code || "Ошибка");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20, maxWidth: 520, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <Link to="/">← Чат</Link>
        <button onClick={() => signOut(auth)}>Выйти</button>
      </div>

      <h2 style={{ marginTop: 0 }}>Профиль</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {ok && <p style={{ color: "green" }}>{ok}</p>}

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        {profile?.photoBase64 ? (
          <img
            src={profile.photoBase64}
            alt="avatar"
            style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#ddd" }} />
        )}
        <div>
          <div><b>{profile?.name}</b></div>
          <div style={{ opacity: 0.7 }}>@{profile?.username}</div>
        </div>
      </div>

      <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Никнейм" value={usernameRaw} onChange={(e) => setUsernameRaw(e.target.value)} />
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Будет: <b>@{username || "..."}</b>
        </div>

        <label style={{ fontSize: 13 }}>
          Новое фото (необязательно):
          <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
        </label>

        <label style={{ fontSize: 13 }}>
          Дата рождения (необязательно):
          <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
        </label>

        <textarea placeholder="О себе" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />

        <button disabled={busy} type="submit">
          {busy ? "Сохраняю..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
}

export default Profile;