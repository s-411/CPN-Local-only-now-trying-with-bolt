import { getSupabaseClient } from '../supabase';
import { getSessionToken } from './session';

export interface DbOnboardingState {
  id: string;
  user_id: string;
  current_step: number;
  completed_steps: number[];
  onboarding_data: Record<string, any>;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const onboardingDatabase = {
  get: async (): Promise<DbOnboardingState | null> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) return null;

    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (!user) return null;

    const { data, error } = await supabase
      .from('onboarding_state')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle<DbOnboardingState>();

    if (error) {
      console.error('Error fetching onboarding state:', error);
      return null;
    }

    return data;
  },

  create: async (userId: string): Promise<DbOnboardingState | null> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('onboarding_state')
      .insert({
        user_id: userId,
        current_step: 1,
        completed_steps: [],
        onboarding_data: {},
      })
      .select()
      .maybeSingle<DbOnboardingState>();

    if (error) {
      console.error('Error creating onboarding state:', error);
      return null;
    }

    return data;
  },

  update: async (updates: {
    current_step?: number;
    completed_steps?: number[];
    onboarding_data?: Record<string, any>;
    is_completed?: boolean;
  }): Promise<DbOnboardingState | null> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) return null;

    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (!user) return null;

    const updateData: any = { ...updates };
    if (updates.is_completed && !updateData.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('onboarding_state')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .maybeSingle<DbOnboardingState>();

    if (error) {
      console.error('Error updating onboarding state:', error);
      return null;
    }

    return data;
  },

  getOrCreate: async (): Promise<DbOnboardingState | null> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) return null;

    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (!user) return null;

    let state = await onboardingDatabase.get();

    if (!state) {
      state = await onboardingDatabase.create(user.id);
    }

    return state;
  },

  complete: async (): Promise<DbOnboardingState | null> => {
    return onboardingDatabase.update({
      is_completed: true,
      current_step: 5,
    });
  },

  clear: async (): Promise<boolean> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) return false;

    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (!user) return false;

    const { error } = await supabase
      .from('onboarding_state')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing onboarding state:', error);
      return false;
    }

    return true;
  },
};
