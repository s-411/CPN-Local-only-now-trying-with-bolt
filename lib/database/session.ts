import { getSupabaseClient } from '../supabase';
import { DbUser } from './types';

const SESSION_STORAGE_KEY = 'cpn_session_token';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export async function getOrCreateSession(): Promise<{ userId: string; sessionToken: string }> {
  if (typeof window === 'undefined') {
    throw new Error('Session management only available on client side');
  }

  let sessionToken = getCookie(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);

  if (!sessionToken) {
    sessionToken = crypto.randomUUID();
    const supabase = getSupabaseClient();
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        session_token: sessionToken,
        is_anonymous: true,
        subscription_tier: 'free',
      })
      .select()
      .maybeSingle<DbUser>();

    if (error) {
      console.error('Error creating session:', error);
      throw error;
    }

    if (!newUser) {
      throw new Error('Failed to create user session');
    }

    setCookie(SESSION_STORAGE_KEY, sessionToken);
    localStorage.setItem(SESSION_STORAGE_KEY, sessionToken);
    return { userId: newUser.id, sessionToken };
  }

  const supabase = getSupabaseClient();
  const { data: existingUser, error } = await supabase
    .from('users')
    .select()
    .eq('session_token', sessionToken)
    .maybeSingle<DbUser>();

  if (error || !existingUser) {
    removeCookie(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return getOrCreateSession();
  }

  // Ensure cookie is set even for existing sessions
  setCookie(SESSION_STORAGE_KEY, sessionToken);
  return { userId: existingUser.id, sessionToken };
}

export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return getCookie(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  removeCookie(SESSION_STORAGE_KEY);
  localStorage.removeItem(SESSION_STORAGE_KEY);
}
