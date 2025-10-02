'use client';

import React, { useState } from 'react';
import { ShareIcon } from '@heroicons/react/24/outline';
import { useShare } from '@/lib/share/ShareContext';
import { ShareOptions } from '@/lib/share/types';
import { DEFAULT_PRIVACY_SETTINGS } from '@/lib/share/privacy';

interface ShareButtonProps {
  data: any;
  type: 'girl-card' | 'analytics' | 'comparison' | 'achievement';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'icon-only';
  showLabel?: boolean;
  quickShare?: boolean; // Skip preview modal for one-click sharing
}

export default function ShareButton({
  data,
  type,
  className = '',
  size = 'md',
  variant = 'secondary',
  showLabel = true,
  quickShare = false
}: ShareButtonProps) {
  const { state, actions } = useShare();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    if (isGenerating || !data) return;

    setIsGenerating(true);

    try {
      // Create share options with user preferences
      const options: ShareOptions = {
        format: state.preferences.defaultFormat,
        destination: 'clipboard',
        privacy: {
          ...state.preferences.defaultPrivacy,
          // Override some settings based on content type
          allowStatistics: type === 'girl-card' || type === 'analytics',
          allowComparisons: type === 'comparison',
          allowAchievements: type === 'achievement'
        },
        watermark: state.preferences.autoWatermark ? {
          enabled: true,
          type: 'text',
          position: 'corner',
          opacity: 0.7,
          includeDomain: true,
          includeTimestamp: true
        } : undefined
      };

      // Generate content based on type
      if (type === 'girl-card' || type === 'analytics') {
        await actions.generateStatCard(data, options);
      } else if (type === 'comparison') {
        await actions.generateComparisonReport(data, options);
      } else if (type === 'achievement') {
        // await actions.generateAchievementBadge(data, options); // TODO: Implement achievement badges
        console.warn('Achievement badges not yet implemented');
        return;
      } else {
        console.warn('Share type not yet implemented:', type);
        return;
      }

      if (quickShare && state.preferences.quickShareEnabled) {
        // Quick share via clipboard
        const success = await actions.shareViaClipboard();
        if (success) {
          // Show success feedback (could add toast here)
          console.log('Shared to clipboard successfully');
        }
      } else {
        // Open preview modal
        actions.togglePreviewModal(true);
      }
    } catch (error) {
      console.error('Failed to generate share content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Button classes based on variant
  const getButtonClasses = () => {
    const base = 'transition-colors duration-200 flex items-center gap-2';
    
    if (variant === 'primary') {
      return `${base} btn-cpn ${className}`;
    }
    
    if (variant === 'icon-only') {
      return `${base} text-cpn-gray hover:text-cpn-yellow p-1 ${className}`;
    }
    
    // Secondary variant (default)
    return `${base} text-cpn-gray hover:text-cpn-white border border-cpn-gray/30 hover:border-cpn-yellow/50 px-3 py-1.5 rounded-cpn text-sm ${className}`;
  };

  return (
    <button
      onClick={handleShare}
      disabled={isGenerating || !data}
      className={getButtonClasses()}
      title={quickShare ? 'Quick share to clipboard' : 'Share content'}
    >
      <ShareIcon 
        className={`${sizeClasses[size]} ${isGenerating ? 'animate-spin' : ''}`} 
      />
      {showLabel && variant !== 'icon-only' && (
        <span>{isGenerating ? 'Sharing...' : 'Share'}</span>
      )}
    </button>
  );
}

// Convenience components for specific use cases
export function GirlCardShareButton({ girl, className }: { girl: any; className?: string }) {
  return (
    <ShareButton
      data={girl}
      type="girl-card"
      variant="icon-only"
      size="sm"
      showLabel={false}
      className={className}
      quickShare={true}
    />
  );
}

export function AnalyticsShareButton({ data, className }: { data: any; className?: string }) {
  return (
    <ShareButton
      data={data}
      type="analytics"
      variant="secondary"
      size="md"
      className={className}
    />
  );
}

export function ComparisonShareButton({ data, className }: { data: any; className?: string }) {
  return (
    <ShareButton
      data={data}
      type="comparison"
      variant="primary"
      size="md"
      className={className}
    />
  );
}

export function AchievementShareButton({ achievement, className }: { achievement: any; className?: string }) {
  return (
    <ShareButton
      data={achievement}
      type="achievement"
      variant="secondary"
      size="sm"
      className={className}
      quickShare={true}
    />
  );
}