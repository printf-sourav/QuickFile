import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      
      console.debug('[Auth] login start', { email });

      
      
      
      
  
  const reqPromise = api.post('/users/login', { email, password });
  console.debug('[Auth] request promise', reqPromise);

  const response = await reqPromise;

  console.debug('[Auth] login response raw', response);

      const userFromServer = response.data?.data;

      if (!userFromServer) {
        console.debug('[Auth] login invalid server response', response.data);
        throw new Error('Invalid server response');
      }

  localStorage.setItem('user', JSON.stringify(userFromServer));
      setUser(userFromServer);
      
      setToken(null);

      toast.success('Login successful!');
    } catch (error: any) {
      console.debug('[Auth] login error', error?.response || error);
      let message = error.response?.data?.message || error.message || 'Login failed';
      if (error?.code === 'ECONNABORTED') {
        message = 'Backend not reachable. Make sure the server is running on http://localhost:8000';
      }
      toast.error(message);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      
      const response = await api.post('/users/register', { username: name, email, password });
      const userFromServer = response.data?.data;

      if (!userFromServer) {
        throw new Error('Invalid server response');
      }

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

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
