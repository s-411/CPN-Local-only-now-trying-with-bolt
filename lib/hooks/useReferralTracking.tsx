import React, { useState, useEffect, useCallback } from 'react';
import { RewardfulClient } from '../rewardful';

interface ReferralData {
  referralId: string | null;
  affiliateCode: string | null;
  isReady: boolean;
  hasReferral: boolean;
}

// Key for storing referral data in sessionStorage
const REFERRAL_STORAGE_KEY = 'cpn_referral_data';

// Custom hook for tracking referrals
export const useReferralTracking = () => {
  const [referralData, setReferralData] = useState<ReferralData>({
    referralId: null,
    affiliateCode: null,
    isReady: false,
    hasReferral: false,
  });

  // Load referral data from storage
  const loadStoredReferralData = useCallback(() => {
    try {
      const stored = sessionStorage.getItem(REFERRAL_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          referralId: data.referralId || null,
          affiliateCode: data.affiliateCode || null,
        };
      }
    } catch (error) {
      console.error('Error loading referral data from storage:', error);
    }
    return { referralId: null, affiliateCode: null };
  }, []);

  // Save referral data to storage
  const saveReferralData = useCallback((referralId: string | null, affiliateCode: string | null) => {
    try {
      const data = {
        referralId,
        affiliateCode,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving referral data to storage:', error);
    }
  }, []);

  // Extract affiliate code from URL parameters
  const extractAffiliateFromUrl = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('via') || urlParams.get('ref') || null;
  }, []);

  // Initialize referral tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // First, try to get data from URL or storage
    const urlAffiliateCode = extractAffiliateFromUrl();
    const storedData = loadStoredReferralData();

    // Use URL affiliate code if present, otherwise use stored data
    const affiliateCode = urlAffiliateCode || storedData.affiliateCode;

    // Wait for Rewardful to be ready
    RewardfulClient.ready(() => {
      const referralId = RewardfulClient.getReferralId();

      // Update state
      setReferralData({
        referralId: referralId || storedData.referralId,
        affiliateCode,
        isReady: true,
        hasReferral: !!(referralId || storedData.referralId || affiliateCode),
      });

      // Save to storage if we have new data
      if (referralId || affiliateCode) {
        saveReferralData(referralId || storedData.referralId, affiliateCode);
      }
    });

    // If Rewardful is not available, use stored data
    const fallbackTimeout = setTimeout(() => {
      if (!referralData.isReady) {
        setReferralData(prev => ({
          ...prev,
          affiliateCode,
          isReady: true,
          hasReferral: !!(storedData.referralId || affiliateCode),
        }));
      }
    }, 2000);

    return () => clearTimeout(fallbackTimeout);
  }, [loadStoredReferralData, saveReferralData, extractAffiliateFromUrl, referralData.isReady]);

  // Clear referral data
  const clearReferralData = useCallback(() => {
    try {
      sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing referral data:', error);
    }
    setReferralData({
      referralId: null,
      affiliateCode: null,
      isReady: true,
      hasReferral: false,
    });
  }, []);

  // Track conversion
  const trackConversion = useCallback((email: string, amount?: number, orderId?: string) => {
    if (referralData.referralId || referralData.affiliateCode) {
      // Use Rewardful client to track conversion
      RewardfulClient.convert(email, amount, orderId);

      // Optionally clear referral data after conversion
      // clearReferralData();
    }
  }, [referralData.referralId, referralData.affiliateCode]);

  // Track custom events
  const trackEvent = useCallback((event: string, data?: Record<string, any>) => {
    if (referralData.hasReferral) {
      RewardfulClient.track(event, {
        ...data,
        referralId: referralData.referralId,
        affiliateCode: referralData.affiliateCode,
      });
    }
  }, [referralData]);

  return {
    ...referralData,
    trackConversion,
    trackEvent,
    clearReferralData,
  };
};

// Utility hook for referral form handling
export const useReferralForm = () => {
  const { referralId, affiliateCode, trackConversion } = useReferralTracking();

  // Get referral data for form submission
  const getReferralFormData = useCallback(() => {
    return {
      referralId: referralId || undefined,
      affiliateCode: affiliateCode || undefined,
    };
  }, [referralId, affiliateCode]);

  // Handle form submission with referral tracking
  const handleFormSubmission = useCallback((
    formData: any,
    email: string,
    amount?: number,
    orderId?: string
  ) => {
    // Track the conversion
    trackConversion(email, amount, orderId);

    // Return enhanced form data with referral info
    return {
      ...formData,
      ...getReferralFormData(),
    };
  }, [trackConversion, getReferralFormData]);

  return {
    referralId,
    affiliateCode,
    getReferralFormData,
    handleFormSubmission,
  };
};

// Component wrapper for referral tracking
export function withReferralTracking<P extends object>(
  Component: React.ComponentType<P>
) {
  const WrappedComponent = (props: P) => {
    const referralData = useReferralTracking();

    return (
      <Component
        {...props}
        referralData={referralData}
      />
    );
  };

  WrappedComponent.displayName = `withReferralTracking(${Component.displayName || Component.name})`;

  return WrappedComponent;
}