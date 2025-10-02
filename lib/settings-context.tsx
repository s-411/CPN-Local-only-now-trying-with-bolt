'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Settings Types
export interface UserProfile {
  displayName: string;
  avatarUrl?: string;
  accountCreated: Date;
  lastLogin: Date;
}

export interface ThemeSettings {
  theme: 'dark' | 'darker' | 'midnight';
  accentColor: 'yellow' | 'blue' | 'green' | 'red';
  compactMode: boolean;
  animationsEnabled: boolean;
}

export interface DateTimeSettings {
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  weekStart: 'sunday' | 'monday';
}

export interface PrivacySettings {
  leaderboardVisibility: 'public' | 'friends' | 'private';
  showRealName: boolean;
  showProfileStats: boolean;
  allowInvitations: boolean;
  shareAchievements: boolean;
  shareSpendingData: boolean;
  shareEfficiencyMetrics: boolean;
  shareActivityFrequency: boolean;
  anonymousMode: boolean;
}

export interface NotificationSettings {
  leaderboardUpdates: boolean;
  achievementUnlocks: boolean;
  weeklySummaries: boolean;
  monthlySummaries: boolean;
  emailNotifications: boolean;
}

// Context Type
interface SettingsContextType {
  userProfile: UserProfile;
  themeSettings: ThemeSettings;
  dateTimeSettings: DateTimeSettings;
  privacySettings: PrivacySettings;
  notificationSettings: NotificationSettings;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateTheme: (updates: Partial<ThemeSettings>) => void;
  updateDateTime: (updates: Partial<DateTimeSettings>) => void;
  updatePrivacy: (updates: Partial<PrivacySettings>) => void;
  updateNotifications: (updates: Partial<NotificationSettings>) => void;
  isLoaded: boolean;
}

// Default Values
const defaultUserProfile: UserProfile = {
  displayName: 'CPN User',
  avatarUrl: '👤',
  accountCreated: new Date('2024-01-01'),
  lastLogin: new Date()
};

const defaultThemeSettings: ThemeSettings = {
  theme: 'dark',
  accentColor: 'yellow',
  compactMode: false,
  animationsEnabled: true
};

const defaultDateTimeSettings: DateTimeSettings = {
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  weekStart: 'monday'
};

const defaultPrivacySettings: PrivacySettings = {
  leaderboardVisibility: 'friends',
  showRealName: false,
  showProfileStats: true,
  allowInvitations: true,
  shareAchievements: true,
  shareSpendingData: true,
  shareEfficiencyMetrics: true,
  shareActivityFrequency: false,
  anonymousMode: false
};

const defaultNotificationSettings: NotificationSettings = {
  leaderboardUpdates: true,
  achievementUnlocks: true,
  weeklySummaries: true,
  monthlySummaries: true,
  emailNotifications: false
};

// Storage Keys
const STORAGE_KEYS = {
  userProfile: 'cpn_user_profile',
  themeSettings: 'cpn_theme_settings',
  dateTimeSettings: 'cpn_datetime_settings',
  privacySettings: 'cpn_privacy_settings',
  notificationSettings: 'cpn_notification_settings'
};

// Create Context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Settings Provider
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings);
  const [dateTimeSettings, setDateTimeSettings] = useState<DateTimeSettings>(defaultDateTimeSettings);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        // Load user profile
        const savedProfile = localStorage.getItem(STORAGE_KEYS.userProfile);
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          setUserProfile({
            ...parsed,
            accountCreated: new Date(parsed.accountCreated),
            lastLogin: new Date(parsed.lastLogin)
          });
        }

        // Load theme settings
        const savedTheme = localStorage.getItem(STORAGE_KEYS.themeSettings);
        if (savedTheme) {
          setThemeSettings(JSON.parse(savedTheme));
        }

        // Load date/time settings
        const savedDateTime = localStorage.getItem(STORAGE_KEYS.dateTimeSettings);
        if (savedDateTime) {
          setDateTimeSettings(JSON.parse(savedDateTime));
        }

        // Load privacy settings
        const savedPrivacy = localStorage.getItem(STORAGE_KEYS.privacySettings);
        if (savedPrivacy) {
          setPrivacySettings(JSON.parse(savedPrivacy));
        }

        // Load notification settings
        const savedNotifications = localStorage.getItem(STORAGE_KEYS.notificationSettings);
        if (savedNotifications) {
          setNotificationSettings(JSON.parse(savedNotifications));
        }

        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading settings from localStorage:', error);
        setIsLoaded(true);
      }
    };

    // Only load on client side
    if (typeof window !== 'undefined') {
      loadSettings();
    }
  }, []);

  // Update functions with localStorage persistence
  const updateProfile = (updates: Partial<UserProfile>) => {
    const newProfile = { ...userProfile, ...updates };
    setUserProfile(newProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.userProfile, JSON.stringify(newProfile));
    }
  };

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    const newTheme = { ...themeSettings, ...updates };
    setThemeSettings(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.themeSettings, JSON.stringify(newTheme));
    }
  };

  const updateDateTime = (updates: Partial<DateTimeSettings>) => {
    const newDateTime = { ...dateTimeSettings, ...updates };
    setDateTimeSettings(newDateTime);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.dateTimeSettings, JSON.stringify(newDateTime));
    }
  };

  const updatePrivacy = (updates: Partial<PrivacySettings>) => {
    const newPrivacy = { ...privacySettings, ...updates };
    setPrivacySettings(newPrivacy);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.privacySettings, JSON.stringify(newPrivacy));
    }
  };

  const updateNotifications = (updates: Partial<NotificationSettings>) => {
    const newNotifications = { ...notificationSettings, ...updates };
    setNotificationSettings(newNotifications);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.notificationSettings, JSON.stringify(newNotifications));
    }
  };

  const value: SettingsContextType = {
    userProfile,
    themeSettings,
    dateTimeSettings,
    privacySettings,
    notificationSettings,
    updateProfile,
    updateTheme,
    updateDateTime,
    updatePrivacy,
    updateNotifications,
    isLoaded
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Settings Hook
export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Utility Hooks for Specific Settings
export function useUserProfile() {
  const { userProfile, updateProfile } = useSettings();
  return { userProfile, updateProfile };
}

export function useThemeSettings() {
  const { themeSettings, updateTheme } = useSettings();
  return { themeSettings, updateTheme };
}

export function useDateTimeSettings() {
  const { dateTimeSettings, updateDateTime } = useSettings();
  return { dateTimeSettings, updateDateTime };
}

export function usePrivacySettings() {
  const { privacySettings, updatePrivacy } = useSettings();
  return { privacySettings, updatePrivacy };
}

export function useNotificationSettings() {
  const { notificationSettings, updateNotifications } = useSettings();
  return { notificationSettings, updateNotifications };
}

// Format helper functions
export function formatDate(date: Date, settings: DateTimeSettings): string {
  switch (settings.dateFormat) {
    case 'MM/DD/YYYY':
      return date.toLocaleDateString('en-US');
    case 'DD/MM/YYYY':
      return date.toLocaleDateString('en-GB');
    case 'YYYY-MM-DD':
      return date.toISOString().split('T')[0];
    default:
      return date.toLocaleDateString();
  }
}

export function formatTime(date: Date, settings: DateTimeSettings): string {
  return settings.timeFormat === '12h' 
    ? date.toLocaleTimeString('en-US', { hour12: true })
    : date.toLocaleTimeString('en-GB', { hour12: false });
}