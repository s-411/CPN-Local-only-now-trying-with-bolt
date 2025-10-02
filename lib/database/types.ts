import { Girl, DataEntry } from '../types';

export interface DbUser {
  id: string;
  session_token: string | null;
  auth_provider_id: string | null;
  email: string | null;
  subscription_tier: 'free' | 'premium' | 'lifetime';
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbGirl {
  id: string;
  user_id: string;
  name: string;
  age: number;
  nationality: string;
  ethnicity: string | null;
  hair_color: string | null;
  location_city: string | null;
  location_country: string | null;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbDataEntry {
  id: string;
  user_id: string;
  girl_id: string;
  date: string;
  amount_spent: number;
  duration_minutes: number;
  number_of_nuts: number;
  created_at: string;
  updated_at: string;
}

export function dbGirlToGirl(dbGirl: DbGirl): Girl {
  return {
    id: dbGirl.id,
    name: dbGirl.name,
    age: dbGirl.age,
    nationality: dbGirl.nationality,
    ethnicity: dbGirl.ethnicity as any,
    hairColor: dbGirl.hair_color as any,
    location: dbGirl.location_city || dbGirl.location_country
      ? {
          city: dbGirl.location_city || undefined,
          country: dbGirl.location_country || undefined,
        }
      : undefined,
    rating: dbGirl.rating,
    isActive: dbGirl.is_active,
    createdAt: new Date(dbGirl.created_at),
    updatedAt: new Date(dbGirl.updated_at),
  };
}

export function girlToDbGirl(girl: Omit<Girl, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Omit<DbGirl, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    name: girl.name,
    age: girl.age,
    nationality: girl.nationality,
    ethnicity: girl.ethnicity || null,
    hair_color: girl.hairColor || null,
    location_city: girl.location?.city || null,
    location_country: girl.location?.country || null,
    rating: girl.rating,
    is_active: girl.isActive ?? true,
  };
}

export function dbDataEntryToDataEntry(dbEntry: DbDataEntry): DataEntry {
  return {
    id: dbEntry.id,
    girlId: dbEntry.girl_id,
    date: new Date(dbEntry.date),
    amountSpent: dbEntry.amount_spent,
    durationMinutes: dbEntry.duration_minutes,
    numberOfNuts: dbEntry.number_of_nuts,
    createdAt: new Date(dbEntry.created_at),
    updatedAt: new Date(dbEntry.updated_at),
  };
}

export function dataEntryToDbDataEntry(
  entry: Omit<DataEntry, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Omit<DbDataEntry, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    girl_id: entry.girlId,
    date: entry.date.toISOString().split('T')[0],
    amount_spent: entry.amountSpent,
    duration_minutes: entry.durationMinutes,
    number_of_nuts: entry.numberOfNuts,
  };
}
