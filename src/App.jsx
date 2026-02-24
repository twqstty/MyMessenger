import { useEffect, useState } from "react";
import { auth, authReady } from "./firebase/firebase";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";

function App() {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    let unsubscribe;

    (async () => {
      await authReady;

      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // ВАЖНО: если redirect вернул user — сразу сохраняем
          setUser(result.user);
        }
      } catch (e) {
        console.error("getRedirectResult error:", e);
      }

      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        // Если уже есть user из redirectResult — не перетираем его null-ом
        setUser((prev) => (prev ? prev : (currentUser || null)));
      });
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (user === undefined) return <div>Loading...</div>;
  return user ? <Home user={user} /> : <AuthPage />;
}

export default App;