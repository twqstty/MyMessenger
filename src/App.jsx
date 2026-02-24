import { useEffect, useState } from "react";
import { auth } from "./firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import SearchUsers from "./pages/SearchUsers";

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => unsub();
  }, []);

  if (user === undefined) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={user ? <Navigate to="/" /> : <AuthPage />}
        />
        <Route
          path="/"
          element={user ? <Home user={user} /> : <Navigate to="/auth" />}
        />
        <Route
          path="/profile"
          element={user ? <Profile user={user} /> : <Navigate to="/auth" />}
        />
        <Route
          path="/u/:username"
          element={user ? <UserProfile /> : <Navigate to="/auth" />}
        />
        <Route
          path="/search"
          element={user ? <SearchUsers /> : <Navigate to="/auth" />}
        />
        <Route path="*" element={<Navigate to={user ? "/" : "/auth"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;