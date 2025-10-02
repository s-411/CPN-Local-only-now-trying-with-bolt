'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Girl, DataEntry, GirlWithMetrics, GlobalStats } from './types';
import { girlsStorage, dataEntriesStorage } from './storage';
import { createGirlWithMetrics, calculateGlobalStats } from './calculations';
import { autoMigrateIfNeeded } from './migrations';

interface AppState {
  girls: Girl[];
  dataEntries: DataEntry[];
  girlsWithMetrics: GirlWithMetrics[];
  globalStats: GlobalStats;
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: { girls: Girl[]; dataEntries: DataEntry[] } }
  | { type: 'ADD_GIRL'; payload: Girl }
  | { type: 'UPDATE_GIRL'; payload: Girl }
  | { type: 'DELETE_GIRL'; payload: string }
  | { type: 'ADD_DATA_ENTRY'; payload: DataEntry }
  | { type: 'UPDATE_DATA_ENTRY'; payload: DataEntry }
  | { type: 'DELETE_DATA_ENTRY'; payload: string };

const initialState: AppState = {
  girls: [],
  dataEntries: [],
  girlsWithMetrics: [],
  globalStats: {
    totalGirls: 0,
    activeGirls: 0,
    totalSpent: 0,
    totalNuts: 0,
    totalTime: 0,
    averageRating: 0
  },
  isLoading: true
};

function calculateDerivedData(girls: Girl[], dataEntries: DataEntry[]) {
  const girlsWithMetrics = girls.map(girl => {
    const girlEntries = dataEntries.filter(entry => entry.girlId === girl.id);
    return createGirlWithMetrics(girl, girlEntries);
  });

  const globalStats = calculateGlobalStats(girls, dataEntries);

  return { girlsWithMetrics, globalStats };
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOAD_DATA': {
      const { girls, dataEntries } = action.payload;
      const { girlsWithMetrics, globalStats } = calculateDerivedData(girls, dataEntries);
      return {
        ...state,
        girls,
        dataEntries,
        girlsWithMetrics,
        globalStats,
        isLoading: false
      };
    }

    case 'ADD_GIRL': {
      const newGirls = [...state.girls, action.payload];
      const { girlsWithMetrics, globalStats } = calculateDerivedData(newGirls, state.dataEntries);
      return {
        ...state,
        girls: newGirls,
        girlsWithMetrics,
        globalStats
      };
    }

    case 'UPDATE_GIRL': {
      const updatedGirls = state.girls.map(girl =>
        girl.id === action.payload.id ? action.payload : girl
      );
      const { girlsWithMetrics, globalStats } = calculateDerivedData(updatedGirls, state.dataEntries);
      return {
        ...state,
        girls: updatedGirls,
        girlsWithMetrics,
        globalStats
      };
    }

    case 'DELETE_GIRL': {
      const filteredGirls = state.girls.filter(girl => girl.id !== action.payload);
      const filteredEntries = state.dataEntries.filter(entry => entry.girlId !== action.payload);
      const { girlsWithMetrics, globalStats } = calculateDerivedData(filteredGirls, filteredEntries);
      return {
        ...state,
        girls: filteredGirls,
        dataEntries: filteredEntries,
        girlsWithMetrics,
        globalStats
      };
    }

    case 'ADD_DATA_ENTRY': {
      const newEntries = [...state.dataEntries, action.payload];
      const { girlsWithMetrics, globalStats } = calculateDerivedData(state.girls, newEntries);
      return {
        ...state,
        dataEntries: newEntries,
        girlsWithMetrics,
        globalStats
      };
    }

    case 'UPDATE_DATA_ENTRY': {
      const updatedEntries = state.dataEntries.map(entry =>
        entry.id === action.payload.id ? action.payload : entry
      );
      const { girlsWithMetrics, globalStats } = calculateDerivedData(state.girls, updatedEntries);
      return {
        ...state,
        dataEntries: updatedEntries,
        girlsWithMetrics,
        globalStats
      };
    }

    case 'DELETE_DATA_ENTRY': {
      const filteredEntries = state.dataEntries.filter(entry => entry.id !== action.payload);
      const { girlsWithMetrics, globalStats } = calculateDerivedData(state.girls, filteredEntries);
      return {
        ...state,
        dataEntries: filteredEntries,
        girlsWithMetrics,
        globalStats
      };
    }

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data on mount
  useEffect(() => {
    const loadData = () => {
      try {
        // Run auto-migration for demographic fields before loading data
        autoMigrateIfNeeded();
        
        const girls = girlsStorage.getAll();
        const dataEntries = dataEntriesStorage.getAll();
        dispatch({ type: 'LOAD_DATA', payload: { girls, dataEntries } });
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Custom hooks for specific operations
export function useGirls() {
  const { state, dispatch } = useAppContext();

  const addGirl = (girlData: Omit<Girl, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGirl = girlsStorage.create(girlData);
    dispatch({ type: 'ADD_GIRL', payload: newGirl });
    return newGirl;
  };

  const updateGirl = (id: string, updates: Partial<Omit<Girl, 'id' | 'createdAt'>>) => {
    const updatedGirl = girlsStorage.update(id, updates);
    if (updatedGirl) {
      dispatch({ type: 'UPDATE_GIRL', payload: updatedGirl });
    }
    return updatedGirl;
  };

  const deleteGirl = (id: string) => {
    const success = girlsStorage.delete(id);
    if (success) {
      dispatch({ type: 'DELETE_GIRL', payload: id });
    }
    return success;
  };

  const getGirlById = (id: string) => {
    return state.girls.find(girl => girl.id === id) || null;
  };

  const getGirlWithMetrics = (id: string) => {
    return state.girlsWithMetrics.find(girl => girl.id === id) || null;
  };

  return {
    girls: state.girls,
    girlsWithMetrics: state.girlsWithMetrics,
    addGirl,
    updateGirl,
    deleteGirl,
    getGirlById,
    getGirlWithMetrics
  };
}

export function useDataEntries() {
  const { state, dispatch } = useAppContext();

  const addDataEntry = (entryData: Omit<DataEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry = dataEntriesStorage.create(entryData);
    dispatch({ type: 'ADD_DATA_ENTRY', payload: newEntry });
    return newEntry;
  };

  const updateDataEntry = (id: string, updates: Partial<Omit<DataEntry, 'id' | 'createdAt'>>) => {
    const updatedEntry = dataEntriesStorage.update(id, updates);
    if (updatedEntry) {
      dispatch({ type: 'UPDATE_DATA_ENTRY', payload: updatedEntry });
    }
    return updatedEntry;
  };

  const deleteDataEntry = (id: string) => {
    const success = dataEntriesStorage.delete(id);
    if (success) {
      dispatch({ type: 'DELETE_DATA_ENTRY', payload: id });
    }
    return success;
  };

  const getEntriesByGirlId = (girlId: string) => {
    return state.dataEntries
      .filter(entry => entry.girlId === girlId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return {
    dataEntries: state.dataEntries,
    addDataEntry,
    updateDataEntry,
    deleteDataEntry,
    getEntriesByGirlId
  };
}

export function useGlobalStats() {
  const { state } = useAppContext();
  return {
    globalStats: state.globalStats,
    isLoading: state.isLoading
  };
}