import { supabase } from '../supabase';
import { Girl } from '../types';
import { DbGirl, dbGirlToGirl, girlToDbGirl } from './types';
import { getSessionToken } from './session';

export const girlsDatabase = {
  getAll: async (): Promise<Girl[]> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) return [];

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('session_token', sessionToken)
      .single();

    if (!user) return [];

    const { data, error } = await supabase
      .from('girls')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching girls:', error);
      return [];
    }

    return (data as DbGirl[]).map(dbGirlToGirl);
  },

  getById: async (id: string): Promise<Girl | null> => {
    const { data, error } = await supabase
      .from('girls')
      .select('*')
      .eq('id', id)
      .single<DbGirl>();

    if (error || !data) return null;
    return dbGirlToGirl(data);
  },

  create: async (girlData: Omit<Girl, 'id' | 'createdAt' | 'updatedAt'>): Promise<Girl> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) throw new Error('No session token found');

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('session_token', sessionToken)
      .single();

    if (!user) throw new Error('User not found');

    const dbGirlData = girlToDbGirl(girlData, user.id);

    const { data, error } = await supabase
      .from('girls')
      .insert(dbGirlData)
      .select()
      .single<DbGirl>();

    if (error) {
      console.error('Error creating girl:', error);
      throw error;
    }

    return dbGirlToGirl(data);
  },

  update: async (id: string, updates: Partial<Omit<Girl, 'id' | 'createdAt'>>): Promise<Girl | null> => {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.age !== undefined) updateData.age = updates.age;
    if (updates.nationality !== undefined) updateData.nationality = updates.nationality;
    if (updates.ethnicity !== undefined) updateData.ethnicity = updates.ethnicity;
    if (updates.hairColor !== undefined) updateData.hair_color = updates.hairColor;
    if (updates.rating !== undefined) updateData.rating = updates.rating;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.location !== undefined) {
      updateData.location_city = updates.location?.city || null;
      updateData.location_country = updates.location?.country || null;
    }

    const { data, error } = await supabase
      .from('girls')
      .update(updateData)
      .eq('id', id)
      .select()
      .single<DbGirl>();

    if (error || !data) {
      console.error('Error updating girl:', error);
      return null;
    }

    return dbGirlToGirl(data);
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('girls')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting girl:', error);
      return false;
    }

    return true;
  },
};
