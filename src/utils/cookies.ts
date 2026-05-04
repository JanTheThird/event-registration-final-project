/**
 * Small first-party cookie helpers for client-side session data.
 * (Not HttpOnly — those require a server Set-Cookie header.)
 */

const DEFAULT_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:';
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(
  name: string,
  value: string,
  maxAgeSec: number = DEFAULT_MAX_AGE_SEC
): void {
  if (typeof document === 'undefined') return;
  const secure = isSecureContext() ? ';Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAgeSec};SameSite=Lax${secure}`;
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  const secure = isSecureContext() ? ';Secure' : '';
  document.cookie = `${name}=;path=/;max-age=0;SameSite=Lax${secure}`;
}
