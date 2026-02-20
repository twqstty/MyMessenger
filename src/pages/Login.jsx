import { auth } from "../firebase/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function Login() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
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