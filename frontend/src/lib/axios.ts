import axios from 'axios';



const rawBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const baseURL = rawBase.replace(/\/+$/, '');

const api = axios.create({
  baseURL,
  timeout: 120_000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use(cfg => {
  
  const tokenFromKey = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = tokenFromKey || user?.token;
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    
    return Promise.reject(err);
  }
);

export default api;