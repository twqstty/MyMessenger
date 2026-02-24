import ChatWindow from "../components/ChatWindow";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

function Home({ user }) {
  return (
    <div className="app">
      <div className="top-actions">
        <Link to="/search" className="top-btn search">
          🔎 Поиск
        </Link>

        <Link to="/profile" className="top-btn profile">
          👤 Профиль
        </Link>

        <button
          onClick={() => signOut(auth)}
          className="top-btn logout"
        >
          🚪 Выйти
        </button>
      </div>

      <ChatWindow user={user} />
    </div>
  );
}

export default Home;