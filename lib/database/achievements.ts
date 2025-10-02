import { getSupabaseClient } from '../supabase';
import { getSessionToken } from './session';
import { AchievementTier } from '../achievements/types';

export interface DbAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_id: string;
  tier: AchievementTier;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked_at: string;
  created_at: string;
}

export interface DbAchievementProgress {
  id: string;
  user_id: string;
  achievement_type: string;
  current_value: number;
  target_value: number;
  last_checked: string;
  created_at: string;
  updated_at: string;
}

export const achievementsDatabase = {
  getAll: async (): Promise<DbAchievement[]> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) return [];

    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (!user) return [];

    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }

    return data as DbAchievement[];
  },

  unlock: async (achievement: Omit<DbAchievement, 'id' | 'user_id' | 'unlocked_at' | 'created_at'>): Promise<DbAchievement | null> => {
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
      .from('achievements')
      .insert({
        ...achievement,
        user_id: user.id,
      })
      .select()
      .maybeSingle<DbAchievement>();

    if (error) {
      console.error('Error unlocking achievement:', error);
      return null;
    }

    return data;
  },

  getProgress: async (): Promise<DbAchievementProgress[]> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) return [];

    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (!user) return [];

    const { data, error } = await supabase
      .from('achievement_progress')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching achievement progress:', error);
      return [];
    }

    return data as DbAchievementProgress[];
  },

  updateProgress: async (achievementType: string, currentValue: number, targetValue: number): Promise<DbAchievementProgress | null> => {
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
      .from('achievement_progress')
      .upsert({
        user_id: user.id,
        achievement_type: achievementType,
        current_value: currentValue,
        target_value: targetValue,
        last_checked: new Date().toISOString(),
      }, {
        onConflict: 'user_id,achievement_type'
      })
      .select()
      .maybeSingle<DbAchievementProgress>();

    if (error) {
      console.error('Error updating achievement progress:', error);
      return null;
    }

    return data;
  },

  getTotalPoints: async (): Promise<number> => {
    const achievements = await achievementsDatabase.getAll();
    return achievements.reduce((sum, achievement) => sum + achievement.points, 0);
  },
};
