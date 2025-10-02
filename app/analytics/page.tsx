'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import { useGirls, useDataEntries, useGlobalStats } from '@/lib/context';
import {
  formatCurrency,
  formatTime,
  getMonthlyTrends,
  getCostEfficiencyTrends,
  getSpendingDistribution,
  getEfficiencyRatingCorrelation,
  getROIRanking,
  getEnhancedGlobalStats
} from '@/lib/calculations';
import { AnalyticsShareButton } from '@/components/sharing/ShareButton';
import { getGirlColors, getColorByGirlName } from '@/lib/colors';

type TimeRange = '7' | '30' | '90' | 'all';

export default function AnalyticsPage() {
  const { girlsWithMetrics } = useGirls();
  const { dataEntries } = useDataEntries();
  const { globalStats, isLoading } = useGlobalStats();
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  const getFilteredEntries = () => {
    if (timeRange === 'all') return dataEntries;
    
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return dataEntries.filter(entry => new Date(entry.date) >= cutoffDate);
  };

  const filteredEntries = getFilteredEntries();
  const monthlyTrends = getMonthlyTrends(filteredEntries);

  // Get active girls with data
  const activeGirls = girlsWithMetrics.filter(girl => girl.totalEntries > 0 && (girl.isActive ?? true));
  
  // Debug logging
  console.log('All girls with metrics:', girlsWithMetrics.map(g => ({ name: g.name, isActive: g.isActive, totalEntries: g.totalEntries })));
  console.log('Filtered active girls:', activeGirls.map(g => ({ name: g.name, isActive: g.isActive, totalEntries: g.totalEntries })));

  // Get consistent colors for all girls
  const girlColorMap = getGirlColors(activeGirls.map(girl => girl.id));

  // New data for enhanced charts
  const costEfficiencyTrends = getCostEfficiencyTrends(filteredEntries);
  const spendingDistribution = getSpendingDistribution(activeGirls);
  const efficiencyRatingData = getEfficiencyRatingCorrelation(activeGirls);
  const roiRanking = getROIRanking(activeGirls);
  const enhancedStats = getEnhancedGlobalStats(girlsWithMetrics, dataEntries, filteredEntries);

  // Data for Total Spent per Girl chart - maintain chronological order
  const spentPerGirlData = activeGirls
    .map(girl => ({
      name: girl.name,
      amount: girl.metrics.totalSpent,
      nuts: girl.metrics.totalNuts,
      color: girlColorMap[girl.id]
    }));

  // Data for Cost per Nut comparison - maintain chronological order
  const costPerNutData = activeGirls
    .map(girl => ({
      name: girl.name,
      costPerNut: girl.metrics.costPerNut,
      rating: girl.rating,
      color: girlColorMap[girl.id]
    }));

  // Data for Time spent per girl - maintain chronological order
  const timePerGirlData = activeGirls
    .map(girl => ({
      name: girl.name,
      time: girl.metrics.totalTime,
      timeFormatted: formatTime(girl.metrics.totalTime),
      color: girlColorMap[girl.id]
    }));

  // Data for Total Nuts per Girl chart
  const nutsPerGirlData = activeGirls
    .map(girl => ({
      name: girl.name,
      nuts: girl.metrics.totalNuts,
      color: girlColorMap[girl.id]
    }));

  // Data for Average Time per Nut comparison
  const avgTimePerNutData = activeGirls
    .map(girl => ({
      name: girl.name,
      avgTimePerNut: girl.metrics.totalNuts > 0 ? girl.metrics.totalTime / girl.metrics.totalNuts : 0,
      color: girlColorMap[girl.id]
    }));

  // Data for Average Cost per Hour per Girl
  const avgCostPerHourData = activeGirls
    .map(girl => ({
      name: girl.name,
      costPerHour: girl.metrics.totalTime > 0 ? girl.metrics.totalSpent / (girl.metrics.totalTime / 60) : 0,
      color: girlColorMap[girl.id]
    }));

  // Data for Time Distribution pie chart
  const timeDistribution = activeGirls.map(girl => ({
    name: girl.name,
    value: girl.metrics.totalTime,
    percentage: globalStats.totalTime > 0 ? (girl.metrics.totalTime / globalStats.totalTime) * 100 : 0
  }));

  // Data for Cost per Hour Distribution pie chart
  const costPerHourDistribution = activeGirls.map(girl => ({
    name: girl.name,
    value: girl.metrics.totalTime > 0 ? girl.metrics.totalSpent / (girl.metrics.totalTime / 60) : 0,
    percentage: 0 // Will calculate based on total cost per hour
  }));

  // Calculate percentages for cost per hour distribution
  const totalCostPerHour = costPerHourDistribution.reduce((sum, item) => sum + item.value, 0);
  costPerHourDistribution.forEach(item => {
    item.percentage = totalCostPerHour > 0 ? (item.value / totalCostPerHour) * 100 : 0;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cpn-dark border border-cpn-gray/20 rounded-lg p-3 shadow-lg">
          <p className="text-cpn-white font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {
                entry.name.includes('amount') || entry.name.includes('cost') || entry.name.includes('Cost')
                  ? formatCurrency(entry.value)
                  : entry.name.includes('time') || entry.name.includes('Time')
                  ? formatTime(entry.value)
                  : entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-fade-in">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-cpn-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cpn-gray">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cpn-dark">
      {/* Header */}
      <div className="border-b border-cpn-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-heading text-cpn-white">Analytics</h1>
              <p className="text-cpn-gray mt-1">
                Insights and trends across all your data
              </p>
            </div>
            <div className="flex items-center gap-4">
              <AnalyticsShareButton 
                data={{ globalStats, timeRange, filteredEntries }} 
                className="mr-2"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-cpn-gray">Time Range:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                  className="bg-cpn-dark border border-cpn-gray/30 text-cpn-white px-3 py-1 rounded-lg text-sm"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {girlsWithMetrics.length === 0 || filteredEntries.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="animate-fade-in">
              <div className="w-16 h-16 bg-cpn-gray/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-heading text-cpn-white mb-2">
                No data to analyze yet
              </h3>
              <p className="text-cpn-gray mb-6 max-w-md mx-auto">
                Add some data entries to start seeing analytics and insights.
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-8">
            {/* Analytics Reports Top Area - Metrics Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-cpn-dark2 border border-cpn-gray/20 rounded-lg p-4">
                <h3 className="text-base text-cpn-white font-heading mb-2">Total Spent</h3>
                <p className="text-xl font-bold text-cpn-white">
                  {formatCurrency(globalStats.totalSpent)}
                </p>
              </div>

              <div className="bg-cpn-dark2 border border-cpn-gray/20 rounded-lg p-4">
                <h3 className="text-base text-cpn-white font-heading mb-2">Total Nuts</h3>
                <p className="text-xl font-bold text-cpn-white">
                  {globalStats.totalNuts}
                </p>
              </div>

              <div className="bg-cpn-dark2 border border-cpn-gray/20 rounded-lg p-4">
                <h3 className="text-base text-cpn-white font-heading mb-2">Active Profiles</h3>
                <p className="text-xl font-bold text-cpn-white">
                  {enhancedStats.activeProfilesInRange}
                </p>
                <p className="text-xs text-cpn-gray mt-1">
                  of {globalStats.totalGirls} total
                </p>
              </div>

              <div className="bg-cpn-dark2 border border-cpn-gray/20 rounded-lg p-4">
                <h3 className="text-base text-cpn-white font-heading mb-2">Average Cost Per Nut</h3>
                <p className="text-xl font-bold text-cpn-white">
                  {formatCurrency(globalStats.totalNuts > 0 ? globalStats.totalSpent / globalStats.totalNuts : 0)}
                </p>
              </div>

              <div className="bg-cpn-dark2 border border-cpn-gray/20 rounded-lg p-4">
                <h3 className="text-base text-cpn-white font-heading mb-2">Total Time</h3>
                <p className="text-xl font-bold text-cpn-white">
                  {formatTime(globalStats.totalTime)}
                </p>
              </div>

              <div className="bg-cpn-dark2 border border-cpn-gray/20 rounded-lg p-4">
                <h3 className="text-base text-cpn-white font-heading mb-2">Average Time Per Nut</h3>
                <p className="text-xl font-bold text-cpn-white">
                  {globalStats.totalNuts > 0 ? Math.round(globalStats.totalTime / globalStats.totalNuts) : 0} mins
                </p>
              </div>

              <div className="bg-cpn-dark2 border border-cpn-gray/20 rounded-lg p-4">
                <h3 className="text-base text-cpn-white font-heading mb-2">Average Cost Per Hour</h3>
                <p className="text-xl font-bold text-cpn-white">
                  {globalStats.totalTime > 0 ? formatCurrency(globalStats.totalSpent / (globalStats.totalTime / 60)) : formatCurrency(0)}
                </p>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="card-cpn">
              <h3 className="text-lg font-heading text-cpn-white mb-4">
                Performance Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border border-cpn-gray/10 rounded-lg">
                  <div className="text-2xl mb-2">🏆</div>
                  <p className="text-sm text-cpn-gray mb-1">Best Cost/Nut</p>
                  <p className="font-heading text-cpn-yellow">
                    {costPerNutData[costPerNutData.length - 1]?.name || 'N/A'}
                  </p>
                  <p className="text-xs text-cpn-gray">
                    {costPerNutData[costPerNutData.length - 1]
                      ? formatCurrency(costPerNutData[costPerNutData.length - 1].costPerNut)
                      : 'No data'
                    }
                  </p>
                </div>
                <div className="text-center p-4 border border-cpn-gray/10 rounded-lg">
                  <div className="text-2xl mb-2">💸</div>
                  <p className="text-sm text-cpn-gray mb-1">Highest Spender</p>
                  <p className="font-heading text-cpn-yellow">
                    {spentPerGirlData[0]?.name || 'N/A'}
                  </p>
                  <p className="text-xs text-cpn-gray">
                    {spentPerGirlData[0]
                      ? formatCurrency(spentPerGirlData[0].amount)
                      : 'No data'
                    }
                  </p>
                </div>
                <div className="text-center p-4 border border-cpn-gray/10 rounded-lg">
                  <div className="text-2xl mb-2">⏰</div>
                  <p className="text-sm text-cpn-gray mb-1">Most Time Spent</p>
                  <p className="font-heading text-cpn-yellow">
                    {timePerGirlData[0]?.name || 'N/A'}
                  </p>
                  <p className="text-xs text-cpn-gray">
                    {timePerGirlData[0]
                      ? formatTime(timePerGirlData[0].time)
                      : 'No data'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Color Legend */}
            {activeGirls.length > 1 && (
              <div className="card-cpn">
                <h3 className="text-lg font-heading text-cpn-white mb-4">
                  Color Legend
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {activeGirls.map(girl => (
                    <div key={girl.id} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: girlColorMap[girl.id] }}
                      ></div>
                      <span className="text-sm text-cpn-white truncate">{girl.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-cpn-gray mt-3">
                  Each girl maintains the same color across all charts for easy identification
                </p>
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Total Spent per Girl */}
              <div className="card-cpn">
                <h3 className="text-lg font-heading text-cpn-white mb-4">
                  Total Spent per Girl
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spentPerGirlData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--cpn-gray) / 0.2)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#ababab' }}
                        axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                      />
                      <YAxis
                        tick={{ fill: '#ababab' }}
                        axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar
                        dataKey="amount"
                        radius={[4, 4, 0, 0]}
                      >
                        {spentPerGirlData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cost per Nut Comparison */}
              <div className="card-cpn">
                <h3 className="text-lg font-heading text-cpn-white mb-4">
                  Cost per Nut Comparison
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costPerNutData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--cpn-gray) / 0.2)" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#ababab' }}
                        axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                      />
                      <YAxis 
                        tick={{ fill: '#ababab' }}
                        axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar
                        dataKey="costPerNut"
                        radius={[4, 4, 0, 0]}
                      >
                        {costPerNutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Time Spent per Girl */}
              <div className="card-cpn">
                <h3 className="text-lg font-heading text-cpn-white mb-4">
                  Time Spent per Girl
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timePerGirlData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--cpn-gray) / 0.2)" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#ababab' }}
                        axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                      />
                      <YAxis 
                        tick={{ fill: '#ababab' }}
                        axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                        tickFormatter={(value) => `${Math.round(value / 60)}h`}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar
                        dataKey="time"
                        radius={[4, 4, 0, 0]}
                      >
                        {timePerGirlData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Spending Trends */}
              {monthlyTrends.length > 1 && (
                <div className="card-cpn">
                  <h3 className="text-lg font-heading text-cpn-white mb-4">
                    Monthly Spending Trends
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--cpn-gray) / 0.2)" />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: '#ababab' }}
                          axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                        />
                        <YAxis
                          tick={{ fill: '#ababab' }}
                          axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="spent"
                          stroke="rgb(var(--cpn-yellow))"
                          strokeWidth={3}
                          dot={{ fill: 'rgb(var(--cpn-yellow))', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Cost Efficiency Trends */}
              {costEfficiencyTrends.length > 1 && (
                <div className="card-cpn">
                  <h3 className="text-lg font-heading text-cpn-white mb-4">
                    Cost Efficiency Trends
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={costEfficiencyTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--cpn-gray) / 0.2)" />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: '#ababab' }}
                          axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                        />
                        <YAxis
                          tick={{ fill: '#ababab' }}
                          axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                          tickFormatter={(value) => `$${value.toFixed(2)}`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Line
                          type="monotone"
                          dataKey="costPerNut"
                          stroke="#ff6b6b"
                          strokeWidth={3}
                          dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Spending Distribution */}
              {spendingDistribution.length > 0 && (
                <div className="card-cpn">
                  <h3 className="text-lg font-heading text-cpn-white mb-4">
                    Spending Distribution
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={spendingDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                          labelLine={false}
                        >
                          {spendingDistribution.map((entry, index) => {
                            const girl = activeGirls.find(g => g.name === entry.name);
                            const color = girl ? girlColorMap[girl.id] : `#${Math.floor(Math.random()*16777215).toString(16)}`;
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [formatCurrency(value), "Amount"]}
                          contentStyle={{
                            backgroundColor: 'var(--color-cpn-dark)',
                            border: '1px solid rgb(var(--cpn-gray) / 0.2)',
                            borderRadius: '8px',
                            color: 'var(--color-cpn-white)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Total Nuts per Girl */}
              <div className="card-cpn">
                <h3 className="text-lg font-heading text-cpn-white mb-4">
                  Total Nuts per Girl
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={nutsPerGirlData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--cpn-gray) / 0.2)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#ababab' }}
                        axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                      />
                      <YAxis
                        tick={{ fill: '#ababab' }}
                        axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar
                        dataKey="nuts"
                        radius={[4, 4, 0, 0]}
                      >
                        {nutsPerGirlData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Average Time per Nut Comparison */}
              <div className="card-cpn">
                <h3 className="text-lg font-heading text-cpn-white mb-4">
                  Average Time per Nut Comparison
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={avgTimePerNutData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--cpn-gray) / 0.2)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#ababab' }}
                        axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                      />
                      <YAxis
                        tick={{ fill: '#ababab' }}
                        axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                        tickFormatter={(value) => `${Math.round(value)}m`}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar
                        dataKey="avgTimePerNut"
                        radius={[4, 4, 0, 0]}
                      >
                        {avgTimePerNutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Average Cost per Hour per Girl */}
              <div className="card-cpn">
                <h3 className="text-lg font-heading text-cpn-white mb-4">
                  Average Cost per Hour per Girl
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={avgCostPerHourData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--cpn-gray) / 0.2)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#ababab' }}
                        axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                      />
                      <YAxis
                        tick={{ fill: '#ababab' }}
                        axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar
                        dataKey="costPerHour"
                        radius={[4, 4, 0, 0]}
                      >
                        {avgCostPerHourData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Time Distribution per Girl */}
              {timeDistribution.length > 0 && (
                <div className="card-cpn">
                  <h3 className="text-lg font-heading text-cpn-white mb-4">
                    Time Distribution per Girl
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={timeDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                          labelLine={false}
                        >
                          {timeDistribution.map((entry, index) => {
                            const girl = activeGirls.find(g => g.name === entry.name);
                            const color = girl ? girlColorMap[girl.id] : `#${Math.floor(Math.random()*16777215).toString(16)}`;
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [formatTime(value), "Time"]}
                          contentStyle={{
                            backgroundColor: 'var(--color-cpn-dark)',
                            border: '1px solid rgb(var(--cpn-gray) / 0.2)',
                            borderRadius: '8px',
                            color: 'var(--color-cpn-white)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Average Cost per Hour Distribution */}
              {costPerHourDistribution.length > 0 && costPerHourDistribution.some(item => item.value > 0) && (
                <div className="card-cpn">
                  <h3 className="text-lg font-heading text-cpn-white mb-4">
                    Average Cost per Hour Distribution
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={costPerHourDistribution.filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                          labelLine={false}
                        >
                          {costPerHourDistribution.filter(item => item.value > 0).map((entry, index) => {
                            const girl = activeGirls.find(g => g.name === entry.name);
                            const color = girl ? girlColorMap[girl.id] : `#${Math.floor(Math.random()*16777215).toString(16)}`;
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [formatCurrency(value), "Cost/Hour"]}
                          contentStyle={{
                            backgroundColor: 'var(--color-cpn-dark)',
                            border: '1px solid rgb(var(--cpn-gray) / 0.2)',
                            borderRadius: '8px',
                            color: 'var(--color-cpn-white)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Efficiency vs Rating Scatter Plot */}
              {efficiencyRatingData.length > 0 && (
                <div className="card-cpn">
                  <h3 className="text-lg font-heading text-cpn-white mb-4">
                    Efficiency vs Rating Analysis
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={efficiencyRatingData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--cpn-gray) / 0.2)" />
                        <XAxis
                          type="number"
                          dataKey="rating"
                          domain={[5, 10]}
                          tick={{ fill: '#ababab' }}
                          axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                          label={{ value: 'Rating', position: 'insideBottom', offset: -5, fill: '#ababab' }}
                        />
                        <YAxis
                          type="number"
                          dataKey="costPerNut"
                          tick={{ fill: '#ababab' }}
                          axisLine={{ stroke: 'rgb(var(--cpn-gray) / 0.2)' }}
                          tickFormatter={(value) => `$${value.toFixed(2)}`}
                          label={{ value: 'Cost per Nut', angle: -90, position: 'insideLeft', fill: '#ababab' }}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-cpn-dark border border-cpn-gray/20 rounded-lg p-3 shadow-lg">
                                  <p className="text-cpn-white font-medium">{data.name}</p>
                                  <p className="text-sm text-cpn-gray">
                                    Rating: {data.rating}/10
                                  </p>
                                  <p className="text-sm text-cpn-gray">
                                    Cost per Nut: {formatCurrency(data.costPerNut)}
                                  </p>
                                  <p className="text-sm text-cpn-gray">
                                    Nuts/Hour: {data.nutsPerHour.toFixed(2)}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter dataKey="costPerNut" fill="#8884d8">
                          {efficiencyRatingData.map((entry, index) => {
                            const girl = activeGirls.find(g => g.name === entry.name);
                            const color = girl ? girlColorMap[girl.id] : '#8884d8';
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* ROI Ranking Table */}
            {roiRanking.length > 0 && (
              <div className="card-cpn">
                <h3 className="text-lg font-heading text-cpn-white mb-4">
                  ROI Performance Ranking
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-cpn-gray/20">
                        <th className="text-left py-3 text-cpn-gray font-medium">Rank</th>
                        <th className="text-left py-3 text-cpn-gray font-medium">Name</th>
                        <th className="text-left py-3 text-cpn-gray font-medium">Rating</th>
                        <th className="text-left py-3 text-cpn-gray font-medium">Cost/Nut</th>
                        <th className="text-left py-3 text-cpn-gray font-medium">Nuts/Hour</th>
                        <th className="text-left py-3 text-cpn-gray font-medium">Efficiency Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roiRanking.map((girl, index) => (
                        <tr key={girl.name} className="border-b border-cpn-gray/10 hover:bg-cpn-gray/5">
                          <td className="py-3 text-cpn-white">{index + 1}</td>
                          <td className="py-3 text-cpn-white font-medium">{girl.name}</td>
                          <td className="py-3 text-cpn-white">{girl.rating}/10</td>
                          <td className="py-3 text-cpn-white">{formatCurrency(girl.costPerNut)}</td>
                          <td className="py-3 text-cpn-white">{girl.nutsPerHour}</td>
                          <td className="py-3 text-cpn-yellow font-bold">{girl.efficiencyScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}