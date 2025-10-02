'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  TrophyIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FireIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { useGirls, useDataEntries, useGlobalStats } from '@/lib/context';
import { formatCurrency, formatTime, formatRating } from '@/lib/calculations';
import AddGirlModal from '@/components/modals/AddGirlModal';

export default function DashboardRevertPage() {
  const { girlsWithMetrics } = useGirls();
  const { dataEntries } = useDataEntries();
  const { globalStats, isLoading } = useGlobalStats();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-fade-in">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-cpn-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cpn-gray">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate insights for performance section
  const girlsWithData = girlsWithMetrics.filter(girl => girl.totalEntries > 0);

  const bestValue = girlsWithData.sort((a, b) => a.metrics.costPerNut - b.metrics.costPerNut)[0];
  const highestInvestment = girlsWithData.sort((a, b) => b.metrics.totalSpent - a.metrics.totalSpent)[0];
  const mostTime = girlsWithData.sort((a, b) => b.metrics.totalTime - a.metrics.totalTime)[0];

  // Get recent activity (last 5 entries)
  const recentEntries = [...dataEntries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(entry => ({
      ...entry,
      girl: girlsWithMetrics.find(g => g.id === entry.girlId)
    }));

  // Calculate efficiency metrics
  const avgCostPerNut = girlsWithData.length > 0
    ? girlsWithData.reduce((sum, girl) => sum + girl.metrics.costPerNut, 0) / girlsWithData.length
    : 0;

  return (
    <div className="min-h-screen bg-cpn-dark">
      {/* Header */}
      <div className="border-b border-cpn-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-cpn-gray/10 rounded-full flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-cpn-gray" />
              </div>
              <div>
                <h1 className="text-3xl font-heading text-cpn-white">Dashboard (Original Style)</h1>
                <p className="text-cpn-gray mt-1">
                  Your performance insights and recent activity - original icon styling
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {girlsWithData.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="animate-fade-in">
              <div className="w-16 h-16 bg-cpn-gray/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChartBarIcon className="w-8 h-8 text-cpn-gray" />
              </div>
              <h3 className="text-xl font-heading text-cpn-white mb-2">
                Welcome to CPN Dashboard
              </h3>
              <p className="text-cpn-gray mb-6 max-w-md mx-auto">
                Start tracking your metrics by adding your first girl profile and data entries.
                This dashboard will show your insights and performance analytics.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-cpn inline-flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Add Your First Girl
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-8">
            {/* Hero Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Investment */}
              <div className="card-cpn bg-gradient-to-br from-cpn-dark2 to-cpn-dark">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-cpn-yellow/10 rounded-full flex items-center justify-center">
                    <CurrencyDollarIcon className="w-6 h-6 text-cpn-yellow" />
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowUpIcon className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-400">+12%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-cpn-gray mb-1">Total Investment</p>
                  <p className="text-3xl font-bold text-cpn-white mb-1">
                    {formatCurrency(globalStats.totalSpent)}
                  </p>
                  <p className="text-xs text-cpn-gray">Across {globalStats.totalGirls} profiles</p>
                </div>
              </div>

              {/* Efficiency Score */}
              <div className="card-cpn bg-gradient-to-br from-cpn-dark2 to-cpn-dark">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <TrophyIcon className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    {avgCostPerNut < 50 ? (
                      <>
                        <ArrowDownIcon className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400">Excellent</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpIcon className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-yellow-400">Average</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-cpn-gray mb-1">Avg Cost/Nut</p>
                  <p className="text-3xl font-bold text-cpn-yellow mb-1">
                    {formatCurrency(avgCostPerNut)}
                  </p>
                  <p className="text-xs text-cpn-gray">Efficiency rating</p>
                </div>
              </div>

              {/* Time Investment */}
              <div className="card-cpn bg-gradient-to-br from-cpn-dark2 to-cpn-dark">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-cpn-gray">
                      {Math.round(globalStats.totalTime / 60)} hrs
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-cpn-gray mb-1">Time Investment</p>
                  <p className="text-3xl font-bold text-cpn-white mb-1">
                    {formatTime(globalStats.totalTime)}
                  </p>
                  <p className="text-xs text-cpn-gray">
                    {formatCurrency(globalStats.totalTime > 0 ? globalStats.totalSpent / (globalStats.totalTime / 60) : 0)}/hr rate
                  </p>
                </div>
              </div>

              {/* Active Profiles */}
              <div className="card-cpn bg-gradient-to-br from-cpn-dark2 to-cpn-dark">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    <FireIcon className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-orange-400">Active</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-cpn-gray mb-1">Active Profiles</p>
                  <p className="text-3xl font-bold text-cpn-white mb-1">
                    {globalStats.activeGirls}
                  </p>
                  <p className="text-xs text-cpn-gray">
                    {globalStats.totalGirls - globalStats.activeGirls} inactive
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Insights Grid */}
            <div className="card-cpn">
              <h2 className="text-xl font-heading text-cpn-white mb-6">Performance Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Best Value */}
                <div className="bg-cpn-dark border border-green-500/20 rounded-lg p-6 hover:border-green-500/40 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                      <TrophyIcon className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-heading text-green-400">Best Value</h3>
                      <p className="text-xs text-cpn-gray">Lowest cost per nut</p>
                    </div>
                  </div>
                  {bestValue ? (
                    <div>
                      <p className="text-2xl font-bold text-cpn-white mb-2">{bestValue.name}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-cpn-gray">Cost per Nut:</span>
                          <span className="text-green-400 font-medium">
                            {formatCurrency(bestValue.metrics.costPerNut)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-cpn-gray">Total Spent:</span>
                          <span className="text-cpn-white">{formatCurrency(bestValue.metrics.totalSpent)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-cpn-gray">Total Nuts:</span>
                          <span className="text-cpn-white">{bestValue.metrics.totalNuts}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-cpn-gray">Rating:</span>
                          <span className="text-cpn-yellow">{formatRating(bestValue.rating)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-cpn-gray text-sm">No data available</p>
                  )}
                </div>

                {/* Highest Investment */}
                <div className="bg-cpn-dark border border-cpn-yellow/20 rounded-lg p-6 hover:border-cpn-yellow/40 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-cpn-yellow/10 rounded-full flex items-center justify-center">
                      <CurrencyDollarIcon className="w-6 h-6 text-cpn-yellow" />
                    </div>
                    <div>
                      <h3 className="font-heading text-cpn-yellow">Highest Investment</h3>
                      <p className="text-xs text-cpn-gray">Most money spent</p>
                    </div>
                  </div>
                  {highestInvestment ? (
                    <div>
                      <p className="text-2xl font-bold text-cpn-white mb-2">{highestInvestment.name}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-cpn-gray">Total Spent:</span>
                          <span className="text-cpn-yellow font-medium">
                            {formatCurrency(highestInvestment.metrics.totalSpent)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-cpn-gray">Cost per Nut:</span>
                          <span className="text-cpn-white">{formatCurrency(highestInvestment.metrics.costPerNut)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-cpn-gray">Total Nuts:</span>
                          <span className="text-cpn-white">{highestInvestment.metrics.totalNuts}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-cpn-gray">Rating:</span>
                          <span className="text-cpn-yellow">{formatRating(highestInvestment.rating)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-cpn-gray text-sm">No data available</p>
                  )}
                </div>

                {/* Most Time */}
                <div className="bg-cpn-dark border border-blue-500/20 rounded-lg p-6 hover:border-blue-500/40 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <ClockIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-heading text-blue-400">Most Time</h3>
                      <p className="text-xs text-cpn-gray">Highest time investment</p>
                    </div>
                  </div>
                  {mostTime ? (
                    <div>
                      <p className="text-2xl font-bold text-cpn-white mb-2">{mostTime.name}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-cpn-gray">Total Time:</span>
                          <span className="text-blue-400 font-medium">
                            {formatTime(mostTime.metrics.totalTime)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-cpn-gray">Time per Nut:</span>
                          <span className="text-cpn-white">{formatTime(mostTime.metrics.timePerNut)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-cpn-gray">Cost per Hour:</span>
                          <span className="text-cpn-white">{formatCurrency(mostTime.metrics.costPerHour)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-cpn-gray">Rating:</span>
                          <span className="text-cpn-yellow">{formatRating(mostTime.rating)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-cpn-gray text-sm">No data available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity Stream */}
            <div className="card-cpn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading text-cpn-white">Recent Activity</h2>
                <Link
                  href="/overview"
                  className="text-sm text-cpn-gray hover:text-cpn-yellow transition-colors"
                >
                  View all entries →
                </Link>
              </div>

              {recentEntries.length > 0 ? (
                <div className="space-y-4">
                  {recentEntries.map((entry, index) => (
                    <div key={entry.id} className="flex items-center gap-4 p-4 bg-cpn-dark2/50 rounded-lg hover:bg-cpn-dark2 transition-colors">
                      {/* Timeline dot */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-cpn-yellow' : 'bg-cpn-gray'}`}></div>
                        {index < recentEntries.length - 1 && (
                          <div className="absolute top-3 left-1.5 w-px h-8 bg-cpn-gray/20"></div>
                        )}
                      </div>

                      {/* Entry details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-heading text-cpn-white">
                              {entry.girl?.name || 'Unknown Girl'}
                            </p>
                            <p className="text-xs text-cpn-gray">
                              {new Date(entry.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <Link
                            href={`/girls/${entry.girlId}/add-data`}
                            className="p-2 text-cpn-gray hover:text-cpn-yellow transition-colors"
                            title="Add more data"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-cpn-gray">Spent</p>
                            <p className="text-cpn-yellow font-medium">{formatCurrency(entry.amountSpent)}</p>
                          </div>
                          <div>
                            <p className="text-cpn-gray">Nuts</p>
                            <p className="text-cpn-white font-medium">{entry.numberOfNuts}</p>
                          </div>
                          <div>
                            <p className="text-cpn-gray">Time</p>
                            <p className="text-cpn-white font-medium">{formatTime(entry.durationMinutes)}</p>
                          </div>
                          <div>
                            <p className="text-cpn-gray">Cost/Nut</p>
                            <p className="text-cpn-white font-medium">
                              {formatCurrency(entry.numberOfNuts > 0 ? entry.amountSpent / entry.numberOfNuts : 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-cpn-gray/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalendarIcon className="w-6 h-6 text-cpn-gray" />
                  </div>
                  <p className="text-cpn-gray text-sm">No recent activity</p>
                  <p className="text-cpn-gray text-xs mt-1">Add some data entries to see your activity here</p>
                </div>
              )}
            </div>

            {/* Efficiency Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Comparison */}
              <div className="card-cpn">
                <h3 className="text-lg font-heading text-cpn-white mb-4">Performance Comparison</h3>
                <div className="space-y-4">
                  {/* Average vs Best */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-cpn-gray">Your Average</span>
                      <span className="text-cpn-white font-medium">{formatCurrency(avgCostPerNut)}</span>
                    </div>
                    <div className="w-full bg-cpn-gray/20 rounded-full h-2">
                      <div
                        className="bg-cpn-yellow h-2 rounded-full transition-all duration-300"
                        style={{ width: '60%' }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-cpn-gray">Best Performer</span>
                      <span className="text-green-400 font-medium">
                        {bestValue ? formatCurrency(bestValue.metrics.costPerNut) : 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-cpn-gray/20 rounded-full h-2">
                      <div
                        className="bg-green-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: bestValue ? `${Math.min((avgCostPerNut / bestValue.metrics.costPerNut) * 30, 100)}%` : '0%' }}
                      ></div>
                    </div>
                  </div>

                  {/* Efficiency Score */}
                  <div className="mt-6 p-4 bg-cpn-dark border border-cpn-yellow/20 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-cpn-gray mb-1">Overall Efficiency</p>
                      <p className="text-2xl font-bold text-cpn-yellow mb-1">
                        {avgCostPerNut < 30 ? 'A+' : avgCostPerNut < 50 ? 'A' : avgCostPerNut < 75 ? 'B+' : avgCostPerNut < 100 ? 'B' : 'C'}
                      </p>
                      <p className="text-xs text-cpn-gray">
                        {avgCostPerNut < 50 ? 'Excellent value' : avgCostPerNut < 100 ? 'Good efficiency' : 'Room for improvement'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment Distribution */}
              <div className="card-cpn">
                <h3 className="text-lg font-heading text-cpn-white mb-4">Investment Distribution</h3>
                <div className="space-y-4">
                  {girlsWithData.slice(0, 5).map((girl, index) => {
                    const percentage = globalStats.totalSpent > 0 ? (girl.metrics.totalSpent / globalStats.totalSpent) * 100 : 0;
                    return (
                      <div key={girl.id} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8">
                          <span className="text-sm text-cpn-gray">#{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-cpn-white truncate">{girl.name}</span>
                            <span className="text-xs text-cpn-gray ml-2">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-cpn-gray/20 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-500 ${
                                index === 0 ? 'bg-cpn-yellow' :
                                index === 1 ? 'bg-green-400' :
                                index === 2 ? 'bg-blue-400' : 'bg-cpn-gray'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {girlsWithData.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-cpn-gray text-sm">No investment data available</p>
                    </div>
                  )}

                  {girlsWithData.length > 5 && (
                    <div className="text-center pt-2">
                      <Link
                        href="/analytics"
                        className="text-xs text-cpn-gray hover:text-cpn-yellow transition-colors"
                      >
                        +{girlsWithData.length - 5} more in analytics →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Hub */}
            <div className="card-cpn">
              <h2 className="text-xl font-heading text-cpn-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Add New Data Entry */}
                <Link
                  href="/data-entry"
                  className="p-6 bg-gradient-to-br from-cpn-yellow/10 to-cpn-yellow/5 border border-cpn-yellow/20 rounded-lg hover:border-cpn-yellow/40 transition-all duration-200 hover:scale-105 group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-cpn-yellow/10 rounded-full flex items-center justify-center mb-3">
                      <PlusIcon className="w-6 h-6 text-cpn-yellow" />
                    </div>
                    <h3 className="font-heading text-cpn-white mb-1">Add Data</h3>
                    <p className="text-xs text-cpn-gray">Log new activity</p>
                  </div>
                </Link>

                {/* Add New Girl */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg hover:border-green-500/40 transition-all duration-200 hover:scale-105 group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-3">
                      <UserGroupIcon className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="font-heading text-cpn-white mb-1">Add Girl</h3>
                    <p className="text-xs text-cpn-gray">Create new profile</p>
                  </div>
                </button>

                {/* View Analytics */}
                <Link
                  href="/analytics"
                  className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-lg hover:border-blue-500/40 transition-all duration-200 hover:scale-105 group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-3">
                      <ChartBarIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="font-heading text-cpn-white mb-1">Analytics</h3>
                    <p className="text-xs text-cpn-gray">Deep dive insights</p>
                  </div>
                </Link>

                {/* View Overview */}
                <Link
                  href="/overview"
                  className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-lg hover:border-purple-500/40 transition-all duration-200 hover:scale-105 group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-3">
                      <PlayIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="font-heading text-cpn-white mb-1">Overview</h3>
                    <p className="text-xs text-cpn-gray">All data table</p>
                  </div>
                </Link>
              </div>

              {/* Quick Stats Summary */}
              {girlsWithData.length > 0 && (
                <div className="mt-6 pt-6 border-t border-cpn-gray/20">
                  <div className="flex flex-wrap items-center justify-center gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold text-cpn-yellow">{globalStats.totalNuts}</p>
                      <p className="text-xs text-cpn-gray">Total Nuts</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-cpn-white">{dataEntries.length}</p>
                      <p className="text-xs text-cpn-gray">Total Entries</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-cpn-white">{Math.round(globalStats.totalTime / 60)}</p>
                      <p className="text-xs text-cpn-gray">Hours Logged</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-cpn-yellow">
                        {globalStats.totalNuts > 0 ? Math.round(globalStats.totalTime / globalStats.totalNuts) : 0}
                      </p>
                      <p className="text-xs text-cpn-gray">Avg Minutes/Nut</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Goals & Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Progress */}
              <div className="card-cpn">
                <h3 className="text-lg font-heading text-cpn-white mb-4">Monthly Progress</h3>
                <div className="space-y-4">
                  {/* This Month Stats */}
                  <div className="p-4 bg-cpn-dark border border-cpn-yellow/20 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-cpn-white">December 2024</span>
                      <span className="text-xs text-cpn-gray">
                        {new Date().getDate()}/{new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()} days
                      </span>
                    </div>

                    {/* Progress bars for different metrics */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-cpn-gray">Entries Goal</span>
                          <span className="text-cpn-white">{Math.min(dataEntries.length, 30)}/30</span>
                        </div>
                        <div className="w-full bg-cpn-gray/20 rounded-full h-2">
                          <div
                            className="bg-cpn-yellow h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((dataEntries.length / 30) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-cpn-gray">Efficiency Target</span>
                          <span className="text-cpn-white">
                            {avgCostPerNut < 50 ? '🎯' : avgCostPerNut < 100 ? '📈' : '💪'}
                          </span>
                        </div>
                        <div className="w-full bg-cpn-gray/20 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              avgCostPerNut < 50 ? 'bg-green-400' : avgCostPerNut < 100 ? 'bg-cpn-yellow' : 'bg-red-400'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(10, 100 - (avgCostPerNut / 2)))}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Streak Counter */}
                  <div className="text-center p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-lg border border-orange-500/20">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <FireIcon className="w-5 h-5 text-orange-400" />
                      <span className="text-lg font-bold text-orange-400">7</span>
                      <span className="text-sm text-cpn-gray">day streak</span>
                    </div>
                    <p className="text-xs text-cpn-gray">Keep logging data to maintain your streak!</p>
                  </div>
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="card-cpn">
                <h3 className="text-lg font-heading text-cpn-white mb-4">Achievement Badges</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* First Entry Badge */}
                  <div className={`p-4 rounded-lg border text-center transition-all ${
                    dataEntries.length > 0
                      ? 'border-cpn-yellow/40 bg-cpn-yellow/10'
                      : 'border-cpn-gray/20 bg-cpn-gray/5'
                  }`}>
                    <div className="text-2xl mb-2">
                      {dataEntries.length > 0 ? '🎯' : '⚪'}
                    </div>
                    <p className="text-xs font-medium text-cpn-white mb-1">First Entry</p>
                    <p className="text-xs text-cpn-gray">Log your first data</p>
                  </div>

                  {/* Efficiency Master Badge */}
                  <div className={`p-4 rounded-lg border text-center transition-all ${
                    avgCostPerNut > 0 && avgCostPerNut < 30
                      ? 'border-green-500/40 bg-green-500/10'
                      : 'border-cpn-gray/20 bg-cpn-gray/5'
                  }`}>
                    <div className="text-2xl mb-2">
                      {avgCostPerNut > 0 && avgCostPerNut < 30 ? '🏆' : '⚪'}
                    </div>
                    <p className="text-xs font-medium text-cpn-white mb-1">Efficiency Master</p>
                    <p className="text-xs text-cpn-gray">Sub $30/nut average</p>
                  </div>

                  {/* Data Collector Badge */}
                  <div className={`p-4 rounded-lg border text-center transition-all ${
                    dataEntries.length >= 10
                      ? 'border-blue-500/40 bg-blue-500/10'
                      : 'border-cpn-gray/20 bg-cpn-gray/5'
                  }`}>
                    <div className="text-2xl mb-2">
                      {dataEntries.length >= 10 ? '📊' : '⚪'}
                    </div>
                    <p className="text-xs font-medium text-cpn-white mb-1">Data Collector</p>
                    <p className="text-xs text-cpn-gray">{dataEntries.length}/10 entries</p>
                  </div>

                  {/* High Roller Badge */}
                  <div className={`p-4 rounded-lg border text-center transition-all ${
                    globalStats.totalSpent >= 1000
                      ? 'border-purple-500/40 bg-purple-500/10'
                      : 'border-cpn-gray/20 bg-cpn-gray/5'
                  }`}>
                    <div className="text-2xl mb-2">
                      {globalStats.totalSpent >= 1000 ? '💎' : '⚪'}
                    </div>
                    <p className="text-xs font-medium text-cpn-white mb-1">High Roller</p>
                    <p className="text-xs text-cpn-gray">$1000+ invested</p>
                  </div>
                </div>

                {/* Next Achievement */}
                <div className="mt-4 p-3 bg-cpn-dark border border-dashed border-cpn-gray/30 rounded-lg text-center">
                  <p className="text-sm text-cpn-gray mb-1">Next Achievement:</p>
                  <p className="text-xs text-cpn-white font-medium">
                    {dataEntries.length < 10 ? `Data Collector (${10 - dataEntries.length} more entries)` :
                     avgCostPerNut > 30 || avgCostPerNut === 0 ? 'Efficiency Master (get under $30/nut)' :
                     globalStats.totalSpent < 1000 ? `High Roller ($${(1000 - globalStats.totalSpent).toFixed(0)} more to invest)` :
                     'Analytics Explorer (view analytics page)'
                    }
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Add Girl Modal */}
      <AddGirlModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}