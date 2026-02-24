import { auth, authReady } from "../firebase/firebase";
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";

function Login() {
  const handleLogin = async () => {
    alert("Нажали кнопку — обработчик работает ✅");
    console.log("login clicked");

    try {
      await authReady;
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);

      alert("signInWithRedirect НЕ ушёл в редирект (значит была ошибка/блок) ❌");
    } catch (e) {
      console.error("Login error:", e);
      alert(`Login error: ${e?.code || e?.message || e}`);
    }
  };

  return (
    <div className="center">
      <button type="button" onClick={handleLogin}>
        Войти через Google
      </button>
    </div>
  );
}

export default Login;