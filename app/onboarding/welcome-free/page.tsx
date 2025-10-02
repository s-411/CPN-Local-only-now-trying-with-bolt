'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserIcon } from '@heroicons/react/24/outline';

interface OnboardingGirlData {
  name: string;
  age: number;
  ethnicity?: string;
  hairColor?: string;
  rating: number;
}

export default function WelcomeFree() {
  const router = useRouter();
  const [girlData, setGirlData] = useState<OnboardingGirlData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load girl data from onboarding sessionStorage
    try {
      const girlDataRaw = sessionStorage.getItem('onboarding_girl_data');
      if (girlDataRaw) {
        const data = JSON.parse(girlDataRaw);
        setGirlData(data);
      }
    } catch (error) {
      console.error('Error loading onboarding girl data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddMoreData = () => {
    // Navigate to girls page
    router.push('/girls');
  };

  const handleUpgradeToPlayer = () => {
    // Navigate to upgrade flow
    router.push('/onboarding/results');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cpn-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cpn-yellow mx-auto mb-4"></div>
          <p className="text-cpn-gray">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cpn-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-cpn-gray/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💙</span>
            </div>
            <h1 className="text-4xl font-heading text-cpn-white mb-2">
              Welcome to CPN!
            </h1>
            <p className="text-xl text-cpn-gray mb-4">
              You're in <strong className="text-cpn-white">Boyfriend Mode</strong>
            </p>
          </div>

          <div className="bg-cpn-dark2 border border-cpn-gray/20 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="bg-cpn-dark border border-cpn-gray/20 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-heading text-cpn-white mb-2">Your Limitations:</h2>
              <div className="space-y-2 text-sm text-cpn-gray">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cpn-gray rounded-full"></span>
                  You can only track 1 girl
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cpn-gray rounded-full"></span>
                  Limited data entries per girl
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cpn-gray rounded-full"></span>
                  All features on the left are restricted to Player Mode
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button
                onClick={handleAddMoreData}
                className="flex items-center justify-center gap-2 py-3 px-6 text-cpn-white border border-cpn-gray/30 rounded-full hover:text-cpn-yellow hover:border-cpn-yellow/50 transition-all duration-200 font-heading"
              >
                <UserIcon className="w-5 h-5" />
                Add data to {girlData ? girlData.name : 'your girl'}
              </button>
            </div>

            <div className="border-t border-cpn-gray/10 pt-4">
              <button
                onClick={handleUpgradeToPlayer}
                className="w-full btn-cpn"
              >
                Activate Player Mode
              </button>
              <p className="text-xs text-cpn-gray text-center mt-2">
                Unlock all features • Track up to 50 girls • $1.99/week
              </p>
            </div>
          </div>
        </div>

        {/* Premium Features Preview */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-cpn-dark2 border border-cpn-gray/20 rounded-lg p-6">
            <h3 className="text-lg font-heading text-cpn-white mb-4 text-center">
              What You're Missing in Player Mode
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-cpn-dark border border-cpn-gray/10 rounded-lg p-4 opacity-60">
                <div className="text-center">
                  <span className="text-2xl mb-2 block">📊</span>
                  <h4 className="font-heading text-cpn-white text-sm mb-1">Analytics</h4>
                  <p className="text-xs text-cpn-gray">Advanced insights & reports</p>
                </div>
              </div>
              
              <div className="bg-cpn-dark border border-cpn-gray/10 rounded-lg p-4 opacity-60">
                <div className="text-center">
                  <span className="text-2xl mb-2 block">📋</span>
                  <h4 className="font-heading text-cpn-white text-sm mb-1">Overview</h4>
                  <p className="text-xs text-cpn-gray">Complete data tables</p>
                </div>
              </div>
              
              <div className="bg-cpn-dark border border-cpn-gray/10 rounded-lg p-4 opacity-60">
                <div className="text-center">
                  <span className="text-2xl mb-2 block">🏦</span>
                  <h4 className="font-heading text-cpn-white text-sm mb-1">Data Vault</h4>
                  <p className="text-xs text-cpn-gray">Demographic insights</p>
                </div>
              </div>
              
              <div className="bg-cpn-dark border border-cpn-gray/10 rounded-lg p-4 opacity-60">
                <div className="text-center">
                  <span className="text-2xl mb-2 block">🏆</span>
                  <h4 className="font-heading text-cpn-white text-sm mb-1">Leaderboards</h4>
                  <p className="text-xs text-cpn-gray">Compete with friends</p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-cpn-gray text-sm mb-4">
                Click any menu item to see what you're missing out on!
              </p>
              <button
                onClick={handleUpgradeToPlayer}
                className="btn-cpn bg-gradient-to-r from-cpn-yellow to-cpn-yellow/80 text-cpn-dark hover:from-cpn-yellow/90 hover:to-cpn-yellow/70"
              >
                Get Lifetime Access - $27
              </button>
            </div>
          </div>
        </div>

        {/* Current Stats */}
        <div className="max-w-4xl mx-auto mt-6">
          <div className="bg-cpn-dark2 border border-cpn-gray/20 rounded-lg p-6">
            <h3 className="text-lg font-heading text-cpn-white mb-4">Your Boyfriend Mode Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-cpn-dark border border-cpn-gray/10 rounded-lg p-4">
                <div>
                  <p className="text-cpn-white font-medium">Girls Tracked</p>
                  <p className="text-sm text-cpn-gray">Limited to 1 girl in Boyfriend Mode</p>
                </div>
                <div className="text-2xl font-heading text-cpn-yellow">
                  {girlData ? '1' : '0'} / 1
                </div>
              </div>
              
              <div className="bg-cpn-dark border border-cpn-gray/10 rounded-lg p-4">
                <div>
                  <p className="text-cpn-white font-medium">Data Entries</p>
                  <p className="text-sm text-cpn-gray">Start tracking your metrics</p>
                </div>
                <div className="text-2xl font-heading text-cpn-yellow">
                  {girlData ? '1' : '0'}
                </div>
              </div>

              <div className="bg-cpn-dark border border-cpn-gray/10 rounded-lg p-4">
                <div>
                  <p className="text-cpn-white font-medium">Account Type</p>
                  <p className="text-sm text-cpn-gray">Upgrade for unlimited access</p>
                </div>
                <div className="text-lg font-heading text-cpn-gray">
                  FREE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}