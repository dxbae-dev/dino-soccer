import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from './config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setLoading(false);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error(error);
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}