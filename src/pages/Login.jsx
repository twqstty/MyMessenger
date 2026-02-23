import { auth } from "../firebase/firebase";
import { GoogleAuthProvider } from "firebase/auth";
import { signInWithRedirect } from "firebase/auth";

function Login() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  return (
    <div className="center">
      <button onClick={handleLogin}>
        Войти через Google
      </button>
    </div>
  );
}

export default Login;