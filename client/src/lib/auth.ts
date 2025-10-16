const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export function getAccessToken(): string | null {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(ACCESS_KEY) : null;
  } catch {
    return null;
  }
}

export function setAccessToken(token: string, refreshToken?: string) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_KEY, token);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  } catch {}
}

export function clearTokens() {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {}
}


