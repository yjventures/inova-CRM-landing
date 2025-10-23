import axios from 'axios';
import { getAccessToken } from './auth';

function normalizeBaseURL(raw?: string) {
  let s = (raw || '').trim();
  if (!s) {
    // Default to same-origin /api during local dev if not provided
    s = `${window.location.origin}/api`;
  }
  // remove trailing slash
  if (s.endsWith('/')) s = s.slice(0, -1);
  // ensure /api suffix
  if (!/\/api$/i.test(s)) s = `${s}/api`;
  return s;
}

const baseURL = normalizeBaseURL(import.meta.env.VITE_API_URL as any);

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  try {
    const token = getAccessToken();
    if (token) {
      // Ensure headers object is present and typed correctly
      config.headers = config.headers || {} as any;
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

export const get = <T = any>(url: string, params?: any) => api.get<T>(url, { params }).then(r => r.data);
export const post = <T = any>(url: string, data?: any) => api.post<T>(url, data).then(r => r.data);
export const patch = <T = any>(url: string, data?: any) => api.patch<T>(url, data).then(r => r.data);
export const del = <T = any>(url: string) => api.delete<T>(url).then(r => r.data);
export const put =  <T = any>(url: string, data?: any) => api.put<T>(url, data).then(r => r.data);

export const health = <T = any>() => api.get<T>('/health').then(r => r.data);


