import { useEffect, useState } from "react";
import { auth } from "./firebase/firebase";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = null;

    (async () => {
      try {
        // Завершаем редирект-логин (если он был)
        await getRedirectResult(auth);
      } catch (e) {
        console.error("Redirect error:", e);
      }

      // После этого слушаем состояние авторизации
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  return user ? <Home user={user} /> : <Login />;
}

export default App;