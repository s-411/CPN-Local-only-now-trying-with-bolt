import { getSupabaseClient } from '../supabase';
import { getSessionToken } from './session';

export interface DbUserSettings {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  theme: 'dark' | 'darker' | 'midnight';
  accent_color: 'yellow' | 'blue' | 'green' | 'red';
  compact_mode: boolean;
  animations_enabled: boolean;
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  time_format: '12h' | '24h';
  week_start: 'sunday' | 'monday';
  privacy_settings: {
    leaderboardVisibility: 'public' | 'friends' | 'private';
    showRealName: boolean;
    showProfileStats: boolean;
    allowInvitations: boolean;
    shareAchievements: boolean;
    shareSpendingData: boolean;
    shareEfficiencyMetrics: boolean;
    shareActivityFrequency: boolean;
    anonymousMode: boolean;
  };
  notification_settings: {
    leaderboardUpdates: boolean;
    achievementUnlocks: boolean;
    weeklySummaries: boolean;
    monthlySummaries: boolean;
    emailNotifications: boolean;
  };
  created_at: string;
  updated_at: string;
}

export const settingsDatabase = {
  get: async (): Promise<DbUserSettings | null> => {
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
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle<DbUserSettings>();

    if (error) {
      console.error('Error fetching settings:', error);
      return null;
    }

    return data;
  },

  create: async (userId: string): Promise<DbUserSettings | null> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('user_settings')
      .insert({ user_id: userId })
      .select()
      .maybeSingle<DbUserSettings>();

    if (error) {
      console.error('Error creating settings:', error);
      return null;
    }

    return data;
  },

  update: async (updates: Partial<Omit<DbUserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<DbUserSettings | null> => {
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
      .from('user_settings')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .maybeSingle<DbUserSettings>();

    if (error) {
      console.error('Error updating settings:', error);
      return null;
    }

    return data;
  },

  getOrCreate: async (): Promise<DbUserSettings | null> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) return null;

    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (!user) return null;

    let settings = await settingsDatabase.get();

    if (!settings) {
      settings = await settingsDatabase.create(user.id);
    }

    return settings;
  },
};
