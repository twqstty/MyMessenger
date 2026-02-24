import { useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [photoFile, setPhotoFile] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      let photoBase64 = null;
      if (photoFile) {
        photoBase64 = await toBase64(photoFile);
      }

      await updateProfile(user, {
        displayName: name,
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        username,
        bio: bio || null,
        birthdate: birthdate || null,
        photoBase64,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{isLogin ? "Вход" : "Регистрация"}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={isLogin ? handleLogin : handleRegister}>
        {!isLogin && (
          <>
            <input
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <br />
            <input
              placeholder="Никнейм"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files[0])}
            />
            <br />
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
            <br />
            <textarea
              placeholder="О себе"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <br />
          </>
        )}

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit">
          {isLogin ? "Войти" : "Зарегистрироваться"}
        </button>
      </form>

      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Нет аккаунта? Регистрация" : "Уже есть аккаунт? Войти"}
      </button>
    </div>
  );
}

export default AuthPage;