// Sharing system types for CPN v2

export interface ShareableStatCard {
  id: string;
  type: 'efficiency' | 'spending' | 'achievement' | 'comparison';
  title: string;
  metrics: {
    primary: { label: string; value: string | number; };
    secondary?: { label: string; value: string | number; }[];
  };
  visualization?: 'chart' | 'badge' | 'progress';
  style: ShareCardStyle;
  watermark: boolean;
  generatedAt: Date;
}

export interface ShareCardStyle {
  theme: 'dark' | 'light' | 'gradient';
  accentColor: string;
  branding: 'full' | 'minimal' | 'none';
  size: 'compact' | 'standard' | 'detailed';
}

export interface ShareableBadge {
  id: string;
  achievement: {
    type: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    title: string;
    description: string;
    unlockedAt: Date;
  };
  displayOptions: {
    showDate: boolean;
    showDetails: boolean;
    includeStats: boolean;
  };
  format: 'badge' | 'certificate' | 'card';
}

export interface ComparisonReport {
  id: string;
  userMetrics: {
    costPerNut: number;
    efficiency: number;
    totalSpent: number;
    percentile?: number;
  };
  globalMetrics: {
    avgCostPerNut: number;
    avgEfficiency: number;
    medianSpending: number;
  };
  insights: string[];
  recommendations: string[];
  privacyLevel: 'full' | 'partial' | 'minimal';
}

export interface ShareableReport {
  id: string;
  type: 'weekly' | 'monthly' | 'annual' | 'custom';
  dateRange: { start: Date; end: Date; };
  sections: ReportSection[];
  format: 'pdf' | 'html' | 'image' | 'markdown';
  privacy: SharePrivacySettings;
  watermark: WatermarkSettings;
}

export interface ReportSection {
  type: 'summary' | 'charts' | 'trends' | 'achievements' | 'recommendations';
  included: boolean;
  customization?: any;
}

export interface SharePrivacySettings {
  // What can be shared
  allowStatistics: boolean;
  allowAchievements: boolean;
  allowComparisons: boolean;
  allowReports: boolean;
  
  // How it's shared
  requireWatermark: boolean;
  anonymizeByDefault: boolean;
  includeTimestamps: boolean;
  expirationTime?: number; // hours
  
  // Data granularity
  showExactValues: boolean;
  showRanges: boolean;
  showTrends: boolean;
  
  // Redaction rules
  redactNames: boolean;
  redactLocations: boolean;
  redactDates: boolean;
  redactAmounts: boolean;
}

export interface WatermarkSettings {
  enabled: boolean;
  type: 'text' | 'logo' | 'both';
  position: 'corner' | 'center' | 'diagonal';
  opacity: number;
  text?: string;
  includeDomain: boolean;
  includeTimestamp: boolean;
}

export interface URLShareData {
  version: string;
  type: 'stats' | 'achievement' | 'comparison' | 'report';
  data: string; // Base64 encoded, compressed
  expires?: number; // Unix timestamp
  signature?: string; // Optional integrity check
}

export interface ShareHistoryEntry {
  id: string;
  timestamp: Date;
  type: string;
  format: string;
  privacyLevel: string;
  expired: boolean;
  contentHash: string; // For duplicate detection
  thumbnail?: string;
}

export interface ShareableContent {
  id: string;
  type: 'card' | 'badge' | 'report' | 'comparison';
  content: any;
  metadata: {
    generatedAt: Date;
    privacy: SharePrivacySettings;
    watermark: WatermarkSettings;
  };
}

export type ShareFormat = 'image' | 'html' | 'pdf' | 'markdown' | 'json';
export type ShareDestination = 'clipboard' | 'download' | 'url' | 'qr';

export interface ShareOptions {
  format: ShareFormat;
  destination: ShareDestination;
  privacy: SharePrivacySettings;
  watermark?: WatermarkSettings;
  filename?: string;
}