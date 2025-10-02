'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ShareService } from './ShareService';
import { ShareableContent, ShareOptions, ShareHistoryEntry, SharePrivacySettings, ShareFormat } from './types';
import { DEFAULT_PRIVACY_SETTINGS } from './privacy';

// Share state interface
interface ShareState {
  // Current share operation
  activeShare: {
    content: ShareableContent | null;
    status: 'idle' | 'generating' | 'ready' | 'error';
    error?: string;
  };
  
  // Share history
  history: ShareHistoryEntry[];
  
  // User preferences
  preferences: {
    defaultFormat: ShareFormat;
    defaultPrivacy: SharePrivacySettings;
    autoWatermark: boolean;
    quickShareEnabled: boolean;
  };
  
  // UI state
  showPreviewModal: boolean;
  showHistoryPanel: boolean;
}

// Share actions
type ShareAction =
  | { type: 'SET_ACTIVE_SHARE'; payload: ShareableContent }
  | { type: 'SET_STATUS'; payload: ShareState['activeShare']['status'] }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ACTIVE_SHARE' }
  | { type: 'UPDATE_HISTORY'; payload: ShareHistoryEntry[] }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<ShareState['preferences']> }
  | { type: 'TOGGLE_PREVIEW_MODAL'; payload?: boolean }
  | { type: 'TOGGLE_HISTORY_PANEL'; payload?: boolean };

// Initial state
const initialState: ShareState = {
  activeShare: {
    content: null,
    status: 'idle'
  },
  history: [],
  preferences: {
    defaultFormat: 'image',
    defaultPrivacy: DEFAULT_PRIVACY_SETTINGS,
    autoWatermark: true,
    quickShareEnabled: true
  },
  showPreviewModal: false,
  showHistoryPanel: false
};

// Reducer
function shareReducer(state: ShareState, action: ShareAction): ShareState {
  switch (action.type) {
    case 'SET_ACTIVE_SHARE':
      return {
        ...state,
        activeShare: {
          content: action.payload,
          status: 'ready',
          error: undefined
        }
      };
    
    case 'SET_STATUS':
      return {
        ...state,
        activeShare: {
          ...state.activeShare,
          status: action.payload
        }
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        activeShare: {
          ...state.activeShare,
          status: 'error',
          error: action.payload
        }
      };
    
    case 'CLEAR_ACTIVE_SHARE':
      return {
        ...state,
        activeShare: {
          content: null,
          status: 'idle',
          error: undefined
        }
      };
    
    case 'UPDATE_HISTORY':
      return {
        ...state,
        history: action.payload
      };
    
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };
    
    case 'TOGGLE_PREVIEW_MODAL':
      return {
        ...state,
        showPreviewModal: action.payload ?? !state.showPreviewModal
      };
    
    case 'TOGGLE_HISTORY_PANEL':
      return {
        ...state,
        showHistoryPanel: action.payload ?? !state.showHistoryPanel
      };
    
    default:
      return state;
  }
}

// Context
const ShareContext = createContext<{
  state: ShareState;
  actions: {
    generateStatCard: (data: any, options: ShareOptions) => Promise<void>;
    generateComparisonReport: (data: any, options: ShareOptions) => Promise<void>;
    shareViaClipboard: (format?: ShareFormat) => Promise<boolean>;
    shareViaDownload: (format?: ShareFormat, filename?: string) => Promise<void>;
    shareViaURL: () => Promise<string>;
    clearActiveShare: () => void;
    updatePreferences: (prefs: Partial<ShareState['preferences']>) => void;
    togglePreviewModal: (show?: boolean) => void;
    toggleHistoryPanel: (show?: boolean) => void;
    refreshHistory: () => void;
  };
} | null>(null);

// Provider component
export function ShareProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shareReducer, initialState);
  const [shareService, setShareService] = React.useState<ShareService | null>(null);

  // Initialize ShareService only on client-side
  useEffect(() => {
    setShareService(ShareService.getInstance());
  }, []);

  // Load preferences and history on mount
  useEffect(() => {
    if (shareService) {
      loadPreferences();
      refreshHistory();
    }
  }, [shareService]);

  // Save preferences when they change
  useEffect(() => {
    savePreferences();
  }, [state.preferences]);

  const loadPreferences = () => {
    // Share preferences managed via settings API
    // No localStorage needed
  };

  const savePreferences = () => {
    // Share preferences managed via settings API
    // No localStorage needed
  };

  const refreshHistory = () => {
    if (!shareService) return;
    const history = shareService.getShareHistory();
    dispatch({ type: 'UPDATE_HISTORY', payload: history });
  };

  const actions = {
    generateStatCard: async (data: any, options: ShareOptions) => {
      if (!shareService) return;
      try {
        dispatch({ type: 'SET_STATUS', payload: 'generating' });
        const content = await shareService.generateStatCard(data, options);
        dispatch({ type: 'SET_ACTIVE_SHARE', payload: content });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
      }
    },

    generateComparisonReport: async (data: any, options: ShareOptions) => {
      if (!shareService) return;
      try {
        dispatch({ type: 'SET_STATUS', payload: 'generating' });
        const content = await shareService.generateComparisonReport(data, options);
        dispatch({ type: 'SET_ACTIVE_SHARE', payload: content });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
      }
    },

    generateAchievementBadge: async (data: any, options: ShareOptions) => {
      if (!shareService) return;
      try {
        dispatch({ type: 'SET_STATUS', payload: 'generating' });
        const content = await shareService.generateAchievementBadge(data, options);
        dispatch({ type: 'SET_ACTIVE_SHARE', payload: content });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
      }
    },

    shareViaClipboard: async (format?: ShareFormat) => {
      if (!shareService || !state.activeShare.content) return false;

      try {
        const formatToUse = format || state.preferences.defaultFormat;
        const success = await shareService.shareViaClipboard(
          state.activeShare.content,
          formatToUse
        );
        if (success) {
          refreshHistory();
        }
        return success;
      } catch (error) {
        console.error('Failed to share via clipboard:', error);
        return false;
      }
    },

    shareViaDownload: async (format?: ShareFormat, filename?: string) => {
      if (!shareService || !state.activeShare.content) return;

      try {
        const formatToUse = format || state.preferences.defaultFormat;
        await shareService.shareViaDownload(
          state.activeShare.content,
          formatToUse,
          filename
        );
        refreshHistory();
      } catch (error) {
        console.error('Failed to share via download:', error);
      }
    },

    shareViaURL: async () => {
      if (!shareService || !state.activeShare.content) return '';

      try {
        const url = await shareService.shareViaURL(state.activeShare.content);
        refreshHistory();
        return url;
      } catch (error) {
        console.error('Failed to generate share URL:', error);
        return '';
      }
    },

    clearActiveShare: () => {
      dispatch({ type: 'CLEAR_ACTIVE_SHARE' });
    },

    updatePreferences: (prefs: Partial<ShareState['preferences']>) => {
      dispatch({ type: 'UPDATE_PREFERENCES', payload: prefs });
    },

    togglePreviewModal: (show?: boolean) => {
      dispatch({ type: 'TOGGLE_PREVIEW_MODAL', payload: show });
    },

    toggleHistoryPanel: (show?: boolean) => {
      dispatch({ type: 'TOGGLE_HISTORY_PANEL', payload: show });
    },

    refreshHistory
  };

  return (
    <ShareContext.Provider value={{ state, actions }}>
      {children}
    </ShareContext.Provider>
  );
}

// Hook to use share context
export function useShare() {
  const context = useContext(ShareContext);
  if (!context) {
    throw new Error('useShare must be used within a ShareProvider');
  }
  return context;
}