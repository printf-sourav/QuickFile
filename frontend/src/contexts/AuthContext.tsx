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
          
          // Verify session is still valid by calling refresh endpoint
          try {
            await api.post('/users/refresh');
            setUser(parsedUser);
          } catch (error) {
            // Session expired, clear invalid data
            console.log('Session expired, clearing stored user');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to validate session:', error);
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
    } catch (error) {
      console.error('Logout request failed:', error);
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
