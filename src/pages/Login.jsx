import { auth, authReady } from "../firebase/firebase";
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";

function Login() {
  const handleLogin = async () => {
    try {
      await authReady;
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (e) {
      console.error("Login error:", e);
      alert(`Login error: ${e?.code || e}`);
    }
  };

  return (
    <div className="center">
      <button onClick={handleLogin}>Войти через Google</button>
    </div>
  );
}

export default Login;