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
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateTheme: (updates: Partial<ThemeSettings>) => Promise<void>;
  updateDateTime: (updates: Partial<DateTimeSettings>) => Promise<void>;
  updatePrivacy: (updates: Partial<PrivacySettings>) => Promise<void>;
  updateNotifications: (updates: Partial<NotificationSettings>) => Promise<void>;
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');

        if (!response.ok) {
          console.warn('Failed to load settings from database, using defaults');
          setIsLoaded(true);
          return;
        }

        const dbSettings = await response.json();

        setUserProfile({
          displayName: dbSettings.display_name,
          avatarUrl: dbSettings.avatar_url || '👤',
          accountCreated: new Date(dbSettings.created_at),
          lastLogin: new Date()
        });

        setThemeSettings({
          theme: dbSettings.theme,
          accentColor: dbSettings.accent_color,
          compactMode: dbSettings.compact_mode,
          animationsEnabled: dbSettings.animations_enabled
        });

        setDateTimeSettings({
          dateFormat: dbSettings.date_format,
          timeFormat: dbSettings.time_format,
          weekStart: dbSettings.week_start
        });

        setPrivacySettings(dbSettings.privacy_settings);
        setNotificationSettings(dbSettings.notification_settings);

        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading settings from database:', error);
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const newProfile = { ...userProfile, ...updates };
    setUserProfile(newProfile);

    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            display_name: newProfile.displayName,
            avatar_url: newProfile.avatarUrl
          }),
        });
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  const updateTheme = async (updates: Partial<ThemeSettings>) => {
    const newTheme = { ...themeSettings, ...updates };
    setThemeSettings(newTheme);

    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme: newTheme.theme,
            accent_color: newTheme.accentColor,
            compact_mode: newTheme.compactMode,
            animations_enabled: newTheme.animationsEnabled
          }),
        });
      } catch (error) {
        console.error('Error updating theme:', error);
      }
    }
  };

  const updateDateTime = async (updates: Partial<DateTimeSettings>) => {
    const newDateTime = { ...dateTimeSettings, ...updates };
    setDateTimeSettings(newDateTime);

    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date_format: newDateTime.dateFormat,
            time_format: newDateTime.timeFormat,
            week_start: newDateTime.weekStart
          }),
        });
      } catch (error) {
        console.error('Error updating date/time settings:', error);
      }
    }
  };

  const updatePrivacy = async (updates: Partial<PrivacySettings>) => {
    const newPrivacy = { ...privacySettings, ...updates };
    setPrivacySettings(newPrivacy);

    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            privacy_settings: newPrivacy
          }),
        });
      } catch (error) {
        console.error('Error updating privacy settings:', error);
      }
    }
  };

  const updateNotifications = async (updates: Partial<NotificationSettings>) => {
    const newNotifications = { ...notificationSettings, ...updates };
    setNotificationSettings(newNotifications);

    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notification_settings: newNotifications
          }),
        });
      } catch (error) {
        console.error('Error updating notification settings:', error);
      }
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
