import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../api/axios';

interface UserProfile {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  profile_picture?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (access: string, refresh: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (user: UserProfile) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await api.get('/users/profile/');
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    try {
      const response = await api.get('/users/profile/');
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile after login", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const updateUserProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
