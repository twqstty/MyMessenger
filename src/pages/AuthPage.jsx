import { useMemo, useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";

function normalizeUsername(s) {
  return s.trim().toLowerCase().replace(/\s+/g, "_");
}

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [usernameRaw, setUsernameRaw] = useState("");
  const [bio, setBio] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const username = useMemo(() => normalizeUsername(usernameRaw), [usernameRaw]);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(err.code || err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (!name.trim()) throw new Error("Введите имя");
      if (!username) throw new Error("Введите никнейм");
      if (username.length < 3) throw new Error("Никнейм минимум 3 символа");
      if (!email.trim()) throw new Error("Введите email");
      if (password.length < 6) throw new Error("Пароль минимум 6 символов");
      if (!photoFile) throw new Error("Добавь фотографию профиля");

      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;

      const photoBase64 = await toBase64(photoFile);

      // резервируем никнейм атомарно
      await runTransaction(db, async (tx) => {
        const usernameRef = doc(db, "usernames", username);
        const userRef = doc(db, "users", user.uid);

        const usernameSnap = await tx.get(usernameRef);
        if (usernameSnap.exists()) {
          throw new Error("Этот никнейм уже занят");
        }

        tx.set(usernameRef, { uid: user.uid, createdAt: serverTimestamp() });

        tx.set(userRef, {
          uid: user.uid,
          name: name.trim(),
          username,
          bio: bio.trim() || null,
          birthdate: birthdate || null,
          photoBase64,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await updateProfile(user, { displayName: name.trim() });
    } catch (err) {
      // если регистрация юзера в auth прошла, но никнейм занят — лучше показать человеку, что делать
      setError(err.message || err.code || "Ошибка регистрации");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="center" style={{ padding: 20 }}>
      <div style={{ width: 360, maxWidth: "95vw" }}>
        <h2 style={{ marginTop: 0 }}>{isLogin ? "Вход" : "Регистрация"}</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={isLogin ? handleLogin : handleRegister} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!isLogin && (
            <>
              <input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />

              <input
                placeholder="Никнейм (например: sigma_boy)"
                value={usernameRaw}
                onChange={(e) => setUsernameRaw(e.target.value)}
              />
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Будет: <b>@{username || "..."}</b>
              </div>

              <label style={{ fontSize: 13 }}>
                Фото профиля:
                <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
              </label>

              <label style={{ fontSize: 13 }}>
                Дата рождения (необязательно):
                <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
              </label>

              <textarea placeholder="О себе (необязательно)" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
            </>
          )}

          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />

          <button disabled={busy} type="submit">
            {busy ? "Подождите..." : isLogin ? "Войти" : "Создать аккаунт"}
          </button>
        </form>

        <button disabled={busy} onClick={() => setIsLogin((v) => !v)} style={{ marginTop: 10 }}>
          {isLogin ? "Нет аккаунта? Регистрация" : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </div>
  );
}

export default AuthPage;