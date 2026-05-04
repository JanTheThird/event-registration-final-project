import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useDB } from '../localdb/db';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types/Index';
import {
  readPersistedUserIdRaw,
  setCurrentUserId,
  clearPersistedAuth,
} from '../auth';

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
    const savedUserId = readPersistedUserIdRaw();
    if (savedUserId) {
      const parsedId = parseInt(savedUserId, 10);
      const user = db.findUser(parsedId);
      if (user && user.status === 'active') {
        setUserId(parsedId);
        setCurrentUserId(parsedId);
      } else {
        clearPersistedAuth();
      }
    }
    setIsLoading(false);
  }, [db]);

  const login = (id: number) => {
    const user = db.findUser(id);
    if (user) {
      setUserId(id);
      setCurrentUserId(id);
    }
  };

  const logout = () => {
    setUserId(null);
    clearPersistedAuth();
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
