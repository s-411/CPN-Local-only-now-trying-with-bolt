// Achievement system types for CPN v2

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type AchievementCategory = 'milestone' | 'efficiency' | 'consistency' | 'diversity' | 'savings';

export interface Achievement {
  id: string;
  type: string;
  category: AchievementCategory;
  tier: AchievementTier;
  title: string;
  description: string;
  icon: string; // Icon name or emoji
  requirements: {
    metric: string;
    value: number;
    operator: 'gte' | 'lte' | 'eq';
  };
  points: number;
  unlockedAt?: Date;
  progress?: number; // 0-100 percentage
}

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon: string;
  tiers: {
    [key in AchievementTier]: {
      requirements: {
        metric: string;
        value: number;
        operator: 'gte' | 'lte' | 'eq';
      };
      points: number;
      suffix?: string; // Added to title (e.g., "First Steps Bronze")
    }
  };
}

export interface UserAchievements {
  unlocked: Achievement[];
  progress: { [achievementId: string]: number };
  totalPoints: number;
  tier: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
}

// Pre-defined achievement definitions
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_steps',
    category: 'milestone',
    title: 'First Steps',
    description: 'Record your first data entries',
    icon: '👶',
    tiers: {
      bronze: {
        requirements: { metric: 'totalEntries', value: 1, operator: 'gte' },
        points: 10,
        suffix: 'First Entry'
      },
      silver: {
        requirements: { metric: 'totalEntries', value: 10, operator: 'gte' },
        points: 25,
        suffix: 'Getting Started'
      },
      gold: {
        requirements: { metric: 'totalEntries', value: 25, operator: 'gte' },
        points: 50,
        suffix: 'Committed'
      },
      platinum: {
        requirements: { metric: 'totalEntries', value: 100, operator: 'gte' },
        points: 100,
        suffix: 'Data Master'
      }
    }
  },
  {
    id: 'efficiency_expert',
    category: 'efficiency',
    title: 'Efficiency Expert',
    description: 'Achieve outstanding cost per nut ratios',
    icon: '💰',
    tiers: {
      bronze: {
        requirements: { metric: 'avgCostPerNut', value: 15, operator: 'lte' },
        points: 20,
        suffix: 'Good Value'
      },
      silver: {
        requirements: { metric: 'avgCostPerNut', value: 10, operator: 'lte' },
        points: 40,
        suffix: 'Great Value'
      },
      gold: {
        requirements: { metric: 'avgCostPerNut', value: 7.5, operator: 'lte' },
        points: 75,
        suffix: 'Exceptional Value'
      },
      platinum: {
        requirements: { metric: 'avgCostPerNut', value: 5, operator: 'lte' },
        points: 150,
        suffix: 'Ultimate Efficiency'
      }
    }
  },
  {
    id: 'big_spender',
    category: 'milestone',
    title: 'Big Spender',
    description: 'Reach spending milestones',
    icon: '💸',
    tiers: {
      bronze: {
        requirements: { metric: 'totalSpent', value: 100, operator: 'gte' },
        points: 15,
        suffix: 'Getting Started'
      },
      silver: {
        requirements: { metric: 'totalSpent', value: 500, operator: 'gte' },
        points: 30,
        suffix: 'Committed'
      },
      gold: {
        requirements: { metric: 'totalSpent', value: 1000, operator: 'gte' },
        points: 60,
        suffix: 'High Roller'
      },
      platinum: {
        requirements: { metric: 'totalSpent', value: 2500, operator: 'gte' },
        points: 120,
        suffix: 'Elite Status'
      }
    }
  },
  {
    id: 'consistency_champion',
    category: 'consistency',
    title: 'Consistency Champion',
    description: 'Maintain regular tracking habits',
    icon: '📅',
    tiers: {
      bronze: {
        requirements: { metric: 'weeklyStreak', value: 2, operator: 'gte' },
        points: 25,
        suffix: 'Regular Tracker'
      },
      silver: {
        requirements: { metric: 'weeklyStreak', value: 4, operator: 'gte' },
        points: 50,
        suffix: 'Dedicated'
      },
      gold: {
        requirements: { metric: 'weeklyStreak', value: 8, operator: 'gte' },
        points: 100,
        suffix: 'Unwavering'
      },
      platinum: {
        requirements: { metric: 'weeklyStreak', value: 12, operator: 'gte' },
        points: 200,
        suffix: 'Legendary Dedication'
      }
    }
  },
  {
    id: 'diversity_master',
    category: 'diversity',
    title: 'Diversity Master',
    description: 'Track multiple profiles',
    icon: '🌈',
    tiers: {
      bronze: {
        requirements: { metric: 'totalGirls', value: 3, operator: 'gte' },
        points: 20,
        suffix: 'Variety Seeker'
      },
      silver: {
        requirements: { metric: 'totalGirls', value: 5, operator: 'gte' },
        points: 40,
        suffix: 'Explorer'
      },
      gold: {
        requirements: { metric: 'totalGirls', value: 10, operator: 'gte' },
        points: 80,
        suffix: 'Connoisseur'
      },
      platinum: {
        requirements: { metric: 'totalGirls', value: 20, operator: 'gte' },
        points: 160,
        suffix: 'Master Collector'
      }
    }
  },
  {
    id: 'nut_master',
    category: 'milestone',
    title: 'Nut Master',
    description: 'Achieve high nut counts',
    icon: '🥜',
    tiers: {
      bronze: {
        requirements: { metric: 'totalNuts', value: 50, operator: 'gte' },
        points: 15,
        suffix: 'Getting Started'
      },
      silver: {
        requirements: { metric: 'totalNuts', value: 100, operator: 'gte' },
        points: 35,
        suffix: 'Productive'
      },
      gold: {
        requirements: { metric: 'totalNuts', value: 250, operator: 'gte' },
        points: 70,
        suffix: 'High Achiever'
      },
      platinum: {
        requirements: { metric: 'totalNuts', value: 500, operator: 'gte' },
        points: 140,
        suffix: 'Elite Performance'
      }
    }
  },
  {
    id: 'time_warrior',
    category: 'milestone',
    title: 'Time Warrior',
    description: 'Accumulate significant time tracked',
    icon: '⏰',
    tiers: {
      bronze: {
        requirements: { metric: 'totalTimeHours', value: 10, operator: 'gte' },
        points: 20,
        suffix: 'Getting Started'
      },
      silver: {
        requirements: { metric: 'totalTimeHours', value: 25, operator: 'gte' },
        points: 40,
        suffix: 'Dedicated'
      },
      gold: {
        requirements: { metric: 'totalTimeHours', value: 50, operator: 'gte' },
        points: 80,
        suffix: 'Time Investment'
      },
      platinum: {
        requirements: { metric: 'totalTimeHours', value: 100, operator: 'gte' },
        points: 160,
        suffix: 'Master of Time'
      }
    }
  }
];

// Utility functions
export function calculateUserTier(totalPoints: number): UserAchievements['tier'] {
  if (totalPoints >= 1000) return 'master';
  if (totalPoints >= 500) return 'expert';
  if (totalPoints >= 250) return 'advanced';
  if (totalPoints >= 100) return 'intermediate';
  return 'beginner';
}

export function getTierColor(tier: AchievementTier): string {
  const colors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0', 
    gold: '#FFD700',
    platinum: '#E5E4E2'
  };
  return colors[tier];
}

export function getTierIcon(tier: AchievementTier): string {
  const icons = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎'
  };
  return icons[tier];
}