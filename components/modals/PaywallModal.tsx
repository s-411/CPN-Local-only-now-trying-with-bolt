'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PaywallModalProps {
  isOpen: boolean;
  onClose?: () => void; // Made optional since we won't use it for paywall
  title?: string;
  description?: string;
}

export default function PaywallModal({ 
  isOpen, 
  onClose, 
  title = "Premium Feature",
  description = "This feature is only available in Player Mode"
}: PaywallModalProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    // TODO: Navigate to upgrade flow or results page
    // For now, navigate to onboarding results
    router.push('/onboarding/results');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <div className="bg-cpn-dark border border-cpn-gray/20 rounded-lg w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-center p-6 border-b border-cpn-gray/20">
          <h2 className="text-xl font-heading text-cpn-white">{title}</h2>
        </div>

        <div className="p-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-cpn-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-lg font-heading text-cpn-white mb-2">
              You're in Boyfriend Mode
            </h3>
            <p className="text-cpn-gray">
              {description}. Upgrade to Player Mode to unlock all features.
            </p>
          </div>

          {/* Premium Features Preview */}
          <div className="bg-cpn-dark2 border border-cpn-gray/10 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-heading text-cpn-white mb-3">What you're missing:</h4>
            <div className="space-y-2 text-sm text-cpn-gray">
              <div className="flex items-center gap-2">
                <span className="text-cpn-yellow">✨</span>
                <span>Track up to 50 girls</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cpn-yellow">📊</span>
                <span>Advanced analytics & insights</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cpn-yellow">🏆</span>
                <span>Leaderboards & competitions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cpn-yellow">🔄</span>
                <span>Unlimited data entries</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cpn-yellow">📱</span>
                <span>Sharing & export features</span>
              </div>
            </div>
          </div>

          {/* Upgrade Options */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full btn-cpn"
            >
              Activate Player Mode - $1.99/week
            </button>
            <button
              onClick={handleUpgrade}
              className="w-full btn-cpn bg-gradient-to-r from-cpn-yellow to-cpn-yellow/80 text-cpn-dark hover:from-cpn-yellow/90 hover:to-cpn-yellow/70"
            >
              Get Lifetime Access - $27
            </button>
          </div>

          <p className="text-xs text-cpn-gray mt-4">
            Cancel anytime • Secure payments via Stripe
          </p>
        </div>
      </div>
    </div>
  );
}