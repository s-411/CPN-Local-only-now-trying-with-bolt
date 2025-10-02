import { Girl, DataEntry } from './types';
import { TEMPLATE_GIRLS, TEMPLATE_DATA_ENTRIES } from './templateData';

const GIRLS_STORAGE_KEY = 'cpn_girls';
const DATA_ENTRIES_STORAGE_KEY = 'cpn_data_entries';

// Utility function to safely parse JSON
function safeParseJSON<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;
  try {
    const parsed = JSON.parse(json);
    // Convert date strings back to Date objects
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

// Girls CRUD operations
export const girlsStorage = {
  getAll: (): Girl[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(GIRLS_STORAGE_KEY);
    const girls = safeParseJSON(stored, []);

    // Load template data if no user data exists (for live deployment)
    if (girls.length === 0) {
      return TEMPLATE_GIRLS;
    }

    return girls;
  },

  getById: (id: string): Girl | null => {
    const girls = girlsStorage.getAll();
    return girls.find(girl => girl.id === id) || null;
  },

  create: (girlData: Omit<Girl, 'id' | 'createdAt' | 'updatedAt'>): Girl => {
    const newGirl: Girl = {
      ...girlData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const girls = girlsStorage.getAll();
    girls.push(newGirl);
    localStorage.setItem(GIRLS_STORAGE_KEY, JSON.stringify(girls));
    return newGirl;
  },

  update: (id: string, updates: Partial<Omit<Girl, 'id' | 'createdAt'>>): Girl | null => {
    const girls = girlsStorage.getAll();
    const index = girls.findIndex(girl => girl.id === id);
    
    if (index === -1) return null;
    
    girls[index] = {
      ...girls[index],
      ...updates,
      updatedAt: new Date()
    };
    
    localStorage.setItem(GIRLS_STORAGE_KEY, JSON.stringify(girls));
    return girls[index];
  },

  delete: (id: string): boolean => {
    const girls = girlsStorage.getAll();
    const filteredGirls = girls.filter(girl => girl.id !== id);
    
    if (filteredGirls.length === girls.length) return false;
    
    localStorage.setItem(GIRLS_STORAGE_KEY, JSON.stringify(filteredGirls));
    
    // Also delete associated data entries
    dataEntriesStorage.deleteByGirlId(id);
    return true;
  }
};

// Data Entries CRUD operations
export const dataEntriesStorage = {
  getAll: (): DataEntry[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(DATA_ENTRIES_STORAGE_KEY);
    const entries = safeParseJSON(stored, []);

    // Load template data if no user data exists (for live deployment)
    if (entries.length === 0) {
      return TEMPLATE_DATA_ENTRIES;
    }

    return entries;
  },

  getById: (id: string): DataEntry | null => {
    const entries = dataEntriesStorage.getAll();
    return entries.find(entry => entry.id === id) || null;
  },

  getByGirlId: (girlId: string): DataEntry[] => {
    const entries = dataEntriesStorage.getAll();
    return entries
      .filter(entry => entry.girlId === girlId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  create: (entryData: Omit<DataEntry, 'id' | 'createdAt' | 'updatedAt'>): DataEntry => {
    const newEntry: DataEntry = {
      ...entryData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const entries = dataEntriesStorage.getAll();
    entries.push(newEntry);
    localStorage.setItem(DATA_ENTRIES_STORAGE_KEY, JSON.stringify(entries));
    return newEntry;
  },

  update: (id: string, updates: Partial<Omit<DataEntry, 'id' | 'createdAt'>>): DataEntry | null => {
    const entries = dataEntriesStorage.getAll();
    const index = entries.findIndex(entry => entry.id === id);
    
    if (index === -1) return null;
    
    entries[index] = {
      ...entries[index],
      ...updates,
      updatedAt: new Date()
    };
    
    localStorage.setItem(DATA_ENTRIES_STORAGE_KEY, JSON.stringify(entries));
    return entries[index];
  },

  delete: (id: string): boolean => {
    const entries = dataEntriesStorage.getAll();
    const filteredEntries = entries.filter(entry => entry.id !== id);
    
    if (filteredEntries.length === entries.length) return false;
    
    localStorage.setItem(DATA_ENTRIES_STORAGE_KEY, JSON.stringify(filteredEntries));
    return true;
  },

  deleteByGirlId: (girlId: string): number => {
    const entries = dataEntriesStorage.getAll();
    const filteredEntries = entries.filter(entry => entry.girlId !== girlId);
    const deletedCount = entries.length - filteredEntries.length;
    
    localStorage.setItem(DATA_ENTRIES_STORAGE_KEY, JSON.stringify(filteredEntries));
    return deletedCount;
  }
};

// Utility functions for data management
export const storageUtils = {
  clearAll: (): void => {
    localStorage.removeItem(GIRLS_STORAGE_KEY);
    localStorage.removeItem(DATA_ENTRIES_STORAGE_KEY);
  },

  isUsingTemplateData: (): boolean => {
    if (typeof window === 'undefined') return false;
    const storedGirls = localStorage.getItem(GIRLS_STORAGE_KEY);
    const storedEntries = localStorage.getItem(DATA_ENTRIES_STORAGE_KEY);
    return !storedGirls && !storedEntries;
  },

  clearTemplateData: (): void => {
    // This forces the system to stop returning template data
    // by setting empty arrays in localStorage
    if (storageUtils.isUsingTemplateData()) {
      localStorage.setItem(GIRLS_STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem(DATA_ENTRIES_STORAGE_KEY, JSON.stringify([]));
    }
  },

  exportData: () => {
    const girls = girlsStorage.getAll();
    const dataEntries = dataEntriesStorage.getAll();
    return {
      girls,
      dataEntries,
      exportedAt: new Date().toISOString()
    };
  },

  importData: (data: { girls: Girl[], dataEntries: DataEntry[] }): void => {
    localStorage.setItem(GIRLS_STORAGE_KEY, JSON.stringify(data.girls));
    localStorage.setItem(DATA_ENTRIES_STORAGE_KEY, JSON.stringify(data.dataEntries));
  },

  getStorageSize: (): string => {
    const girlsSize = localStorage.getItem(GIRLS_STORAGE_KEY)?.length || 0;
    const entriesSize = localStorage.getItem(DATA_ENTRIES_STORAGE_KEY)?.length || 0;
    const totalBytes = girlsSize + entriesSize;
    
    if (totalBytes < 1024) return `${totalBytes} B`;
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};