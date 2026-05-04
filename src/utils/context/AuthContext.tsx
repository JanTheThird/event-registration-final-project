import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useDB } from '../localdb/db';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types/Index';

interface AuthContextType {
  userId: number | null;
  user: User | null;
  login: (userId: number) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const db = useDB();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
      const parsedId = parseInt(savedUserId);
      const user = db.findUser(parsedId);
      if (user && user.status === 'active') {
        setUserId(parsedId);
        // Do not redirect here — user should see the landing page first at "/".
        // They can log in again or use "Continue" on the landing page if a session exists.
      } else {
        localStorage.removeItem('currentUserId');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (id: number) => {
    const user = db.findUser(id);
    if (user) {
      setUserId(id);
      localStorage.setItem('currentUserId', id.toString());
    }
  };

  const logout = () => {
    setUserId(null);
    localStorage.removeItem('currentUserId');
    navigate('/', { replace: true });
  };

  const user = userId ? db.findUser(userId) ?? null : null;

  const value: AuthContextType = {
    userId,
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}