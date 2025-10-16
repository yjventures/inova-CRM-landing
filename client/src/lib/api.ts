import axios from 'axios';
import { getAccessToken } from './auth';

const baseURL = `${import.meta.env.VITE_API_URL}`;

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  try {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
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


