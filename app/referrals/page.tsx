'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardIcon,
  CheckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShareIcon,
  LinkIcon,
  SparklesIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { mockAffiliateStats } from '@/lib/rewardful';
import { formatCurrency } from '@/lib/calculations';
import type { AffiliateStats } from '@/lib/types';

export default function ReferralsPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats>(mockAffiliateStats);
  const [isLoading, setIsLoading] = useState(false);

  // Mock user affiliate data - in production this would come from your backend
  const affiliateData = {
    affiliateCode: 'CPN-ALPHA-123',
    affiliateLink: `https://costpernut.com?via=CPN-ALPHA-123`,
    email: 'user@example.com',
    isActive: true,
  };

  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, []);

  const shareData = [
    {
      platform: 'Twitter',
      message: `Just discovered CPN - the Cost Per Nut calculator! 🥜💰 Track your relationship ROI like a pro. Get 50% off with my referral link: ${affiliateData.affiliateLink}`,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just discovered CPN - the Cost Per Nut calculator! 🥜💰 Track your relationship ROI like a pro. Get 50% off with my referral link: ${affiliateData.affiliateLink}`)}`,
    },
    {
      platform: 'Facebook',
      message: `CPN is game-changing for tracking relationship metrics! Get 50% off: ${affiliateData.affiliateLink}`,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(affiliateData.affiliateLink)}`,
    },
    {
      platform: 'WhatsApp',
      message: `Check out CPN - Cost Per Nut calculator! Perfect for tracking relationship ROI. Get 50% off: ${affiliateData.affiliateLink}`,
      url: `https://wa.me/?text=${encodeURIComponent(`Check out CPN - Cost Per Nut calculator! Perfect for tracking relationship ROI. Get 50% off: ${affiliateData.affiliateLink}`)}`,
    },
  ];

  const handleSocialShare = (platform: { platform: string; url: string }) => {
    window.open(platform.url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="min-h-screen bg-cpn-dark">
      {/* Header */}
      <div className="border-b border-cpn-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-heading text-cpn-white">Refer Friends</h1>
              <p className="text-cpn-gray mt-1">
                Share CPN and earn 50% commission on every referral
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-sm text-green-400">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-cpn">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-cpn-gray">Total Earnings</p>
                  <p className="text-2xl font-heading text-cpn-white">
                    {formatCurrency(affiliateStats.totalEarnings)}
                  </p>
                </div>
                <div className="p-3 bg-cpn-yellow/20 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-cpn-yellow" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-400">{formatCurrency(affiliateStats.currentMonthEarnings)}</span>
                <span className="text-cpn-gray">this month</span>
              </div>
            </div>

            <div className="card-cpn">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-cpn-gray">Total Referrals</p>
                  <p className="text-2xl font-heading text-cpn-white">
                    {affiliateStats.totalConversions}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-cpn-gray">from {affiliateStats.totalClicks} clicks</span>
              </div>
            </div>

            <div className="card-cpn">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-cpn-gray">Conversion Rate</p>
                  <p className="text-2xl font-heading text-cpn-white">
                    {affiliateStats.conversionRate}%
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-cpn-gray">Above average 📈</span>
              </div>
            </div>

            <div className="card-cpn">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-cpn-gray">Pending</p>
                  <p className="text-2xl font-heading text-cpn-white">
                    {formatCurrency(affiliateStats.pendingEarnings)}
                  </p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-orange-400" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-cpn-gray">Processing...</span>
              </div>
            </div>
          </div>

          {/* Referral Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Your Referral Code & Link */}
            <div className="card-cpn">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cpn-yellow/20 rounded-lg">
                  <LinkIcon className="w-5 h-5 text-cpn-yellow" />
                </div>
                <h3 className="text-lg font-heading text-cpn-white">Your Referral Code</h3>
              </div>

              <div className="space-y-4">
                {/* Affiliate Code */}
                <div>
                  <label className="block text-sm font-medium text-cpn-gray mb-2">
                    Affiliate Code
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={affiliateData.affiliateCode}
                      readOnly
                      className="input-cpn flex-1 cursor-pointer select-all"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <button
                      onClick={() => copyToClipboard(affiliateData.affiliateCode, 'code')}
                      className="p-2 rounded-lg border border-cpn-gray/30 hover:border-cpn-yellow/50 transition-colors"
                    >
                      {copiedField === 'code' ? (
                        <CheckIcon className="w-5 h-5 text-green-400" />
                      ) : (
                        <ClipboardIcon className="w-5 h-5 text-cpn-gray" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Affiliate Link */}
                <div>
                  <label className="block text-sm font-medium text-cpn-gray mb-2">
                    Referral Link
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={affiliateData.affiliateLink}
                      readOnly
                      className="input-cpn flex-1 cursor-pointer select-all text-sm"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <button
                      onClick={() => copyToClipboard(affiliateData.affiliateLink, 'link')}
                      className="p-2 rounded-lg border border-cpn-gray/30 hover:border-cpn-yellow/50 transition-colors"
                    >
                      {copiedField === 'link' ? (
                        <CheckIcon className="w-5 h-5 text-green-400" />
                      ) : (
                        <ClipboardIcon className="w-5 h-5 text-cpn-gray" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-cpn-yellow/10 border border-cpn-yellow/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <SparklesIcon className="w-5 h-5 text-cpn-yellow mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-cpn-white mb-1">
                        50% Commission Rate
                      </p>
                      <p className="text-xs text-cpn-gray">
                        Earn $0.99 for every weekly subscription and $13.50 for lifetime purchases
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Sharing */}
            <div className="card-cpn">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <ShareIcon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-heading text-cpn-white">Share & Earn</h3>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-cpn-gray mb-4">
                  Share your referral link on social media to start earning commissions
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {shareData.map((platform) => (
                    <button
                      key={platform.platform}
                      onClick={() => handleSocialShare(platform)}
                      className="flex items-center justify-between p-3 rounded-lg border border-cpn-gray/30 hover:border-cpn-yellow/50 transition-colors group"
                    >
                      <span className="text-cpn-white font-medium">{platform.platform}</span>
                      <ShareIcon className="w-4 h-4 text-cpn-gray group-hover:text-cpn-yellow" />
                    </button>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <GiftIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-cpn-white mb-1">
                        Your Friends Get 50% Off
                      </p>
                      <p className="text-xs text-cpn-gray">
                        Everyone wins! Your referrals get their first month at 50% off
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips & Best Practices */}
          <div className="card-cpn">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrophyIcon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-heading text-cpn-white">Maximize Your Earnings</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cpn-yellow/20 flex items-center justify-center mt-0.5">
                    <span className="text-sm font-heading text-cpn-yellow">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-cpn-white mb-1">Share Your Story</h4>
                    <p className="text-sm text-cpn-gray">
                      Tell friends how CPN helped you optimize your relationship spending
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cpn-yellow/20 flex items-center justify-center mt-0.5">
                    <span className="text-sm font-heading text-cpn-yellow">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-cpn-white mb-1">Target Your Audience</h4>
                    <p className="text-sm text-cpn-gray">
                      Share with friends who are dating or interested in relationship analytics
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cpn-yellow/20 flex items-center justify-center mt-0.5">
                    <span className="text-sm font-heading text-cpn-yellow">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-cpn-white mb-1">Use Multiple Channels</h4>
                    <p className="text-sm text-cpn-gray">
                      Share on social media, send direct messages, or mention it in group chats
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-cpn-dark2 rounded-lg">
                  <h4 className="font-medium text-cpn-white mb-2">Quick Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-cpn-gray">Best performing platform:</span>
                      <span className="text-cpn-white">WhatsApp (23% CVR)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cpn-gray">Peak sharing time:</span>
                      <span className="text-cpn-white">Weekend evenings</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cpn-gray">Average per referral:</span>
                      <span className="text-cpn-white">{formatCurrency(12.5)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400 font-medium mb-1">Pro Tip</p>
                  <p className="text-xs text-cpn-gray">
                    Personalize your message! Mention specific CPN features that helped you most
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="card-cpn">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-heading text-cpn-white">Payment Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-cpn-white mb-3">How it works</h4>
                <div className="space-y-2 text-sm text-cpn-gray">
                  <p>• Commissions are calculated monthly</p>
                  <p>• Minimum payout threshold: $25</p>
                  <p>• Payments processed via PayPal or bank transfer</p>
                  <p>• Net 30 payment terms (30 days after month-end)</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-cpn-white mb-3">Next payout</h4>
                <div className="p-4 bg-cpn-dark2 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cpn-gray">Pending amount:</span>
                    <span className="font-heading text-cpn-white">
                      {formatCurrency(affiliateStats.pendingEarnings)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-cpn-gray">Payout date:</span>
                    <span className="text-sm text-cpn-white">Jan 31, 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}