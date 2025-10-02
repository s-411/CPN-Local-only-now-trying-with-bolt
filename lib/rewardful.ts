import {
  RewardfulAffiliate,
  RewardfulReferral,
  RewardfulConversion,
  RewardfulApiResponse,
  AffiliateStats,
} from './types';

// Base API configuration
const REWARDFUL_API_BASE = 'https://api.rewardful.com/v1';

class RewardfulAPI {
  private secretKey: string | undefined;

  constructor() {
    this.secretKey = process.env.REWARDFUL_SECRET_KEY;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<RewardfulApiResponse<T>> {
    if (!this.secretKey) {
      throw new Error('Rewardful secret key not configured');
    }

    const url = `${REWARDFUL_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Rewardful API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      data,
      success: true,
    };
  }

  // Create a new affiliate
  async createAffiliate(email: string, firstName?: string, lastName?: string): Promise<RewardfulAffiliate> {
    const response = await this.makeRequest<RewardfulAffiliate>('/affiliates', {
      method: 'POST',
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
      }),
    });

    return response.data;
  }

  // Get affiliate by ID
  async getAffiliate(affiliateId: string): Promise<RewardfulAffiliate> {
    const response = await this.makeRequest<RewardfulAffiliate>(`/affiliates/${affiliateId}`);
    return response.data;
  }

  // Get affiliate by email
  async getAffiliateByEmail(email: string): Promise<RewardfulAffiliate | null> {
    try {
      const response = await this.makeRequest<{ affiliates: RewardfulAffiliate[] }>(`/affiliates?email=${encodeURIComponent(email)}`);
      return response.data.affiliates?.[0] || null;
    } catch (error) {
      // Return null if affiliate not found
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // Get affiliate referrals
  async getAffiliateReferrals(affiliateId: string): Promise<RewardfulReferral[]> {
    const response = await this.makeRequest<{ referrals: RewardfulReferral[] }>(`/affiliates/${affiliateId}/referrals`);
    return response.data.referrals;
  }

  // Track a conversion
  async trackConversion(conversion: RewardfulConversion): Promise<void> {
    await this.makeRequest('/conversions', {
      method: 'POST',
      body: JSON.stringify(conversion),
    });
  }

  // Calculate affiliate stats from Rewardful data
  calculateAffiliateStats(affiliate: RewardfulAffiliate, referrals: RewardfulReferral[]): AffiliateStats {
    const conversions = referrals.filter(ref => ref.converted_at);
    const totalClicks = referrals.length;
    const totalConversions = conversions.length;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    const paidEarnings = affiliate.total_commissions_paid;
    const pendingEarnings = affiliate.total_commissions_earned - affiliate.total_commissions_paid;
    const totalEarnings = affiliate.total_commissions_earned;

    // Calculate current month earnings
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthEarnings = conversions
      .filter(ref => {
        const convertedDate = new Date(ref.converted_at!);
        return convertedDate.getMonth() === currentMonth && convertedDate.getFullYear() === currentYear;
      })
      .reduce((sum, ref) => sum + (ref.commission_amount || 0), 0);

    return {
      totalClicks,
      totalConversions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      totalEarnings,
      pendingEarnings,
      paidEarnings,
      currentMonthEarnings,
      lifetimeEarnings: totalEarnings,
    };
  }
}

// Singleton instance
export const rewardfulAPI = new RewardfulAPI();

// Client-side utilities for Rewardful tracking script
export const RewardfulClient = {
  // Check if Rewardful is loaded
  isReady(): boolean {
    return typeof window !== 'undefined' && window.rewardful !== undefined;
  },

  // Get current referral ID
  getReferralId(): string | null {
    if (!this.isReady()) return null;
    return window.Rewardful?.referral || null;
  },

  // Ready callback - execute when Rewardful is loaded
  ready(callback: () => void): void {
    if (typeof window === 'undefined') return;

    if (this.isReady() && window.Rewardful) {
      callback();
    } else {
      window.rewardful('ready', callback);
    }
  },

  // Track a custom event
  track(event: string, data?: Record<string, any>): void {
    if (!this.isReady()) return;
    window.rewardful('track', event, data);
  },

  // Convert a referral
  convert(email: string, amount?: number, orderId?: string): void {
    if (!this.isReady()) return;
    window.rewardful('convert', {
      email,
      amount,
      external_id: orderId,
    });
  }
};

// Type extensions for global window object
declare global {
  interface Window {
    rewardful: (action: string, ...args: any[]) => void;
    Rewardful?: {
      referral: string | null;
      affiliate: string | null;
    };
  }
}

// Utility functions for generating affiliate links and codes
export const generateAffiliateLink = (baseUrl: string, affiliateCode: string): string => {
  const url = new URL(baseUrl);
  url.searchParams.set('via', affiliateCode);
  return url.toString();
};

export const extractAffiliateCode = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('via');
  } catch {
    return null;
  }
};

// Mock data for development/testing
export const mockAffiliateStats: AffiliateStats = {
  totalClicks: 156,
  totalConversions: 23,
  conversionRate: 14.7,
  totalEarnings: 287.50,
  pendingEarnings: 45.75,
  paidEarnings: 241.75,
  currentMonthEarnings: 89.25,
  lifetimeEarnings: 287.50,
};