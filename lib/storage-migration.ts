import { Girl, DataEntry } from './types';
import { getOrCreateSession } from './database/session';

const GIRLS_STORAGE_KEY = 'cpn_girls';
const DATA_ENTRIES_STORAGE_KEY = 'cpn_data_entries';
const MIGRATION_FLAG_KEY = 'cpn_migrated_to_db';

export interface MigrationStatus {
  hasLocalData: boolean;
  isMigrated: boolean;
  girlsCount: number;
  entriesCount: number;
}

function safeParseJSON<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      return parsed.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        ...(item.date && { date: new Date(item.date) })
      })) as T;
    }
    return parsed;
  } catch (error) {
    console.error('Error parsing JSON from localStorage:', error);
    return defaultValue;
  }
}

export function checkMigrationStatus(): MigrationStatus {
  if (typeof window === 'undefined') {
    return { hasLocalData: false, isMigrated: false, girlsCount: 0, entriesCount: 0 };
  }

  const isMigrated = localStorage.getItem(MIGRATION_FLAG_KEY) === 'true';
  const girlsData = localStorage.getItem(GIRLS_STORAGE_KEY);
  const entriesData = localStorage.getItem(DATA_ENTRIES_STORAGE_KEY);

  const girls = safeParseJSON<Girl[]>(girlsData, []);
  const entries = safeParseJSON<DataEntry[]>(entriesData, []);

  const hasLocalData = girls.length > 0 || entries.length > 0;

  return {
    hasLocalData,
    isMigrated,
    girlsCount: girls.length,
    entriesCount: entries.length
  };
}

export async function migrateLocalStorageToDatabase(): Promise<{
  success: boolean;
  girlsMigrated: number;
  entriesMigrated: number;
  error?: string;
}> {
  if (typeof window === 'undefined') {
    return { success: false, girlsMigrated: 0, entriesMigrated: 0, error: 'Not in browser environment' };
  }

  try {
    await getOrCreateSession();

    const girlsData = localStorage.getItem(GIRLS_STORAGE_KEY);
    const entriesData = localStorage.getItem(DATA_ENTRIES_STORAGE_KEY);

    const girls = safeParseJSON<Girl[]>(girlsData, []);
    const entries = safeParseJSON<DataEntry[]>(entriesData, []);

    if (girls.length === 0 && entries.length === 0) {
      return { success: true, girlsMigrated: 0, entriesMigrated: 0 };
    }

    const girlIdMapping = new Map<string, string>();

    for (const girl of girls) {
      const girlPayload = {
        name: girl.name,
        age: girl.age,
        nationality: girl.nationality,
        rating: girl.rating,
        isActive: girl.isActive ?? true,
        ethnicity: girl.ethnicity,
        hairColor: girl.hairColor,
        location: girl.location,
      };

      const response = await fetch('/api/girls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(girlPayload),
      });

      if (!response.ok) {
        throw new Error(`Failed to migrate girl: ${girl.name}`);
      }

      const newGirl = await response.json();
      girlIdMapping.set(girl.id, newGirl.id);
    }

    for (const entry of entries) {
      const newGirlId = girlIdMapping.get(entry.girlId);
      if (!newGirlId) {
        console.warn(`Skipping entry with unknown girlId: ${entry.girlId}`);
        continue;
      }

      const entryPayload = {
        girlId: newGirlId,
        date: entry.date,
        amountSpent: entry.amountSpent,
        durationMinutes: entry.durationMinutes,
        numberOfNuts: entry.numberOfNuts,
      };

      const response = await fetch('/api/data-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryPayload),
      });

      if (!response.ok) {
        console.error('Failed to migrate entry:', entry.id);
      }
    }

    localStorage.setItem(MIGRATION_FLAG_KEY, 'true');

    return {
      success: true,
      girlsMigrated: girls.length,
      entriesMigrated: entries.length,
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      girlsMigrated: 0,
      entriesMigrated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function clearLocalStorageData(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(GIRLS_STORAGE_KEY);
  localStorage.removeItem(DATA_ENTRIES_STORAGE_KEY);
  localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
}

export function resetMigrationFlag(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MIGRATION_FLAG_KEY);
}
