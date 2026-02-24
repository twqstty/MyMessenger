import { auth, authReady } from "../firebase/firebase";
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";

function Login() {
  const handleLogin = async () => {
    await authReady;

    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  return (
    <div className="center">
      <button onClick={handleLogin}>Войти через Google</button>
    </div>
  );
}

export default Login;