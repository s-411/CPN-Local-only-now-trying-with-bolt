import { getSupabaseClient } from '../supabase';
import { DataEntry } from '../types';
import { DbDataEntry, dbDataEntryToDataEntry, dataEntryToDbDataEntry } from './types';
import { getSessionToken } from './session';

export const dataEntriesDatabase = {
  getAll: async (sessionToken?: string): Promise<DataEntry[]> => {
    const token = sessionToken || getSessionToken();
    if (!token) return [];

    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('session_token', token)
      .maybeSingle();

    if (!user) return [];

    const { data, error } = await supabase
      .from('data_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching data entries:', error);
      return [];
    }

    return (data as DbDataEntry[]).map(dbDataEntryToDataEntry);
  },

  getById: async (id: string): Promise<DataEntry | null> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('data_entries')
      .select('*')
      .eq('id', id)
      .maybeSingle<DbDataEntry>();

    if (error || !data) return null;
    return dbDataEntryToDataEntry(data);
  },

  getByGirlId: async (girlId: string): Promise<DataEntry[]> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('data_entries')
      .select('*')
      .eq('girl_id', girlId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching entries by girl ID:', error);
      return [];
    }

    return (data as DbDataEntry[]).map(dbDataEntryToDataEntry);
  },

  create: async (entryData: Omit<DataEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<DataEntry> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) throw new Error('No session token found');

    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (!user) throw new Error('User not found');

    const dbEntryData = dataEntryToDbDataEntry(entryData, user.id);

    const { data, error } = await supabase
      .from('data_entries')
      .insert(dbEntryData)
      .select()
      .maybeSingle<DbDataEntry>();

    if (error) {
      console.error('Error creating data entry:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Failed to create data entry');
    }

    return dbDataEntryToDataEntry(data);
  },

  update: async (id: string, updates: Partial<Omit<DataEntry, 'id' | 'createdAt'>>): Promise<DataEntry | null> => {
    const updateData: any = {};

    if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0];
    if (updates.amountSpent !== undefined) updateData.amount_spent = updates.amountSpent;
    if (updates.durationMinutes !== undefined) updateData.duration_minutes = updates.durationMinutes;
    if (updates.numberOfNuts !== undefined) updateData.number_of_nuts = updates.numberOfNuts;
    if (updates.girlId !== undefined) updateData.girl_id = updates.girlId;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('data_entries')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle<DbDataEntry>();

    if (error || !data) {
      console.error('Error updating data entry:', error);
      return null;
    }

    return dbDataEntryToDataEntry(data);
  },

  delete: async (id: string): Promise<boolean> => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('data_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting data entry:', error);
      return false;
    }

    return true;
  },

  deleteByGirlId: async (girlId: string): Promise<number> => {
    const supabase = getSupabaseClient();
    const { data: entries } = await supabase
      .from('data_entries')
      .select('id')
      .eq('girl_id', girlId);

    const count = entries?.length || 0;

    const { error } = await supabase
      .from('data_entries')
      .delete()
      .eq('girl_id', girlId);

    if (error) {
      console.error('Error deleting entries by girl ID:', error);
      return 0;
    }

    return count;
  },
};
