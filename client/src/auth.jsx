import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'tt_token';
const USER_KEY = 'tt_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch {
      return null;
    }
  });

  // Revalidate the stored session against the server on load.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    api
      .me()
      .then(({ user }) => saveUser(user))
      .catch(() => signOut());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveUser(u) {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  }

  function signIn(token, u) {
    localStorage.setItem(TOKEN_KEY, token);
    saveUser(u);
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isCurator: user?.role === 'curator' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
