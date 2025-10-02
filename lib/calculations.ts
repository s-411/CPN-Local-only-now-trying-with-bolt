import { Girl, DataEntry, CalculatedMetrics, GirlWithMetrics, GlobalStats } from './types';

export function calculateMetricsForGirl(entries: DataEntry[]): CalculatedMetrics {
  if (entries.length === 0) {
    return {
      totalSpent: 0,
      totalNuts: 0,
      totalTime: 0,
      costPerNut: 0,
      timePerNut: 0,
      costPerHour: 0
    };
  }

  const totalSpent = entries.reduce((sum, entry) => sum + entry.amountSpent, 0);
  const totalNuts = entries.reduce((sum, entry) => sum + entry.numberOfNuts, 0);
  const totalTime = entries.reduce((sum, entry) => sum + entry.durationMinutes, 0);

  const costPerNut = totalNuts > 0 ? totalSpent / totalNuts : 0;
  const timePerNut = totalNuts > 0 ? totalTime / totalNuts : 0;
  const costPerHour = totalTime > 0 ? (totalSpent / totalTime) * 60 : 0;

  return {
    totalSpent: Math.round(totalSpent * 100) / 100, // Round to 2 decimal places
    totalNuts,
    totalTime,
    costPerNut: Math.round(costPerNut * 100) / 100,
    timePerNut: Math.round(timePerNut * 100) / 100,
    costPerHour: Math.round(costPerHour * 100) / 100
  };
}

export function createGirlWithMetrics(girl: Girl, entries: DataEntry[]): GirlWithMetrics {
  return {
    ...girl,
    metrics: calculateMetricsForGirl(entries),
    totalEntries: entries.length
  };
}

export function calculateGlobalStats(girls: Girl[], allEntries: DataEntry[]): GlobalStats {
  const totalGirls = girls.length;
  
  // Filter to only include active girls
  const activeGirlsWithData = girls.filter(girl => 
    (girl.isActive ?? true) && allEntries.some(entry => entry.girlId === girl.id)
  );
  const activeGirls = activeGirlsWithData.length;

  // Filter entries to only include data from active girls
  const activeGirlIds = new Set(girls.filter(girl => girl.isActive ?? true).map(girl => girl.id));
  const activeEntries = allEntries.filter(entry => activeGirlIds.has(entry.girlId));

  const totalSpent = activeEntries.reduce((sum, entry) => sum + entry.amountSpent, 0);
  const totalNuts = activeEntries.reduce((sum, entry) => sum + entry.numberOfNuts, 0);
  const totalTime = activeEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  
  // Only include active girls in average rating calculation
  const activeGirlsList = girls.filter(girl => girl.isActive ?? true);
  const averageRating = activeGirlsList.length > 0 
    ? activeGirlsList.reduce((sum, girl) => sum + girl.rating, 0) / activeGirlsList.length 
    : 0;

  return {
    totalGirls,
    activeGirls,
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalNuts,
    totalTime,
    averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
  };
}

// Utility functions for formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

export function formatTimeDetailed(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:00`;
}

export function formatRating(rating: number): string {
  return `★${rating}/10`;
}

// Sorting functions
export function sortGirlsByField<T extends GirlWithMetrics>(
  girls: T[], 
  field: keyof GirlWithMetrics | keyof CalculatedMetrics, 
  direction: 'asc' | 'desc'
): T[] {
  return [...girls].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    // Handle nested metrics fields
    if (field.startsWith('metrics.')) {
      const metricField = field.replace('metrics.', '') as keyof CalculatedMetrics;
      aValue = a.metrics[metricField];
      bValue = b.metrics[metricField];
    } else {
      aValue = a[field as keyof GirlWithMetrics];
      bValue = b[field as keyof GirlWithMetrics];
    }

    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
      return direction === 'asc' ? comparison : -comparison;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      const comparison = aValue.getTime() - bValue.getTime();
      return direction === 'asc' ? comparison : -comparison;
    }

    return 0;
  });
}

// Data analysis functions
export function getTopPerformers(girls: GirlWithMetrics[], metric: keyof CalculatedMetrics, count: number = 5) {
  return [...girls]
    .filter(girl => girl.totalEntries > 0 && (girl.isActive ?? true))
    .sort((a, b) => {
      const aValue = a.metrics[metric];
      const bValue = b.metrics[metric];
      return typeof aValue === 'number' && typeof bValue === 'number' ? bValue - aValue : 0;
    })
    .slice(0, count);
}

export function getRecentActivity(entries: DataEntry[], days: number = 7): DataEntry[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return entries
    .filter(entry => new Date(entry.date) >= cutoffDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getMonthlyTrends(entries: DataEntry[]) {
  const monthlyData = new Map<string, {
    spent: number;
    nuts: number;
    time: number;
    entries: number;
  }>();

  entries.forEach(entry => {
    const date = new Date(entry.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { spent: 0, nuts: 0, time: 0, entries: 0 });
    }

    const monthData = monthlyData.get(monthKey)!;
    monthData.spent += entry.amountSpent;
    monthData.nuts += entry.numberOfNuts;
    monthData.time += entry.durationMinutes;
    monthData.entries += 1;
  });

  return Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      ...data,
      costPerNut: data.nuts > 0 ? data.spent / data.nuts : 0,
      costPerHour: data.time > 0 ? (data.spent / data.time) * 60 : 0
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// New analytics functions for enhanced charts
export function getCostEfficiencyTrends(entries: DataEntry[]) {
  const monthlyData = getMonthlyTrends(entries);
  return monthlyData.map(data => ({
    month: data.month,
    costPerNut: Math.round(data.costPerNut * 100) / 100,
    averageSpending: Math.round(data.spent / data.entries * 100) / 100,
    entries: data.entries
  }));
}

export function getSpendingDistribution(girls: GirlWithMetrics[]) {
  const activeGirls = girls.filter(girl => girl.totalEntries > 0 && (girl.isActive ?? true));
  const totalSpent = activeGirls.reduce((sum, girl) => sum + girl.metrics.totalSpent, 0);

  return activeGirls.map(girl => ({
    name: girl.name,
    value: girl.metrics.totalSpent,
    percentage: totalSpent > 0 ? (girl.metrics.totalSpent / totalSpent) * 100 : 0
  })).sort((a, b) => b.value - a.value);
}

export function getEfficiencyRatingCorrelation(girls: GirlWithMetrics[]) {
  return girls
    .filter(girl => girl.totalEntries > 0 && (girl.isActive ?? true))
    .map(girl => ({
      name: girl.name,
      rating: girl.rating,
      costPerNut: girl.metrics.costPerNut,
      nutsPerHour: girl.metrics.totalTime > 0 ? (girl.metrics.totalNuts / girl.metrics.totalTime) * 60 : 0,
      totalSpent: girl.metrics.totalSpent
    }));
}

export function getROIRanking(girls: GirlWithMetrics[]) {
  return girls
    .filter(girl => girl.totalEntries > 0 && (girl.isActive ?? true))
    .map(girl => {
      const nutsPerDollar = girl.metrics.totalSpent > 0 ? girl.metrics.totalNuts / girl.metrics.totalSpent : 0;
      const nutsPerHour = girl.metrics.totalTime > 0 ? (girl.metrics.totalNuts / girl.metrics.totalTime) * 60 : 0;
      const efficiencyScore = (nutsPerDollar * 100) + (nutsPerHour * 10) + girl.rating;

      return {
        name: girl.name,
        rating: girl.rating,
        costPerNut: girl.metrics.costPerNut,
        nutsPerDollar: Math.round(nutsPerDollar * 1000) / 1000,
        nutsPerHour: Math.round(nutsPerHour * 100) / 100,
        efficiencyScore: Math.round(efficiencyScore * 100) / 100,
        totalNuts: girl.metrics.totalNuts,
        totalSpent: girl.metrics.totalSpent
      };
    })
    .sort((a, b) => b.efficiencyScore - a.efficiencyScore);
}

export function getEnhancedGlobalStats(girls: Girl[], allEntries: DataEntry[], timeRangeEntries: DataEntry[]) {
  const baseStats = calculateGlobalStats(girls, allEntries);
  const filteredGirls = girls.filter(girl =>
    (girl.isActive ?? true) && timeRangeEntries.some(entry => entry.girlId === girl.id)
  );

  const averageSessionCost = timeRangeEntries.length > 0
    ? timeRangeEntries.reduce((sum, entry) => sum + entry.amountSpent, 0) / timeRangeEntries.length
    : 0;

  const totalTimeRangeSpent = timeRangeEntries.reduce((sum, entry) => sum + entry.amountSpent, 0);
  const totalTimeRangeNuts = timeRangeEntries.reduce((sum, entry) => sum + entry.numberOfNuts, 0);
  const efficiencyScore = totalTimeRangeNuts > 0 ? totalTimeRangeSpent / totalTimeRangeNuts : 0;

  return {
    ...baseStats,
    activeProfilesInRange: filteredGirls.length,
    averageSessionCost: Math.round(averageSessionCost * 100) / 100,
    efficiencyScore: Math.round(efficiencyScore * 100) / 100,
    totalSessionsInRange: timeRangeEntries.length
  };
}