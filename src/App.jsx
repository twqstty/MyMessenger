import { useEffect, useState } from "react";
import { auth, authReady } from "./firebase/firebase";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    let unsubscribe;

    (async () => {
      await authReady;

      try {
        await getRedirectResult(auth);
      } catch (e) {
        console.error("getRedirectResult error:", e);
      }

      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser || null);
      });
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (user === undefined) return <div>Loading...</div>;
  return user ? <Home user={user} /> : <Login />;
}

export default App;