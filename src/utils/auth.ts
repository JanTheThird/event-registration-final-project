import { useDB } from './localdb/db';

export const AUTH_KEY = 'currentUserId';

export const setCurrentUserId = (id: number) => {
  localStorage.setItem(AUTH_KEY, String(id));
};

export const getCurrentUserId = () => {
  const id = localStorage.getItem(AUTH_KEY);
  return id ? Number(id) : null;
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};