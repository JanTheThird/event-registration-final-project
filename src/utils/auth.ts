import { getCookie, setCookie, deleteCookie } from './cookies';

/** Same key for localStorage and session cookie */
export const AUTH_KEY = 'currentUserId';

export function readPersistedUserIdRaw(): string | null {
  return getCookie(AUTH_KEY) ?? localStorage.getItem(AUTH_KEY);
}

export const getCurrentUserId = (): number | null => {
  const raw = readPersistedUserIdRaw();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
};

export const setCurrentUserId = (id: number): void => {
  const s = String(id);
  localStorage.setItem(AUTH_KEY, s);
  setCookie(AUTH_KEY, s);
};

export const clearPersistedAuth = (): void => {
  localStorage.removeItem(AUTH_KEY);
  deleteCookie(AUTH_KEY);
};

/** @deprecated Use clearPersistedAuth — kept for any older imports */
export const logout = (): void => {
  clearPersistedAuth();
};
