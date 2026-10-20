import React, { createContext, useContext, useState, useEffect } from 'react';
import { MatchmakerUser } from '../types';
import { api, clearToken } from '../services/api';

interface AuthContextType {
  user: MatchmakerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: MatchmakerUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MatchmakerUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('tdc_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    api.auth
      .getMe()
      .then((res) => {
        setUser(res.user);
      })
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = (_token: string, user: MatchmakerUser) => {
    setUser(user);
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
