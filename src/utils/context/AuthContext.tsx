// utils/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
  userId: string | null;
  login: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined); // ✅ Fixed!

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('current_user_id');
    if (savedUserId) {
      setUserId(savedUserId);
    }
  }, []);

  const login = (id: string) => {
    setUserId(id);
    localStorage.setItem('current_user_id', id);
  };

  const logout = () => {
    setUserId(null);
    localStorage.removeItem('current_user_id');
  };

  return (
    <AuthContext.Provider value={{ userId, login, logout }}>
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