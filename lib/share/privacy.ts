// Privacy filtering and data protection for sharing

import { SharePrivacySettings } from './types';
import { GirlWithMetrics, DataEntry } from '../types';

export class PrivacyFilter {
  /**
   * Apply privacy settings to any data before sharing
   */
  static applyPrivacySettings<T>(data: T, settings: SharePrivacySettings): T {
    if (!settings) return data;

    let filteredData = { ...data } as any;

    // Handle name redaction
    if (settings.redactNames && filteredData.name) {
      filteredData.name = this.redactName(filteredData.name);
    }

    // Handle location redaction
    if (settings.redactLocations) {
      if (filteredData.location) {
        delete filteredData.location;
      }
      if (filteredData.nationality) {
        filteredData.nationality = settings.anonymizeByDefault ? 'Anonymous' : filteredData.nationality;
      }
    }

    // Handle date redaction
    if (settings.redactDates) {
      ['createdAt', 'updatedAt', 'date'].forEach(field => {
        if (filteredData[field]) {
          if (settings.showRanges) {
            filteredData[field] = this.dateToRange(filteredData[field]);
          } else {
            delete filteredData[field];
          }
        }
      });
    }

    // Handle amount redaction
    if (settings.redactAmounts) {
      ['amountSpent', 'totalSpent'].forEach(field => {
        if (filteredData[field] !== undefined) {
          if (settings.showRanges) {
            filteredData[field] = this.amountToRange(filteredData[field]);
          } else if (!settings.showExactValues) {
            delete filteredData[field];
          }
        }
      });
    }

    // Remove timestamps if not allowed
    if (!settings.includeTimestamps) {
      ['createdAt', 'updatedAt', 'generatedAt'].forEach(field => {
        delete filteredData[field];
      });
    }

    return filteredData;
  }

  /**
   * Filter girl data for sharing
   */
  static filterGirlData(girl: GirlWithMetrics, settings: SharePrivacySettings): Partial<GirlWithMetrics> {
    const baseFiltered = this.applyPrivacySettings(girl, settings);

    // Additional girl-specific filtering
    const filtered: any = {
      ...baseFiltered,
      id: settings.anonymizeByDefault ? this.generateAnonymousId() : girl.id
    };

    // Handle metrics based on privacy level
    if (filtered.metrics) {
      filtered.metrics = this.filterMetrics(filtered.metrics, settings);
    }

    return filtered;
  }

  /**
   * Filter metrics data for sharing
   */
  static filterMetrics(metrics: any, settings: SharePrivacySettings): any {
    const filtered = { ...metrics };

    if (!settings.showExactValues) {
      // Convert exact values to ranges for privacy
      if (filtered.costPerNut) {
        filtered.costPerNut = this.valueToRange(filtered.costPerNut, 'currency');
      }
      if (filtered.totalSpent && settings.redactAmounts) {
        filtered.totalSpent = this.amountToRange(filtered.totalSpent);
      }
    }

    return filtered;
  }

  /**
   * Validate that content respects privacy settings
   */
  static validateShareableContent(content: any, settings: SharePrivacySettings): boolean {
    if (!settings) return true;

    // Check for leaked personal information
    const contentStr = JSON.stringify(content).toLowerCase();

    // Basic checks for common PII patterns
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
    
    if (emailRegex.test(contentStr) || phoneRegex.test(contentStr)) {
      return false;
    }

    // Check redaction compliance
    if (settings.redactNames && this.containsUnredactedNames(content)) {
      return false;
    }

    if (settings.redactAmounts && this.containsExactAmounts(content, settings)) {
      return false;
    }

    return true;
  }

  /**
   * Generate anonymous ID for privacy
   */
  private static generateAnonymousId(): string {
    return `anon_${Math.random().toString(36).substr(2, 8)}`;
  }

  /**
   * Redact names while keeping some readability
   */
  private static redactName(name: string): string {
    if (name.length <= 2) return '***';
    return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
  }

  /**
   * Convert date to range for privacy
   */
  private static dateToRange(date: Date): string {
    const d = new Date(date);
    const month = d.getMonth();
    const year = d.getFullYear();
    
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const quarter = quarters[Math.floor(month / 3)];
    
    return `${quarter} ${year}`;
  }

  /**
   * Convert amount to range for privacy
   */
  private static amountToRange(amount: number): string {
    if (amount < 50) return '$0-50';
    if (amount < 100) return '$50-100';
    if (amount < 250) return '$100-250';
    if (amount < 500) return '$250-500';
    if (amount < 1000) return '$500-1K';
    if (amount < 2500) return '$1K-2.5K';
    if (amount < 5000) return '$2.5K-5K';
    return '$5K+';
  }

  /**
   * Convert numeric value to range
   */
  private static valueToRange(value: number, type: 'currency' | 'time'): string {
    if (type === 'currency') {
      return this.amountToRange(value);
    }
    
    // Time ranges
    if (value < 30) return '0-30 min';
    if (value < 60) return '30-60 min';
    if (value < 120) return '1-2 hours';
    return '2+ hours';
  }

  /**
   * Check if content contains unredacted names
   */
  private static containsUnredactedNames(content: any): boolean {
    const contentStr = JSON.stringify(content);
    // Simple heuristic: look for words that might be names (not starting with *)
    const possibleNames = contentStr.match(/[A-Z][a-z]{2,}/g);
    return possibleNames ? possibleNames.some(name => !name.startsWith('*')) : false;
  }

  /**
   * Check if content contains exact amounts when it shouldn't
   */
  private static containsExactAmounts(content: any, settings: SharePrivacySettings): boolean {
    if (settings.showExactValues) return false;
    
    const contentStr = JSON.stringify(content);
    // Look for exact dollar amounts
    const dollarAmounts = contentStr.match(/\$[\d,]+\.?\d*/g);
    return dollarAmounts ? dollarAmounts.length > 0 : false;
  }
}

/**
 * Default privacy settings for new users
 */
export const DEFAULT_PRIVACY_SETTINGS: SharePrivacySettings = {
  // Conservative defaults - opt-in approach
  allowStatistics: false,
  allowAchievements: false,
  allowComparisons: false,
  allowReports: false,
  
  // Safety defaults
  requireWatermark: true,
  anonymizeByDefault: true,
  includeTimestamps: false,
  expirationTime: 24, // 24 hours
  
  // Privacy-first data granularity
  showExactValues: false,
  showRanges: true,
  showTrends: true,
  
  // Redact sensitive data by default
  redactNames: true,
  redactLocations: true,
  redactDates: false, // Dates are usually okay in ranges
  redactAmounts: true,
};