'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Girl, DataEntry, GirlWithMetrics, GlobalStats } from './types';
import { createGirlWithMetrics, calculateGlobalStats } from './calculations';
import { getOrCreateSession } from './database/session';

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
    const loadData = async () => {
      try {
        // Ensure we're in the browser before initializing session
        if (typeof window === 'undefined') {
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        // Initialize session first
        try {
          await getOrCreateSession();
        } catch (sessionError) {
          console.error('Session initialization error:', sessionError);
          // If session creation fails, still try to load data (may return empty arrays)
        }

        const [girlsResponse, entriesResponse] = await Promise.all([
          fetch('/api/girls'),
          fetch('/api/data-entries')
        ]);

        // If unauthorized, session doesn't exist yet - load with empty data
        if (girlsResponse.status === 401 || entriesResponse.status === 401) {
          console.log('No session found, starting with empty data');
          dispatch({ type: 'LOAD_DATA', payload: { girls: [], dataEntries: [] } });
          return;
        }

        if (!girlsResponse.ok || !entriesResponse.ok) {
          console.error('Failed to fetch data:', girlsResponse.status, entriesResponse.status);
          // Load empty data on error rather than staying in loading state
          dispatch({ type: 'LOAD_DATA', payload: { girls: [], dataEntries: [] } });
          return;
        }

        const girls = await girlsResponse.json();
        const dataEntries = await entriesResponse.json();

        // Empty arrays are valid - user just has no data yet
        dispatch({ type: 'LOAD_DATA', payload: { girls, dataEntries } });
      } catch (error) {
        console.error('Error loading data from database:', error);
        // Load empty data on error to exit loading state
        dispatch({ type: 'LOAD_DATA', payload: { girls: [], dataEntries: [] } });
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

  const addGirl = async (girlData: Omit<Girl, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/girls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(girlData),
      });

      if (!response.ok) throw new Error('Failed to create girl');

      const newGirl = await response.json();
      dispatch({ type: 'ADD_GIRL', payload: newGirl });
      return newGirl;
    } catch (error) {
      console.error('Error adding girl:', error);
      throw error;
    }
  };

  const updateGirl = async (id: string, updates: Partial<Omit<Girl, 'id' | 'createdAt'>>) => {
    try {
      const response = await fetch(`/api/girls/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update girl');

      const updatedGirl = await response.json();
      dispatch({ type: 'UPDATE_GIRL', payload: updatedGirl });
      return updatedGirl;
    } catch (error) {
      console.error('Error updating girl:', error);
      return null;
    }
  };

  const deleteGirl = async (id: string) => {
    try {
      const response = await fetch(`/api/girls/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete girl');

      dispatch({ type: 'DELETE_GIRL', payload: id });
      return true;
    } catch (error) {
      console.error('Error deleting girl:', error);
      return false;
    }
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

  const addDataEntry = async (entryData: Omit<DataEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/data-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData),
      });

      if (!response.ok) throw new Error('Failed to create data entry');

      const newEntry = await response.json();
      dispatch({ type: 'ADD_DATA_ENTRY', payload: newEntry });
      return newEntry;
    } catch (error) {
      console.error('Error adding data entry:', error);
      throw error;
    }
  };

  const updateDataEntry = async (id: string, updates: Partial<Omit<DataEntry, 'id' | 'createdAt'>>) => {
    try {
      const response = await fetch(`/api/data-entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update data entry');

      const updatedEntry = await response.json();
      dispatch({ type: 'UPDATE_DATA_ENTRY', payload: updatedEntry });
      return updatedEntry;
    } catch (error) {
      console.error('Error updating data entry:', error);
      return null;
    }
  };

  const deleteDataEntry = async (id: string) => {
    try {
      const response = await fetch(`/api/data-entries/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete data entry');

      dispatch({ type: 'DELETE_DATA_ENTRY', payload: id });
      return true;
    } catch (error) {
      console.error('Error deleting data entry:', error);
      return false;
    }
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