import ChatWindow from "../components/ChatWindow";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

function Home({ user }) {
  return (
    <div className="app">
      <div style={{ position: "fixed", top: 10, right: 10, display: "flex", gap: 8 }}>
        <Link to="/profile">Профиль</Link>
        <button onClick={() => signOut(auth)}>Выйти</button>
      </div>

      <ChatWindow user={user} />
    </div>
  );
}

export default Home;