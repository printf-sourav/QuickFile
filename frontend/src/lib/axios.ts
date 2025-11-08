import axios from 'axios';



function resolveBaseURL(): string {
  // Prefer explicit env var
  let base = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';

  // If not provided, use same-origin '/api' when running in a browser
  if (!base && typeof window !== 'undefined') {
    base = `${window.location.origin}/api`;
  }

  // Development fallback (node/test contexts)
  if (!base) base = 'http://127.0.0.1:8000/api';

  // Avoid mixed-content in production: if site is HTTPS and base is HTTP, fall back to same-origin /api
  try {
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      /^http:\/\//i.test(base)
    ) {
      console.warn('[axios] Insecure VITE_API_URL under HTTPS – falling back to same-origin /api');
      base = `${window.location.origin}/api`;
    }
  } catch {}

  return base.replace(/\/+$/, '');
}

const baseURL = resolveBaseURL();

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