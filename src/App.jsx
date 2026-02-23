import { useEffect, useState } from "react";
import { auth } from "./firebase/firebase";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      console.error(error);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return user ? <Home user={user} /> : <Login />;
}

export default App;