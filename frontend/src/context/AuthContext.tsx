import { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../api/axios';

interface UserProfile {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  profile_picture?: string | null;
  is_staff: boolean;
  module_health_enabled?: boolean;
  module_schedule_enabled?: boolean;
  module_settlement_enabled?: boolean;
  module_documents_enabled?: boolean;
  module_assistants_enabled?: boolean;
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

    void initAuth();
  }, []);

  const login = useCallback(async (access: string, refresh: string) => {
    // Avoid storing raw user input directly if possible, or validate/sanitize first.
    // However, JWTs from the API are inherently safe to store as strings.
    if (typeof access === 'string' && typeof refresh === 'string') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      try {
        const response = await api.get('/users/profile/');
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user profile after login", error);
      }
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  const updateUserProfile = useCallback((updatedUser: UserProfile) => {
    setUser(updatedUser);
  }, []);

  const contextValue = useMemo(
    () => ({ user, loading, login, logout, updateUserProfile }),
    [user, loading, login, logout, updateUserProfile]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
