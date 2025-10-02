'use client';

import React, { useState, useEffect } from 'react';
import {
  GlobeAltIcon,
  FunnelIcon,
  SparklesIcon,
  TrophyIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useGirls } from '@/lib/context';
import { formatCurrency } from '@/lib/calculations';
import { EthnicityOption, HairColorOption, DemographicStats } from '@/lib/types';
import PaywallModal from '@/components/modals/PaywallModal';

type FilterState = {
  ethnicity: EthnicityOption | 'All';
  hairColor: HairColorOption | 'All';
  ratingRange: string;
  location: string;
};

export default function ExamplePageModal() {
  const { girls } = useGirls();
  const [filters, setFilters] = useState<FilterState>({
    ethnicity: 'All',
    hairColor: 'All', 
    ratingRange: 'All',
    location: 'All'
  });
  const [globalStats, setGlobalStats] = useState<DemographicStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // PaywallModal state - always show for boyfriend mode users
  const [showPaywall] = useState(true);

  useEffect(() => {
    // Fetch global demographic statistics from API
    const loadGlobalStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/global-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch global statistics');
        }
        
        const stats: DemographicStats = await response.json();
        setGlobalStats(stats);
      } catch (err) {
        console.error('Error loading global stats:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadGlobalStats();
  }, []);

  const getFilteredData = () => {
    if (!globalStats) return null;

    let data = globalStats;
    
    // Apply filters to get relevant subset of data
    if (filters.ethnicity !== 'All') {
      const ethnicityData = data.ethnicity[filters.ethnicity];
      if (ethnicityData) {
        return {
          totalUsers: ethnicityData.userCount,
          avgCostPerNut: ethnicityData.averageCostPerNut,
          totalSpending: ethnicityData.totalSpending,
          avgRating: ethnicityData.averageRating
        };
      }
    }

    if (filters.hairColor !== 'All') {
      const hairData = data.hairColor[filters.hairColor];
      if (hairData) {
        return {
          totalUsers: hairData.userCount,
          avgCostPerNut: hairData.averageCostPerNut,
          totalSpending: hairData.totalSpending,
          avgRating: hairData.averageRating
        };
      }
    }

    // Return global aggregated data when no specific filters
    const totalUsers = Object.values(data.ethnicity).reduce((sum, item) => sum + item.userCount, 0);
    const totalSpending = Object.values(data.ethnicity).reduce((sum, item) => sum + item.totalSpending, 0);
    const avgCostPerNut = totalSpending / Object.values(data.ethnicity).reduce((sum, item) => sum + (item.totalSpending / item.averageCostPerNut), 0);
    const avgRating = Object.values(data.ethnicity).reduce((sum, item) => sum + (item.averageRating * item.userCount), 0) / totalUsers;

    return {
      totalUsers,
      avgCostPerNut,
      totalSpending,
      avgRating
    };
  };

  const getUserInsights = () => {
    if (girls.length === 0) return null;

    // Calculate user's preferences from their data
    const userEthnicityCount: Record<string, number> = {};
    const userHairColorCount: Record<string, number> = {};
    let userTotalSpent = 0;
    let userTotalRating = 0;

    girls.forEach(girl => {
      if (girl.ethnicity) {
        userEthnicityCount[girl.ethnicity] = (userEthnicityCount[girl.ethnicity] || 0) + 1;
      }
      if (girl.hairColor) {
        userHairColorCount[girl.hairColor] = (userHairColorCount[girl.hairColor] || 0) + 1;
      }
      userTotalRating += girl.rating;
    });

    const userFavoriteEthnicity = Object.entries(userEthnicityCount).sort(([,a], [,b]) => b - a)[0]?.[0] as EthnicityOption;
    const userFavoriteHairColor = Object.entries(userHairColorCount).sort(([,a], [,b]) => b - a)[0]?.[0] as HairColorOption;
    const userAvgRating = userTotalRating / girls.length;

    return {
      favoriteEthnicity: userFavoriteEthnicity,
      favoriteHairColor: userFavoriteHairColor,
      avgRating: userAvgRating
    };
  };

  const filteredData = getFilteredData();
  const userInsights = getUserInsights();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cpn-dark flex items-center justify-center">
        <div className="animate-fade-in text-center">
          <div className="w-8 h-8 border-2 border-cpn-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cpn-gray">Loading global data vault...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cpn-dark flex items-center justify-center">
        <div className="animate-fade-in text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-heading text-cpn-white mb-2">Unable to Load Data</h2>
          <p className="text-cpn-gray mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-cpn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cpn-dark">
      {/* Main content with blur effect when paywall is shown */}
      <div className={`${showPaywall ? 'blur-sm pointer-events-none' : ''} transition-all duration-300`}>
        {/* Header */}
        <div className="border-b border-cpn-gray/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <GlobeAltIcon className="w-8 h-8 text-cpn-yellow" />
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-heading text-cpn-white">Data Vault</h1>
                      <span className="px-3 py-1 bg-cpn-yellow/20 text-cpn-yellow border border-cpn-yellow/30 rounded-full text-sm font-medium">
                        Beta Launch
                      </span>
                    </div>
                    <p className="text-cpn-gray mt-1">
                      Global insights and demographic trends from {filteredData?.totalUsers.toLocaleString()} anonymous users
                      {filteredData?.totalUsers === 0 && (
                        <span className="block text-sm mt-1 text-cpn-yellow/80">
                          🚀 Data will grow as users join the platform
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fade-in space-y-8">
            {/* Filters Section */}
            <div className="card-cpn bg-gradient-to-br from-cpn-dark2 to-cpn-dark">
              <div className="flex items-center gap-3 mb-6">
                <FunnelIcon className="w-6 h-6 text-cpn-yellow" />
                <h2 className="text-xl font-heading text-cpn-white">Demographic Filters</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cpn-white mb-2">
                    Ethnicity
                  </label>
                  <select
                    value={filters.ethnicity}
                    onChange={(e) => setFilters(prev => ({...prev, ethnicity: e.target.value as EthnicityOption | 'All'}))}
                    className="input-cpn"
                  >
                    <option value="All">All Ethnicities</option>
                    <option value="Asian">Asian</option>
                    <option value="Black">Black</option>
                    <option value="Latina">Latina</option>
                    <option value="White">White</option>
                    <option value="Middle Eastern">Middle Eastern</option>
                    <option value="Indian">Indian</option>
                    <option value="Mixed">Mixed</option>
                    <option value="Native American">Native American</option>
                    <option value="Pacific Islander">Pacific Islander</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cpn-white mb-2">
                    Hair Color
                  </label>
                  <select
                    value={filters.hairColor}
                    onChange={(e) => setFilters(prev => ({...prev, hairColor: e.target.value as HairColorOption | 'All'}))}
                    className="input-cpn"
                  >
                    <option value="All">All Hair Colors</option>
                    <option value="Blonde">Blonde</option>
                    <option value="Brunette">Brunette</option>
                    <option value="Black">Black</option>
                    <option value="Red">Red</option>
                    <option value="Auburn">Auburn</option>
                    <option value="Gray/Silver">Gray/Silver</option>
                    <option value="Dyed/Colorful">Dyed/Colorful</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cpn-white mb-2">
                    Rating Range
                  </label>
                  <select
                    value={filters.ratingRange}
                    onChange={(e) => setFilters(prev => ({...prev, ratingRange: e.target.value}))}
                    className="input-cpn"
                  >
                    <option value="All">All Ratings</option>
                    <option value="5.0-6.0">5.0-6.0 ⭐</option>
                    <option value="6.0-7.0">6.0-7.0 ⭐</option>
                    <option value="7.0-8.0">7.0-8.0 ⭐</option>
                    <option value="8.0-9.0">8.0-9.0 ⭐</option>
                    <option value="9.0-10.0">9.0-10.0 ⭐</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cpn-white mb-2">
                    Location
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({...prev, location: e.target.value}))}
                    className="input-cpn"
                  >
                    <option value="All">All Locations</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Global Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card-cpn">
                <div className="flex items-center gap-3 mb-4">
                  <UserGroupIcon className="w-6 h-6 text-cpn-yellow" />
                  <h3 className="text-lg font-heading text-cpn-white">Total Users</h3>
                </div>
                <p className="text-3xl font-bold text-cpn-white">
                  {filteredData?.totalUsers.toLocaleString()}
                </p>
                <p className="text-sm text-cpn-gray mt-1">
                  Anonymous users globally
                </p>
              </div>

              <div className="card-cpn">
                <div className="flex items-center gap-3 mb-4">
                  <TrophyIcon className="w-6 h-6 text-cpn-yellow" />
                  <h3 className="text-lg font-heading text-cpn-white">Avg Cost/Nut</h3>
                </div>
                <p className="text-3xl font-bold text-cpn-white">
                  {formatCurrency(filteredData?.avgCostPerNut || 0)}
                </p>
                <p className="text-sm text-cpn-gray mt-1">
                  Global average
                </p>
              </div>

              <div className="card-cpn">
                <div className="flex items-center gap-3 mb-4">
                  <SparklesIcon className="w-6 h-6 text-cpn-yellow" />
                  <h3 className="text-lg font-heading text-cpn-white">Total Spending</h3>
                </div>
                <p className="text-3xl font-bold text-cpn-white">
                  {formatCurrency(filteredData?.totalSpending || 0)}
                </p>
                <p className="text-sm text-cpn-gray mt-1">
                  Across all users
                </p>
              </div>

              <div className="card-cpn">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <span className="text-cpn-yellow">⭐</span>
                  </div>
                  <h3 className="text-lg font-heading text-cpn-white">Avg Rating</h3>
                </div>
                <p className="text-3xl font-bold text-cpn-white">
                  {filteredData?.avgRating.toFixed(1)}
                </p>
                <p className="text-sm text-cpn-gray mt-1">
                  Global average
                </p>
              </div>
            </div>

            {/* Personal Insights */}
            {userInsights && (
              <div className="card-cpn">
                <div className="flex items-center gap-3 mb-6">
                  <SparklesIcon className="w-6 h-6 text-cpn-yellow" />
                  <h2 className="text-xl font-heading text-cpn-white">Your Insights</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {userInsights.favoriteEthnicity && globalStats && (
                    <div className="bg-cpn-dark2/50 rounded-lg p-4">
                      <h4 className="text-cpn-yellow font-medium mb-2">Ethnicity Preference</h4>
                      <p className="text-cpn-white mb-1">
                        Your favorite: <span className="text-cpn-yellow">{userInsights.favoriteEthnicity}</span>
                      </p>
                      <p className="text-sm text-cpn-gray">
                        Global avg cost: {formatCurrency(globalStats.ethnicity[userInsights.favoriteEthnicity].averageCostPerNut)}
                      </p>
                      <p className="text-xs text-cpn-gray mt-2">
                        {globalStats.ethnicity[userInsights.favoriteEthnicity].userCount.toLocaleString()} users globally
                      </p>
                    </div>
                  )}

                  {userInsights.favoriteHairColor && globalStats && (
                    <div className="bg-cpn-dark2/50 rounded-lg p-4">
                      <h4 className="text-cpn-yellow font-medium mb-2">Hair Color Preference</h4>
                      <p className="text-cpn-white mb-1">
                        Your favorite: <span className="text-cpn-yellow">{userInsights.favoriteHairColor}</span>
                      </p>
                      <p className="text-sm text-cpn-gray">
                        Global avg cost: {formatCurrency(globalStats.hairColor[userInsights.favoriteHairColor].averageCostPerNut)}
                      </p>
                      <p className="text-xs text-cpn-gray mt-2">
                        {globalStats.hairColor[userInsights.favoriteHairColor].userCount.toLocaleString()} users globally
                      </p>
                    </div>
                  )}

                  <div className="bg-cpn-dark2/50 rounded-lg p-4">
                    <h4 className="text-cpn-yellow font-medium mb-2">Rating Preference</h4>
                    <p className="text-cpn-white mb-1">
                      Your average: <span className="text-cpn-yellow">{userInsights.avgRating.toFixed(1)} ⭐</span>
                    </p>
                    <p className="text-sm text-cpn-gray">
                      Global average: {filteredData?.avgRating.toFixed(1)} ⭐
                    </p>
                    <p className="text-xs text-cpn-gray mt-2">
                      {userInsights.avgRating > (filteredData?.avgRating || 0) ? 
                        'You prefer higher-rated girls' : 
                        'You\'re less picky than average'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paywall Modal Overlay */}
      <PaywallModal
        isOpen={showPaywall}
        title="Data Vault"
        description="Advanced demographic insights and global statistics are only available in Player Mode"
      />
    </div>
  );
}