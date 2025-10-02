'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { rewardfulAPI, RewardfulClient } from '@/lib/rewardful';
import { useReferralTracking } from '@/lib/hooks/useReferralTracking';
import { GiftIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface OnboardingData {
  girlData: {
    name: string;
    age: number;
    ethnicity?: string;
    hairColor?: string;
    rating: number;
  };
  expenseData: {
    date: string;
    amountSpent: number;
    durationMinutes: number;
    numberOfNuts: number;
  };
  emailData: {
    email: string;
  };
}

interface CPNResults {
  costPerNut: number;
  timePerNut: number;
  costPerHour: number;
  nutsPerHour: number;
}

export default function OnboardingResults() {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [cpnResults, setCpnResults] = useState<CPNResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [affiliateCreated, setAffiliateCreated] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  // Hook for tracking referrals
  const { referralId, affiliateCode: referralAffiliateCode, trackConversion, trackEvent } = useReferralTracking();

  // Create affiliate account for the user
  const createAffiliateAccount = async (email: string, firstName?: string) => {
    try {
      // Check if affiliate already exists
      const existingAffiliate = await rewardfulAPI.getAffiliateByEmail(email);

      if (existingAffiliate) {
        // Affiliate already exists
        setAffiliateCode(existingAffiliate.token);
        setAffiliateCreated(true);
        console.log('Affiliate already exists:', existingAffiliate.token);
        return;
      }

      // Create new affiliate
      const affiliate = await rewardfulAPI.createAffiliate(email, firstName);
      setAffiliateCode(affiliate.token);
      setAffiliateCreated(true);

      console.log('Affiliate created successfully:', affiliate.token);
    } catch (error) {
      console.error('Error creating affiliate:', error);
      // Don't show error to user - affiliate creation is a bonus feature
      // They can still use the app normally without affiliate functionality
    }
  };

  useEffect(() => {
    // Load all onboarding data from sessionStorage
    try {
      const girlDataRaw = sessionStorage.getItem('onboarding_girl_data');
      const expenseDataRaw = sessionStorage.getItem('onboarding_expense_data');
      const emailDataRaw = sessionStorage.getItem('onboarding_email_data');

      if (girlDataRaw && expenseDataRaw && emailDataRaw) {
        const girlData = JSON.parse(girlDataRaw);
        const expenseData = JSON.parse(expenseDataRaw);
        const emailData = JSON.parse(emailDataRaw);

        const data: OnboardingData = {
          girlData,
          expenseData,
          emailData
        };

        setOnboardingData(data);

        // Calculate CPN results
        const costPerNut = expenseData.amountSpent / expenseData.numberOfNuts;
        const timePerNut = expenseData.durationMinutes / expenseData.numberOfNuts;
        const costPerHour = expenseData.amountSpent / (expenseData.durationMinutes / 60);
        const nutsPerHour = expenseData.numberOfNuts / (expenseData.durationMinutes / 60);

        setCpnResults({
          costPerNut: parseFloat(costPerNut.toFixed(2)),
          timePerNut: parseFloat(timePerNut.toFixed(1)),
          costPerHour: parseFloat(costPerHour.toFixed(2)),
          nutsPerHour: parseFloat(nutsPerHour.toFixed(1))
        });

        // Create affiliate account automatically
        createAffiliateAccount(emailData.email, girlData.name);
      } else {
        // Redirect back to step 1 if data is missing
        router.push('/onboarding/step-1');
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      router.push('/onboarding/step-1');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handlePlayerMode = () => {
    // Track the subscription intent
    trackEvent('subscription_intent', {
      plan: 'player_mode',
      amount: 1.99,
      billing_cycle: 'weekly'
    });

    // TODO: Integrate Stripe checkout for Player Mode ($1.99/week)
    // When Stripe is integrated, add trackConversion call after successful payment
    if (onboardingData?.emailData?.email) {
      // This would be called after successful Stripe payment
      // trackConversion(onboardingData.emailData.email, 1.99, 'player_mode_weekly');

      console.log('Player Mode selected - conversion tracking ready for Stripe integration');
      console.log('Referral data:', { referralId, referralAffiliateCode });
    }

    alert('Player Mode checkout will be integrated with Stripe');
  };

  const handleLifetimeAccess = () => {
    // Track the subscription intent
    trackEvent('subscription_intent', {
      plan: 'lifetime_access',
      amount: 27,
      billing_cycle: 'lifetime'
    });

    // TODO: Integrate Stripe checkout for Lifetime Access ($27 one-time)
    // When Stripe is integrated, add trackConversion call after successful payment
    if (onboardingData?.emailData?.email) {
      // This would be called after successful Stripe payment
      // trackConversion(onboardingData.emailData.email, 27, 'lifetime_access');

      console.log('Lifetime Access selected - conversion tracking ready for Stripe integration');
      console.log('Referral data:', { referralId, referralAffiliateCode });
    }

    alert('Lifetime Access checkout will be integrated with Stripe');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cpn-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cpn-yellow mx-auto mb-4"></div>
          <p className="text-cpn-gray">Calculating your results...</p>
        </div>
      </div>
    );
  }

  if (!onboardingData || !cpnResults) {
    return (
      <div className="min-h-screen bg-cpn-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-cpn-gray mb-4">Something went wrong loading your results</p>
          <button 
            onClick={() => router.push('/onboarding/step-1')} 
            className="btn-cpn"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cpn-dark">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-cpn-white mb-2">
            🎉 Your CPN Results
          </h1>
          <p className="text-cpn-gray">
            Here's your cost per nut analysis for {onboardingData.girlData.name}
          </p>
        </div>

        {/* Main CPN Display */}
        <div className="bg-gradient-to-br from-cpn-yellow/20 to-cpn-yellow/5 border-2 border-cpn-yellow/50 rounded-2xl p-8 mb-8 text-center">
          <div className="mb-6">
            <p className="text-lg text-cpn-gray mb-2">Your Cost Per Nut</p>
            <div className="text-6xl font-heading text-cpn-yellow mb-2">
              ${cpnResults.costPerNut}
            </div>
            <p className="text-cpn-gray">per nut</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-cpn-dark2/50 rounded-lg p-4">
              <p className="text-sm text-cpn-gray mb-1">Time per Nut</p>
              <p className="text-xl font-heading text-cpn-white">{cpnResults.timePerNut} min</p>
            </div>
            <div className="bg-cpn-dark2/50 rounded-lg p-4">
              <p className="text-sm text-cpn-gray mb-1">Cost per Hour</p>
              <p className="text-xl font-heading text-cpn-white">${cpnResults.costPerHour}</p>
            </div>
            <div className="bg-cpn-dark2/50 rounded-lg p-4">
              <p className="text-sm text-cpn-gray mb-1">Nuts per Hour</p>
              <p className="text-xl font-heading text-cpn-white">{cpnResults.nutsPerHour}</p>
            </div>
          </div>
        </div>

        {/* Affiliate Program Notification */}
        {affiliateCreated && affiliateCode && (
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <GiftIcon className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-heading text-cpn-white mb-2">
                  🎉 You're now a CPN Affiliate!
                </h3>
                <p className="text-cpn-gray mb-4">
                  Congratulations! You've been automatically enrolled in our affiliate program.
                  Earn 50% commission by referring friends to CPN.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-cpn-dark2 rounded-lg">
                    <span className="text-sm text-cpn-gray">Your code:</span>
                    <span className="text-sm font-mono text-cpn-yellow">{affiliateCode}</span>
                  </div>
                  <button
                    onClick={() => router.push('/referrals')}
                    className="flex items-center gap-2 px-4 py-2 bg-cpn-yellow text-cpn-dark rounded-lg hover:bg-cpn-yellow/90 transition-colors text-sm font-medium"
                  >
                    <UserGroupIcon className="w-4 h-4" />
                    View Affiliate Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Options */}
        <div className="bg-cpn-dark2 border border-cpn-gray/20 rounded-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-heading text-cpn-white mb-3">
              Choose Your Mode
            </h2>
            <p className="text-cpn-gray mb-4">
              You're currently in <strong className="text-cpn-yellow">Boyfriend Mode</strong> and can only add one girl. 
              Activate <strong className="text-cpn-white">Player Mode</strong> to add up to 50 girls or grab 
              <strong className="text-cpn-white"> Lifetime Access</strong> for $27 one-time payment.
            </p>
          </div>

          <div className="space-y-4">
            {/* Current Mode - Boyfriend Mode */}
            <div className="bg-cpn-dark border border-cpn-gray/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-heading text-cpn-white">
                    Boyfriend Mode <span className="text-sm text-cpn-yellow">(Current)</span>
                  </h3>
                  <p className="text-sm text-cpn-gray">
                    Limited to 1 girl • Basic dashboard access
                  </p>
                </div>
                <div className="text-lg font-heading text-cpn-gray">
                  FREE
                </div>
              </div>
            </div>

            {/* Player Mode */}
            <div className="bg-cpn-dark border border-cpn-yellow/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-heading text-cpn-white">Player Mode</h3>
                  <p className="text-sm text-cpn-gray">
                    Up to 50 girls • Analytics • Leaderboards • All features
                  </p>
                </div>
                <div className="text-lg font-heading text-cpn-yellow">
                  $1.99/week
                </div>
              </div>
              <button 
                onClick={handlePlayerMode}
                className="w-full btn-cpn"
              >
                Activate Player Mode
              </button>
            </div>

            {/* Lifetime Access */}
            <div className="bg-cpn-dark border border-cpn-yellow/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-heading text-cpn-white">
                    Lifetime Access <span className="text-xs text-cpn-yellow bg-cpn-yellow/20 px-2 py-1 rounded">BEST VALUE</span>
                  </h3>
                  <p className="text-sm text-cpn-gray">
                    Everything in Player Mode • API access • Priority support • Forever
                  </p>
                </div>
                <div>
                  <div className="text-lg font-heading text-cpn-yellow">$27</div>
                  <div className="text-xs text-cpn-gray">one-time</div>
                </div>
              </div>
              <button 
                onClick={handleLifetimeAccess}
                className="w-full btn-cpn bg-gradient-to-r from-cpn-yellow to-cpn-yellow/80 text-cpn-dark hover:from-cpn-yellow/90 hover:to-cpn-yellow/70"
              >
                Get Lifetime Access
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cpn-gray/10">
            <p className="text-xs text-cpn-gray text-center">
              All payments are secure and processed through Stripe. Cancel anytime for weekly subscriptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}