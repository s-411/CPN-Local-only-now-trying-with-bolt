// Demographic options for structured data
export type EthnicityOption = 
  | 'Asian'
  | 'Black'
  | 'Latina'
  | 'White'
  | 'Middle Eastern'
  | 'Indian'
  | 'Mixed'
  | 'Native American'
  | 'Pacific Islander'
  | 'Other';

export type HairColorOption =
  | 'Blonde'
  | 'Brunette' 
  | 'Black'
  | 'Red'
  | 'Auburn'
  | 'Gray/Silver'
  | 'Dyed/Colorful'
  | 'Other';

export interface LocationData {
  city?: string;
  country?: string;
}

// Base girl profile type
export interface Girl {
  id: string;
  name: string;
  age: number;
  nationality: string; // Keep existing field for backward compatibility
  rating: number; // 5.0-10.0, 0.5 increments
  isActive: boolean; // Active/inactive status for filtering
  // New optional structured demographic fields
  ethnicity?: EthnicityOption;
  hairColor?: HairColorOption;
  location?: LocationData;
  createdAt: Date;
  updatedAt: Date;
}

// Alias for backward compatibility
export interface GirlProfile extends Girl {}

export interface DataEntry {
  id: string;
  girlId: string;
  date: Date;
  amountSpent: number;
  durationMinutes: number;
  numberOfNuts: number;
  createdAt: Date;
  updatedAt: Date;
}

// Form data types (without generated fields)
export interface GirlFormData {
  name: string;
  age: string; // String for form input
  nationality: string;
  rating: number | string; // Allow both for validation errors
  isActive?: boolean; // Optional for forms, defaults to true
  // Optional structured demographic fields for forms
  ethnicity?: EthnicityOption;
  hairColor?: HairColorOption;
  location?: LocationData;
}

export interface DataEntryFormData {
  girlId: string;
  date: string; // String for form input
  amountSpent: string; // String for form input
  durationMinutes: string; // String for form input
  numberOfNuts: string; // String for form input
}

// Form data for data entry page with hours/minutes split
export interface FormData {
  date: string;
  amountSpent: string;
  hours: string;
  minutes: string;
  numberOfNuts: string;
}

// Sort configuration for tables
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Calculated metrics for a girl
export interface CalculatedMetrics {
  totalSpent: number;
  totalNuts: number;
  totalTime: number; // in minutes
  costPerNut: number;
  timePerNut: number; // in minutes
  costPerHour: number;
}

// Girl with calculated metrics
export interface GirlWithMetrics extends Girl {
  metrics: CalculatedMetrics;
  totalEntries: number;
}

// Global statistics
export interface GlobalStats {
  totalGirls: number;
  activeGirls: number;
  totalSpent: number;
  totalNuts: number;
  totalTime: number;
  averageRating: number;
}

// Legacy alias for backward compatibility
export interface AnalyticsMetrics extends CalculatedMetrics {
  averageCostPerNut: number;
  averageTimePerNut: number;
  averageCostPerHour: number;
}

// Data Vault demographic analytics types
export interface DemographicStats {
  ethnicity: {
    [key in EthnicityOption]: {
      averageCostPerNut: number;
      averageRating: number;
      totalSpending: number;
      userCount: number;
    }
  };
  hairColor: {
    [key in HairColorOption]: {
      averageCostPerNut: number;
      averageRating: number;
      totalSpending: number;
      userCount: number;
    }
  };
  ratingTiers: {
    [key: string]: { // "5.0-5.5", "6.0-6.5", etc.
      averageCostPerNut: number;
      totalSpending: number;
      popularityPercentage: number;
    }
  };
  locations: {
    [country: string]: {
      averageCostPerNut: number;
      popularity: number;
    }
  };
}

export interface UserDemographicComparison {
  ethnicityPreference: {
    userFavorite?: EthnicityOption;
    globalMostExpensive?: EthnicityOption;
    userVsGlobalSpending: number; // percentage difference
  };
  ratingPreference: {
    userAverageRating: number;
    globalAverageRating: number;
    userHighRatedPercentage: number; // % of 8+ rated girls
  };
  hairColorPreference: {
    userFavorite?: HairColorOption;
    globalMostExpensive?: HairColorOption;
    userVsGlobalSpending: number;
  };
}

// Leaderboard types
export interface LeaderboardGroup {
  id: string;
  name: string;
  createdBy: string; // user id
  createdAt: Date;
  updatedAt: Date;
  inviteToken: string; // for shareable links
  isPrivate: boolean; // always true for now
  memberCount: number;
}

export interface LeaderboardMember {
  id: string;
  groupId: string;
  userId: string;
  username: string; // display name (anonymous)
  joinedAt: Date;
  stats: LeaderboardStats;
}

export interface LeaderboardStats {
  totalSpent: number;
  totalNuts: number;
  costPerNut: number;
  totalTime: number; // in minutes
  totalGirls: number;
  efficiency: number; // calculated ranking metric
  lastUpdated: Date;
}

export interface LeaderboardRanking {
  rank: number;
  member: LeaderboardMember;
  change?: number; // rank change since last update
}

// Mock user for testing leaderboards
export interface MockUser {
  id: string;
  username: string;
  avatar?: string;
  joinedDate: Date;
  location: string;
  stats: LeaderboardStats;
}

// Form types
export interface CreateGroupFormData {
  name: string;
}

export interface JoinGroupData {
  inviteToken: string;
  username: string;
}

// Overview page types
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Rewardful Affiliate Program Types
export interface RewardfulAffiliate {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  token: string; // Unique affiliate code
  link: string; // Full affiliate link
  commission_type: 'percentage' | 'fixed';
  commission_amount: number;
  status: 'active' | 'pending' | 'disabled';
  created_at: string;
  updated_at: string;
  total_referrals: number;
  total_commissions_earned: number;
  total_commissions_paid: number;
}

export interface RewardfulReferral {
  id: string;
  affiliate_id: string;
  customer_email?: string;
  customer_name?: string;
  referral_id: string; // UUID from Rewardful tracking
  converted_at?: string;
  commission_amount?: number;
  commission_status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  created_at: string;
}

export interface RewardfulConversion {
  referral_id: string;
  customer_email: string;
  amount: number; // Sale amount
  currency: string;
  external_id?: string; // Your internal order/subscription ID
  metadata?: Record<string, any>;
}

export interface AffiliateStats {
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  currentMonthEarnings: number;
  lifetimeEarnings: number;
}

export interface AffiliateUser {
  id: string;
  email: string;
  affiliateCode: string;
  affiliateLink: string;
  isAffiliateActive: boolean;
  affiliateStats: AffiliateStats;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types for Rewardful
export interface RewardfulApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export interface RewardfulWebhookPayload {
  type: 'referral.created' | 'referral.converted' | 'commission.created' | 'commission.paid';
  data: RewardfulReferral | RewardfulAffiliate;
  created_at: string;
}
