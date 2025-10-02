import { getSupabaseClient } from '../supabase';
import { DbUser } from './types';

const SESSION_STORAGE_KEY = 'cpn_session_token';

export async function getOrCreateSession(): Promise<{ userId: string; sessionToken: string }> {
  if (typeof window === 'undefined') {
    throw new Error('Session management only available on client side');
  }

  let sessionToken = localStorage.getItem(SESSION_STORAGE_KEY);

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
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return getOrCreateSession();
  }

  return { userId: existingUser.id, sessionToken };
}

export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
}
