import { DataEntry, AnalyticsMetrics } from './types';

export function calculateMetrics(dataEntries: DataEntry[]): AnalyticsMetrics {
  if (dataEntries.length === 0) {
    return {
      totalSpent: 0,
      totalNuts: 0,
      totalTime: 0,
      costPerNut: 0,
      timePerNut: 0,
      costPerHour: 0,
      averageCostPerNut: 0,
      averageTimePerNut: 0,
      averageCostPerHour: 0,
    };
  }

  const totalSpent = dataEntries.reduce((sum, entry) => sum + entry.amountSpent, 0);
  const totalNuts = dataEntries.reduce((sum, entry) => sum + entry.numberOfNuts, 0);
  const totalTime = dataEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0);

  return {
    totalSpent,
    totalNuts,
    totalTime,
    costPerNut: totalNuts > 0 ? totalSpent / totalNuts : 0,
    timePerNut: totalNuts > 0 ? totalTime / totalNuts : 0,
    costPerHour: totalTime > 0 ? totalSpent / (totalTime / 60) : 0,
    averageCostPerNut: totalNuts > 0 ? totalSpent / totalNuts : 0,
    averageTimePerNut: totalNuts > 0 ? totalTime / totalNuts : 0,
    averageCostPerHour: totalTime > 0 ? totalSpent / (totalTime / 60) : 0,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours}h ${mins}m`;
}

export function formatDecimal(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}
