'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCircleIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  DocumentArrowDownIcon,
  BellIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  GlobeAltIcon,
  EyeIcon,
  EyeSlashIcon,
  TrophyIcon,
  ChartBarIcon,
  CreditCardIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useGirls, useDataEntries } from '@/lib/context';
import { leaderboardGroupsStorage, leaderboardMembersStorage } from '@/lib/leaderboards';
import { LeaderboardGroup } from '@/lib/types';
import Link from 'next/link';

interface UserProfile {
  displayName: string;
  avatarUrl?: string;
  accountCreated: Date;
  lastLogin: Date;
}

interface DateTimeSettings {
  dateFormat: string;
  timeFormat: '12h' | '24h';
  weekStart: 'sunday' | 'monday';
}

interface NotificationSettings {
  leaderboardUpdates: boolean;
  achievementAlerts: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  dataReminders: boolean;
}

interface PrivacySettings {
  leaderboardVisible: boolean;
  shareStats: boolean;
  shareAchievements: boolean;
  profileDiscoverable: boolean;
  anonymousMode: boolean;
}

const defaultAvatars = [
  '👤', '🧑‍💼', '👨‍💻', '👩‍💻', '🧑‍🎨', '👨‍🎨', '👩‍🎨', '🧑‍🔬',
  '👨‍🔬', '👩‍🔬', '🧑‍🍳', '👨‍🍳', '👩‍🍳', '🧑‍⚕️', '👨‍⚕️', '👩‍⚕️'
];

const dateFormatOptions = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/25/2024' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '25/12/2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2024-12-25' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY', example: '25 Dec 2024' }
];

const weekStartOptions = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' }
];

export default function SettingsPage() {
  const { girls, girlsWithMetrics } = useGirls();
  const { dataEntries } = useDataEntries();
  const [isClient, setIsClient] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    displayName: 'CPN User',
    avatarUrl: '👤',
    accountCreated: new Date('2024-01-01'),
    lastLogin: new Date()
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState('');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // DateTime settings state
  const [dateTimeSettings, setDateTimeSettings] = useState<DateTimeSettings>({
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    weekStart: 'monday'
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    leaderboardUpdates: true,
    achievementAlerts: true,
    weeklyReports: false,
    monthlyReports: true,
    dataReminders: true
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    leaderboardVisible: true,
    shareStats: false,
    shareAchievements: true,
    profileDiscoverable: true,
    anonymousMode: false
  });

  // Leaderboards state
  const [userGroups, setUserGroups] = useState<LeaderboardGroup[]>([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [groupToLeave, setGroupToLeave] = useState<LeaderboardGroup | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    setIsClient(true);
    
    const savedProfile = localStorage.getItem('cpn_user_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile({
        ...parsed,
        accountCreated: new Date(parsed.accountCreated),
        lastLogin: new Date(parsed.lastLogin)
      });
    }

    const savedDateTime = localStorage.getItem('cpn_datetime_settings');
    if (savedDateTime) {
      setDateTimeSettings(JSON.parse(savedDateTime));
    }

    const savedNotifications = localStorage.getItem('cpn_notification_settings');
    if (savedNotifications) {
      setNotificationSettings(JSON.parse(savedNotifications));
    }

    const savedPrivacy = localStorage.getItem('cpn_privacy_settings');
    if (savedPrivacy) {
      setPrivacySettings(JSON.parse(savedPrivacy));
    }

    // Load user groups
    loadUserGroups();
  }, []);

  const loadUserGroups = () => {
    // Get all groups - in a real app, this would filter by user membership
    // For now, we'll show all groups as if the user is a member
    const allGroups = leaderboardGroupsStorage.getAll();
    setUserGroups(allGroups);
  };

  // Save functions
  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('cpn_user_profile', JSON.stringify(newProfile));
  };

  const updateDateTimeSettings = (updates: Partial<DateTimeSettings>) => {
    const newSettings = { ...dateTimeSettings, ...updates };
    setDateTimeSettings(newSettings);
    localStorage.setItem('cpn_datetime_settings', JSON.stringify(newSettings));
  };

  const updateNotificationSettings = (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...notificationSettings, ...updates };
    setNotificationSettings(newSettings);
    localStorage.setItem('cpn_notification_settings', JSON.stringify(newSettings));
  };

  const updatePrivacySettings = (updates: Partial<PrivacySettings>) => {
    const newSettings = { ...privacySettings, ...updates };
    setPrivacySettings(newSettings);
    localStorage.setItem('cpn_privacy_settings', JSON.stringify(newSettings));
  };

  // Profile edit handlers
  const handleEditDisplayName = () => {
    setTempDisplayName(profile.displayName);
    setIsEditingProfile(true);
  };

  const handleSaveDisplayName = () => {
    saveProfile({ ...profile, displayName: tempDisplayName || 'CPN User' });
    setIsEditingProfile(false);
  };

  const handleCancelEditDisplayName = () => {
    setTempDisplayName('');
    setIsEditingProfile(false);
  };

  const handleAvatarChange = (avatar: string) => {
    saveProfile({ ...profile, avatarUrl: avatar });
    setShowAvatarSelector(false);
  };

  // Leaderboard handlers
  const handleLeaveGroup = (group: LeaderboardGroup) => {
    setGroupToLeave(group);
    setShowLeaveModal(true);
  };

  const confirmLeaveGroup = () => {
    if (!groupToLeave) return;
    
    // In a real app, this would remove the user from the group
    // For now, we'll just remove the group entirely for demo purposes
    leaderboardGroupsStorage.delete(groupToLeave.id);
    
    loadUserGroups();
    setShowLeaveModal(false);
    setGroupToLeave(null);
  };

  const cancelLeaveGroup = () => {
    setShowLeaveModal(false);
    setGroupToLeave(null);
  };

  // Data export functions
  const exportData = (format: 'csv' | 'json') => {
    const data = {
      girls,
      dataEntries,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cpn-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export logic would go here
      alert('CSV export coming soon!');
    }
  };

  // Calculate stats (only on client to avoid hydration mismatch)
  const totalGirls = girls.length;
  const totalEntries = dataEntries.length;
  const accountAge = isClient ? Math.floor((new Date().getTime() - profile.accountCreated.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="min-h-screen bg-cpn-dark">
      {/* Header */}
      <div className="border-b border-cpn-gray/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center gap-3 mb-4">
              <UserCircleIcon className="w-8 h-8 text-cpn-yellow" />
              <div>
                <h1 className="text-3xl font-heading text-cpn-white">Settings</h1>
                <p className="text-cpn-gray mt-1">
                  Customize your CPN experience and manage your account
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in space-y-8">
          
          {/* Account Overview */}
          <div className="card-cpn">
            <h2 className="text-xl font-heading text-cpn-white mb-6">Account Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-cpn-dark2/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-cpn-white">{totalGirls}</p>
                <p className="text-sm text-cpn-gray">Girls Tracked</p>
              </div>
              <div className="bg-cpn-dark2/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-cpn-white">{totalEntries}</p>
                <p className="text-sm text-cpn-gray">Data Entries</p>
              </div>
              <div className="bg-cpn-dark2/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-cpn-white">{accountAge}</p>
                <p className="text-sm text-cpn-gray">Days Active</p>
              </div>
              <div className="bg-cpn-dark2/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-cpn-yellow">100%</p>
                <p className="text-sm text-cpn-gray">Profile Complete</p>
              </div>
            </div>
          </div>

          {/* Profile Management */}
          <div className="card-cpn bg-gradient-to-br from-cpn-dark2 to-cpn-dark">
            <div className="flex items-center gap-3 mb-6">
              <UserCircleIcon className="w-6 h-6 text-cpn-yellow" />
              <h2 className="text-xl font-heading text-cpn-white">Profile Management</h2>
            </div>

            {/* Display Name */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-cpn-white mb-2">Display Name</h3>
              <p className="text-xs text-cpn-gray/80 mb-4">
                (This name will be visible only to groups that you have joined and will not be publicly available)
              </p>
              <div className="flex items-center gap-4">
                {isEditingProfile ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={tempDisplayName}
                      onChange={(e) => setTempDisplayName(e.target.value)}
                      className="input-cpn flex-1"
                      placeholder="Enter display name"
                      maxLength={30}
                    />
                    <button
                      onClick={handleSaveDisplayName}
                      className="p-2 text-green-400 hover:text-green-300 transition-colors cursor-pointer"
                    >
                      <CheckIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancelEditDisplayName}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between flex-1">
                    <span className="text-cpn-white text-lg">{profile.displayName}</span>
                    <button
                      onClick={handleEditDisplayName}
                      className="p-2 text-cpn-gray hover:text-cpn-white transition-colors cursor-pointer"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Avatar Selection */}
            <div>
              <h3 className="text-lg font-medium text-cpn-white mb-4">Avatar</h3>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{profile.avatarUrl}</div>
                <button
                  onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  className="px-4 py-2 bg-cpn-dark2 border border-cpn-gray/30 rounded-lg text-cpn-white hover:border-cpn-yellow transition-colors cursor-pointer"
                >
                  Change Avatar
                </button>
              </div>
              
              {showAvatarSelector && (
                <div className="mt-4 p-4 bg-cpn-dark2/30 rounded-lg">
                  <div className="grid grid-cols-8 gap-2">
                    {defaultAvatars.map((avatar) => (
                      <button
                        key={avatar}
                        onClick={() => handleAvatarChange(avatar)}
                        className={`text-2xl p-2 rounded hover:bg-cpn-yellow/20 transition-colors cursor-pointer ${
                          profile.avatarUrl === avatar ? 'bg-cpn-yellow/30' : ''
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboards */}
          <div className="card-cpn bg-gradient-to-br from-cpn-dark2 to-cpn-dark">
            <div className="flex items-center gap-3 mb-6">
              <TrophyIcon className="w-6 h-6 text-cpn-yellow" />
              <h2 className="text-xl font-heading text-cpn-white">Leaderboards</h2>
            </div>
            
            {userGroups.length === 0 ? (
              <div className="text-center py-8">
                <UserGroupIcon className="w-12 h-12 text-cpn-gray mx-auto mb-4" />
                <p className="text-cpn-gray mb-2">You haven't joined any groups yet</p>
                <Link 
                  href="/leaderboards"
                  className="text-cpn-yellow hover:text-cpn-yellow/80 transition-colors text-sm"
                >
                  Browse leaderboards →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userGroups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-4 bg-cpn-dark2/50 rounded-lg border border-cpn-gray/20">
                    <div className="flex items-center gap-4">
                      <TrophyIcon className="w-6 h-6 text-cpn-yellow" />
                      <div>
                        <h3 className="text-cpn-white font-medium">{group.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-cpn-gray">
                          <span>{group.memberCount} members</span>
                          <span>•</span>
                          <span>Joined {group.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/leaderboards/${group.id}`}
                        className="px-3 py-2 text-cpn-yellow border border-cpn-yellow/30 rounded-lg hover:bg-cpn-yellow/10 transition-colors text-sm"
                      >
                        View Rankings
                      </Link>
                      <button
                        onClick={() => handleLeaveGroup(group)}
                        className="p-2 text-cpn-gray hover:text-red-400 transition-colors group"
                        title="Leave group"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Privacy Notice */}
            <div className="mt-6 bg-cpn-dark2/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-cpn-white mb-3">Privacy & Anonymity</h3>
              <div className="space-y-2 text-sm text-cpn-gray">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cpn-yellow rounded-full mt-2"></div>
                  <p>All leaderboards are completely private and invite-only</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cpn-yellow rounded-full mt-2"></div>
                  <p>Your display name is only visible to groups you've joined</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cpn-yellow rounded-full mt-2"></div>
                  <p>All usernames are kept anonymous - only you know your real identity</p>
                </div>
              </div>
            </div>
          </div>


          {/* Notifications */}
          <div className="card-cpn bg-gradient-to-br from-cpn-dark2 to-cpn-dark">
            <div className="flex items-center gap-3 mb-6">
              <BellIcon className="w-6 h-6 text-cpn-yellow" />
              <h2 className="text-xl font-heading text-cpn-white">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-cpn-dark2/30 rounded-lg">
                <div>
                  <h4 className="font-medium text-cpn-white">Achievement Alerts</h4>
                  <p className="text-sm text-cpn-gray">Get notified when you unlock new achievements</p>
                </div>
                <button
                  onClick={() => updateNotificationSettings({ achievementAlerts: !notificationSettings.achievementAlerts })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    notificationSettings.achievementAlerts ? 'bg-green-500' : 'bg-cpn-gray'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.achievementAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-cpn-dark2/30 rounded-lg">
                <div>
                  <h4 className="font-medium text-cpn-white">Weekly Reports</h4>
                  <p className="text-sm text-cpn-gray">Receive weekly summaries of your activity</p>
                </div>
                <button
                  onClick={() => updateNotificationSettings({ weeklyReports: !notificationSettings.weeklyReports })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    notificationSettings.weeklyReports ? 'bg-green-500' : 'bg-cpn-gray'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-cpn-dark2/30 rounded-lg">
                <div>
                  <h4 className="font-medium text-cpn-white">Monthly Reports</h4>
                  <p className="text-sm text-cpn-gray">Get detailed monthly analytics and insights</p>
                </div>
                <button
                  onClick={() => updateNotificationSettings({ monthlyReports: !notificationSettings.monthlyReports })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    notificationSettings.monthlyReports ? 'bg-green-500' : 'bg-cpn-gray'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.monthlyReports ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-cpn-dark2/30 rounded-lg">
                <div>
                  <h4 className="font-medium text-cpn-white">Data Entry Reminders</h4>
                  <p className="text-sm text-cpn-gray">Gentle reminders to log your activities</p>
                </div>
                <button
                  onClick={() => updateNotificationSettings({ dataReminders: !notificationSettings.dataReminders })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    notificationSettings.dataReminders ? 'bg-green-500' : 'bg-cpn-gray'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.dataReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="card-cpn bg-gradient-to-br from-cpn-dark2 to-cpn-dark">
            <div className="flex items-center gap-3 mb-6">
              <DocumentArrowDownIcon className="w-6 h-6 text-cpn-yellow" />
              <h2 className="text-xl font-heading text-cpn-white">Data Management</h2>
            </div>

            {/* Export Data */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-cpn-white mb-4">Export Your Data</h3>
              <p className="text-cpn-gray text-sm mb-4">
                Download all your data in your preferred format. All exports include girls, data entries, and settings.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => exportData('json')}
                  className="px-4 py-2 bg-cpn-yellow text-cpn-dark font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => exportData('csv')}
                  className="px-4 py-2 bg-cpn-dark2 border border-cpn-gray/30 text-cpn-white rounded-lg hover:border-cpn-gray transition-colors cursor-pointer"
                >
                  Export as CSV
                </button>
              </div>
            </div>

            {/* Data Statistics */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-cpn-white mb-4">Your Data</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-cpn-dark2/30 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-cpn-white">{totalGirls}</p>
                  <p className="text-xs text-cpn-gray">Girls</p>
                </div>
                <div className="bg-cpn-dark2/30 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-cpn-white">{totalEntries}</p>
                  <p className="text-xs text-cpn-gray">Entries</p>
                </div>
                <div className="bg-cpn-dark2/30 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-cpn-white">{isClient ? (JSON.stringify({ girls, dataEntries }).length / 1024).toFixed(1) : '0'}KB</p>
                  <p className="text-xs text-cpn-gray">Data Size</p>
                </div>
                <div className="bg-cpn-dark2/30 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-cpn-white">{accountAge}</p>
                  <p className="text-xs text-cpn-gray">Days Old</p>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h4 className="font-medium text-green-400 mb-2">🔒 Privacy First</h4>
              <p className="text-sm text-cpn-gray">
                All your data is stored locally on your device. CPN does not upload, sync, or share your personal data with any servers or third parties.
              </p>
            </div>
          </div>

          {/* Subscription Management */}
          <div className="card-cpn bg-gradient-to-br from-cpn-dark2 to-cpn-dark">
            <div className="flex items-center gap-3 mb-6">
              <CreditCardIcon className="w-6 h-6 text-cpn-yellow" />
              <h2 className="text-xl font-heading text-cpn-white">Subscription</h2>
            </div>

            {/* Current Plan */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-cpn-white mb-4">Current Plan</h3>
              <div className="bg-cpn-dark2/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-cpn-white">Boyfriend Mode (Free)</h4>
                    <p className="text-sm text-cpn-gray">Track 1 girl with basic features</p>
                  </div>
                  <div className="bg-cpn-yellow/20 text-cpn-yellow px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </div>
                </div>
                <div className="text-sm text-cpn-gray">
                  <p>• 1 girl maximum</p>
                  <p>• Basic analytics</p>
                  <p>• Local data storage</p>
                  <p>• Core features included</p>
                </div>
              </div>
            </div>

            {/* Upgrade Options */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-cpn-white mb-4">Available Upgrades</h3>
              <div className="space-y-3">
                <div className="bg-cpn-dark2/30 rounded-lg p-4 border border-cpn-yellow/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-cpn-white">Player Mode</h4>
                    <span className="text-cpn-yellow font-bold">$1.99/week</span>
                  </div>
                  <p className="text-sm text-cpn-gray mb-3">Track up to 50 girls with premium features</p>
                  <div className="text-sm text-cpn-gray">
                    <p>• 50 girls maximum</p>
                    <p>• Advanced analytics & charts</p>
                    <p>• Leaderboards access</p>
                    <p>• Share achievements</p>
                    <p>• Priority support</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-cpn-yellow/10 to-cpn-yellow/5 rounded-lg p-4 border border-cpn-yellow/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-cpn-white">Lifetime Access</h4>
                    <span className="text-cpn-yellow font-bold">$49.99</span>
                  </div>
                  <p className="text-sm text-cpn-gray mb-3">One-time payment for unlimited access</p>
                  <div className="text-sm text-cpn-gray">
                    <p>• Everything in Player Mode</p>
                    <p>• API access for developers</p>
                    <p>• Early access to new features</p>
                    <p>• Lifetime updates</p>
                    <p>• VIP support channel</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Management Button */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // TODO: Navigate to subscription page when ready
                  alert('Subscription management page coming soon!');
                }}
                className="px-4 py-2 bg-cpn-yellow text-cpn-dark font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                Manage Subscription
              </button>
              <button
                onClick={() => {
                  // TODO: Open upgrade modal when ready
                  alert('Upgrade options coming soon!');
                }}
                className="px-4 py-2 bg-cpn-dark2 border border-cpn-gray/30 text-cpn-white rounded-lg hover:border-cpn-gray transition-colors cursor-pointer"
              >
                Upgrade Plan
              </button>
            </div>

            {/* Billing Info */}
            <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-400 mb-2">💡 Free Tier Benefits</h4>
              <p className="text-sm text-cpn-gray">
                You're currently on our free tier with full access to core features. Upgrade to unlock advanced analytics, leaderboards, and support for tracking multiple relationships.
              </p>
            </div>
          </div>

          {/* Help & Support */}
          <div className="text-center py-8">
            <p className="text-cpn-gray text-sm">
              Need help with your settings? All data is stored locally on your device for privacy.
            </p>
          </div>
        </div>
      </div>

      {/* Leave Group Confirmation Modal */}
      {showLeaveModal && groupToLeave && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-cpn-dark border border-cpn-gray/20 rounded-lg w-full max-w-md animate-slide-up">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-heading text-cpn-white">Leave Group</h3>
                  <p className="text-sm text-cpn-gray">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-cpn-gray mb-6">
                Are you sure you want to leave <strong className="text-cpn-white">"{groupToLeave.name}"</strong>? 
                You'll need to be invited again to rejoin this group.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={cancelLeaveGroup}
                  className="flex-1 py-3 px-4 text-cpn-gray border border-cpn-gray/30 rounded-lg hover:text-cpn-white hover:border-cpn-gray transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLeaveGroup}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                >
                  Yes, remove me from this group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}