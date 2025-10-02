'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, UserIcon } from '@heroicons/react/24/outline';
import AddGirlModal from '@/components/modals/AddGirlModal';

interface OnboardingGirlData {
  name: string;
  age: number;
  ethnicity?: string;
  hairColor?: string;
  rating: number;
}

export default function WelcomePremium() {
  const router = useRouter();
  const [girlData, setGirlData] = useState<OnboardingGirlData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddGirlModalOpen, setIsAddGirlModalOpen] = useState(false);

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
    // TODO: Navigate to add data for the onboarding girl
    // This will require creating the girl in the main app first
    // For now, navigate to girls page
    router.push('/girls');
  };

  const handleAddNewGirl = () => {
    // Open the Add Girl modal
    setIsAddGirlModalOpen(true);
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
            <div className="w-16 h-16 bg-gradient-to-br from-cpn-yellow to-cpn-yellow/80 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎉</span>
            </div>
            <h1 className="text-4xl font-heading text-cpn-white mb-2">
              Welcome! Payment Success!
            </h1>
            <p className="text-xl text-cpn-gray mb-4">
              You can now use all features of Mastering Your Dating Efficiency
            </p>
          </div>

          <div className="bg-cpn-dark2 border border-cpn-yellow/20 rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-heading text-cpn-white mb-4">Next Steps:</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
              <button 
                onClick={() => router.push('/girls')}
                className="flex items-center gap-2 text-cpn-gray hover:text-cpn-yellow transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 bg-cpn-yellow rounded-full"></span>
                Add more girls
              </button>
              <button 
                onClick={() => router.push('/girls')}
                className="flex items-center gap-2 text-cpn-gray hover:text-cpn-yellow transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 bg-cpn-yellow rounded-full"></span>
                Add more data
              </button>
              <button 
                onClick={() => router.push('/data-vault')}
                className="flex items-center gap-2 text-cpn-gray hover:text-cpn-yellow transition-colors cursor-pointer"
              >
                <span className="w-2 h-2 bg-cpn-yellow rounded-full"></span>
                Check Data Vault
              </button>
            </div>

            <div className="bg-cpn-dark border border-cpn-gray/20 rounded-lg p-4 mb-6">
              <p className="text-cpn-yellow font-medium text-center">
                💰 Share with friends for 50% off their subscription!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleAddMoreData}
                className="flex items-center justify-center gap-2 py-3 px-6 text-cpn-white border border-cpn-gray/30 rounded-full hover:text-cpn-yellow hover:border-cpn-yellow/50 transition-all duration-200 font-heading"
              >
                <UserIcon className="w-5 h-5" />
                Add more data to {girlData ? girlData.name : 'your first girl'}
              </button>
              
              <button
                onClick={handleAddNewGirl}
                className="flex items-center justify-center gap-2 btn-cpn font-heading"
              >
                <PlusIcon className="w-5 h-5" />
                Add a new girl
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-cpn-dark2 border border-cpn-gray/20 rounded-lg p-6">
            <h3 className="text-lg font-heading text-cpn-white mb-4">Your CPN Journey Starts Here</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-cpn-dark border border-cpn-gray/10 rounded-lg">
                <div>
                  <p className="text-cpn-white font-medium">Girls Added</p>
                  <p className="text-sm text-cpn-gray">Track up to 50 girls in Player Mode</p>
                </div>
                <div className="text-2xl font-heading text-cpn-yellow">
                  {girlData ? '1' : '0'}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-cpn-dark border border-cpn-gray/10 rounded-lg">
                <div>
                  <p className="text-cpn-white font-medium">Data Entries</p>
                  <p className="text-sm text-cpn-gray">Start tracking your metrics</p>
                </div>
                <div className="text-2xl font-heading text-cpn-yellow">
                  {girlData ? '1' : '0'}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-cpn-dark border border-cpn-gray/10 rounded-lg">
                <div>
                  <p className="text-cpn-white font-medium">Premium Features</p>
                  <p className="text-sm text-cpn-gray">Analytics, Leaderboards & more</p>
                </div>
                <div className="text-lg font-heading text-cpn-yellow">
                  ✓ Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Girl Modal */}
      <AddGirlModal
        isOpen={isAddGirlModalOpen}
        onClose={() => setIsAddGirlModalOpen(false)}
      />
    </div>
  );
}