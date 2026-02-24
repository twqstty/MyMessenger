import { useEffect, useState } from "react";
import { auth } from "./firebase/firebase";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await getRedirectResult(auth);
      } catch (e) {
        console.error(e);
      }

      onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser || null);
      });
    };

    initAuth();
  }, []);

  if (user === undefined) return <div>Loading...</div>;

  return user ? <Home user={user} /> : <Login />;
}

export default App;