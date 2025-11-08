import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface User { _id: string; email: string; username?: string; }
interface AuthContextType { user: User | null; token: string | null; login: (email: string, password: string) => Promise<void>; register: (name: string, email: string, password: string) => Promise<void>; logout: () => void; isLoading: boolean; }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try { const stored = localStorage.getItem('user'); if (stored) setUser(JSON.parse(stored)); } catch {};
    setIsLoading(false);
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  return <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
