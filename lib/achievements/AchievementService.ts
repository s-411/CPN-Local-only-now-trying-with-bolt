// Achievement tracking and management service

import { 
  Achievement, 
  AchievementDefinition, 
  UserAchievements, 
  AchievementTier,
  ACHIEVEMENT_DEFINITIONS,
  calculateUserTier 
} from './types';
import { GirlWithMetrics, DataEntry, GlobalStats } from '../types';

export class AchievementService {
  private static instance: AchievementService;
  private userAchievements: UserAchievements;

  private constructor() {
    this.userAchievements = this.loadUserAchievements();
  }

  static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  /**
   * Check for new achievements based on current user stats
   */
  checkAchievements(girls: GirlWithMetrics[], entries: DataEntry[], globalStats: GlobalStats): Achievement[] {
    const newAchievements: Achievement[] = [];
    const metrics = this.calculateMetrics(girls, entries, globalStats);

    for (const definition of ACHIEVEMENT_DEFINITIONS) {
      const newUnlocks = this.checkAchievementDefinition(definition, metrics);
      newAchievements.push(...newUnlocks);
    }

    if (newAchievements.length > 0) {
      this.userAchievements.unlocked.push(...newAchievements);
      this.userAchievements.totalPoints = this.userAchievements.unlocked.reduce(
        (sum, achievement) => sum + achievement.points, 
        0
      );
      this.userAchievements.tier = calculateUserTier(this.userAchievements.totalPoints);
      this.saveUserAchievements();
    }

    return newAchievements;
  }

  /**
   * Get current user achievements
   */
  getUserAchievements(): UserAchievements {
    return { ...this.userAchievements };
  }

  /**
   * Get progress towards next tier for a specific achievement
   */
  getAchievementProgress(achievementId: string, metrics: any): { current: number; total: number; percentage: number } {
    const definition = ACHIEVEMENT_DEFINITIONS.find(def => def.id === achievementId);
    if (!definition) return { current: 0, total: 100, percentage: 0 };

    const currentTier = this.getCurrentTier(achievementId);
    const nextTier = this.getNextTier(currentTier);
    
    if (!nextTier) return { current: 100, total: 100, percentage: 100 };

    const requirements = definition.tiers[nextTier].requirements;
    const currentValue = this.getMetricValue(metrics, requirements.metric);
    const targetValue = requirements.value;

    let percentage: number;
    if (requirements.operator === 'gte') {
      percentage = Math.min((currentValue / targetValue) * 100, 100);
    } else if (requirements.operator === 'lte') {
      percentage = currentValue <= targetValue ? 100 : Math.max(((targetValue / currentValue) * 100), 0);
    } else {
      percentage = currentValue === targetValue ? 100 : 0;
    }

    return {
      current: currentValue,
      total: targetValue,
      percentage: Math.round(percentage)
    };
  }

  /**
   * Generate shareable achievement badge
   */
  async generateAchievementBadge(achievement: Achievement): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Canvas context not available');

    // Draw background with tier-based gradient
    const tierColor = this.getTierColor(achievement.tier);
    const gradient = ctx.createRadialGradient(300, 200, 0, 300, 200, 300);
    gradient.addColorStop(0, tierColor + '40');
    gradient.addColorStop(1, '#1f1f1f');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = tierColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Draw tier icon/badge
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.getTierIcon(achievement.tier), 300, 120);

    // Draw achievement title
    ctx.fillStyle = tierColor;
    ctx.font = 'bold 36px Arial';
    ctx.fillText(achievement.title, 300, 180);

    // Draw achievement description
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(achievement.description, 300, 220);

    // Draw points
    ctx.fillStyle = '#f2f661';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`+${achievement.points} points`, 300, 260);

    // Draw unlock date
    if (achievement.unlockedAt) {
      ctx.fillStyle = '#ababab';
      ctx.font = '16px Arial';
      ctx.fillText(
        `Unlocked: ${achievement.unlockedAt.toLocaleDateString()}`, 
        300, 
        320
      );
    }

    // Draw watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Generated with CPN v2', canvas.width - 30, canvas.height - 30);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 0.95);
    });
  }

  /**
   * Get all available achievements with progress
   */
  getAllAchievementsWithProgress(metrics: any): Array<{
    definition: AchievementDefinition;
    unlockedTiers: AchievementTier[];
    progress: { tier: AchievementTier; progress: number }[];
  }> {
    return ACHIEVEMENT_DEFINITIONS.map(definition => {
      const unlockedTiers = this.getUnlockedTiers(definition.id);
      const progress = (['bronze', 'silver', 'gold', 'platinum'] as AchievementTier[]).map(tier => ({
        tier,
        progress: unlockedTiers.includes(tier) ? 100 : this.calculateTierProgress(definition, tier, metrics)
      }));

      return {
        definition,
        unlockedTiers,
        progress
      };
    });
  }

  // Private helper methods

  private checkAchievementDefinition(definition: AchievementDefinition, metrics: any): Achievement[] {
    const newAchievements: Achievement[] = [];
    const unlockedIds = new Set(this.userAchievements.unlocked.map(a => a.id));

    for (const tier of ['bronze', 'silver', 'gold', 'platinum'] as AchievementTier[]) {
      const achievementId = `${definition.id}_${tier}`;
      
      if (unlockedIds.has(achievementId)) continue;

      const tierData = definition.tiers[tier];
      if (this.meetsRequirements(tierData.requirements, metrics)) {
        const achievement: Achievement = {
          id: achievementId,
          type: definition.id,
          category: definition.category,
          tier,
          title: `${definition.title} ${tierData.suffix || tier.charAt(0).toUpperCase() + tier.slice(1)}`,
          description: definition.description,
          icon: definition.icon,
          requirements: tierData.requirements,
          points: tierData.points,
          unlockedAt: new Date()
        };

        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  private meetsRequirements(requirements: { metric: string; value: number; operator: 'gte' | 'lte' | 'eq' }, metrics: any): boolean {
    const currentValue = this.getMetricValue(metrics, requirements.metric);

    switch (requirements.operator) {
      case 'gte':
        return currentValue >= requirements.value;
      case 'lte':
        return currentValue <= requirements.value;
      case 'eq':
        return currentValue === requirements.value;
      default:
        return false;
    }
  }

  private getMetricValue(metrics: any, metricName: string): number {
    // Map metric names to actual values
    switch (metricName) {
      case 'totalEntries':
        return metrics.totalEntries || 0;
      case 'totalSpent':
        return metrics.totalSpent || 0;
      case 'totalNuts':
        return metrics.totalNuts || 0;
      case 'totalGirls':
        return metrics.totalGirls || 0;
      case 'avgCostPerNut':
        return metrics.avgCostPerNut || 0;
      case 'totalTimeHours':
        return (metrics.totalTime || 0) / 60; // Convert minutes to hours
      case 'weeklyStreak':
        return metrics.weeklyStreak || 0;
      default:
        return 0;
    }
  }

  private calculateMetrics(girls: GirlWithMetrics[], entries: DataEntry[], globalStats: GlobalStats): any {
    const totalEntries = entries.length;
    const avgCostPerNut = globalStats.totalNuts > 0 ? globalStats.totalSpent / globalStats.totalNuts : 0;
    const weeklyStreak = this.calculateWeeklyStreak(entries);

    return {
      totalEntries,
      totalSpent: globalStats.totalSpent,
      totalNuts: globalStats.totalNuts,
      totalGirls: girls.length,
      totalTime: globalStats.totalTime,
      avgCostPerNut,
      weeklyStreak
    };
  }

  private calculateWeeklyStreak(entries: DataEntry[]): number {
    if (entries.length === 0) return 0;

    // Sort entries by date
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Calculate weeks with at least one entry
    const weeksWithEntries = new Set<string>();
    sortedEntries.forEach(entry => {
      const date = new Date(entry.date);
      const weekKey = this.getWeekKey(date);
      weeksWithEntries.add(weekKey);
    });

    // Calculate current streak
    let streak = 0;
    const now = new Date();
    let currentWeek = this.getWeekKey(now);

    while (weeksWithEntries.has(currentWeek)) {
      streak++;
      const weekDate = new Date(currentWeek);
      weekDate.setDate(weekDate.getDate() - 7);
      currentWeek = this.getWeekKey(weekDate);
    }

    return streak;
  }

  private getWeekKey(date: Date): string {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek.toISOString().split('T')[0];
  }

  private getCurrentTier(achievementId: string): AchievementTier | null {
    const unlocked = this.userAchievements.unlocked
      .filter(a => a.type === achievementId)
      .sort((a, b) => this.getTierValue(b.tier) - this.getTierValue(a.tier));
    
    return unlocked.length > 0 ? unlocked[0].tier : null;
  }

  private getNextTier(currentTier: AchievementTier | null): AchievementTier | null {
    const tiers: AchievementTier[] = ['bronze', 'silver', 'gold', 'platinum'];
    if (!currentTier) return 'bronze';
    
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  }

  private getTierValue(tier: AchievementTier): number {
    const values = { bronze: 1, silver: 2, gold: 3, platinum: 4 };
    return values[tier];
  }

  private getUnlockedTiers(achievementType: string): AchievementTier[] {
    return this.userAchievements.unlocked
      .filter(a => a.type === achievementType)
      .map(a => a.tier);
  }

  private calculateTierProgress(definition: AchievementDefinition, tier: AchievementTier, metrics: any): number {
    const requirements = definition.tiers[tier].requirements;
    const currentValue = this.getMetricValue(metrics, requirements.metric);
    const targetValue = requirements.value;

    if (requirements.operator === 'gte') {
      return Math.min((currentValue / targetValue) * 100, 100);
    } else if (requirements.operator === 'lte') {
      return currentValue <= targetValue ? 100 : 0;
    } else {
      return currentValue === targetValue ? 100 : 0;
    }
  }

  private getTierColor(tier: AchievementTier): string {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2'
    };
    return colors[tier];
  }

  private getTierIcon(tier: AchievementTier): string {
    const icons = {
      bronze: '🥉',
      silver: '🥈', 
      gold: '🥇',
      platinum: '💎'
    };
    return icons[tier];
  }

  private loadUserAchievements(): UserAchievements {
    try {
      const stored = localStorage.getItem('cpn-user-achievements');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          unlocked: parsed.unlocked.map((a: any) => ({
            ...a,
            unlockedAt: new Date(a.unlockedAt)
          }))
        };
      }
    } catch (error) {
      console.warn('Failed to load user achievements:', error);
    }

    return {
      unlocked: [],
      progress: {},
      totalPoints: 0,
      tier: 'beginner'
    };
  }

  private saveUserAchievements(): void {
    try {
      localStorage.setItem('cpn-user-achievements', JSON.stringify(this.userAchievements));
    } catch (error) {
      console.warn('Failed to save user achievements:', error);
    }
  }
}