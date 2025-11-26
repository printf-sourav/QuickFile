import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface User { _id: string; email: string; username?: string; }
interface AuthContextType { user: User | null; token: string | null; login: (email: string, password: string) => Promise<void>; register: (name: string, email: string, password: string) => Promise<void>; logout: () => Promise<void>; isLoading: boolean; }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsedUser = JSON.parse(stored);
          
          // TODO: Re-enable after backend refresh route is fixed (remove verifyJWT middleware)
          // For now, just restore from localStorage without validation
          setUser(parsedUser);
          
          /* Temporarily disabled - causes 401 error on backend
          try {
            const response = await api.post('/users/refresh');
            if (response.data?.data) {
              setUser(parsedUser);
            } else {
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              setUser(null);
            }
          } catch (error: any) {
            const status = error.response?.status;
            if (status === 401 || status === 403) {
              console.log('Session expired, clearing stored user');
            } else {
              console.log('Failed to validate session:', error.message);
            }
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
          }
          */
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      setIsLoading(false);
    };

    validateSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/users/login', { email, password });
      const userFromServer = res.data?.data;
      if (!userFromServer) throw new Error('Invalid server response');
      localStorage.setItem('user', JSON.stringify(userFromServer));
      setUser(userFromServer);
      setToken(null);
      toast.success('Login successful!');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await api.post('/users/register', { username: name, email, password });
      const userFromServer = res.data?.data;
      if (!userFromServer) throw new Error('Invalid server response');
      localStorage.setItem('user', JSON.stringify(userFromServer));
      setUser(userFromServer);
      setToken(null);
      toast.success('Registration successful!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (error: any) {
      // Ignore 401 errors - token already expired, which is fine for logout
      if (error.response?.status !== 401) {
        console.error('Logout request failed:', error);
      }
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  return <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
