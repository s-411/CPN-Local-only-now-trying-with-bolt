// Core sharing service for CPN v2

import { ShareableContent, ShareOptions, ShareFormat, SharePrivacySettings, ShareHistoryEntry, URLShareData } from './types';
import { PrivacyFilter } from './privacy';
import { GirlWithMetrics, DataEntry, GlobalStats } from '../types';

export class ShareService {
  private static instance: ShareService;
  private shareHistory: ShareHistoryEntry[] = [];

  private constructor() {
    // Only load history on client-side
    if (typeof window !== 'undefined') {
      this.loadShareHistory();
    }
  }

  static getInstance(): ShareService {
    if (!ShareService.instance) {
      ShareService.instance = new ShareService();
    }
    return ShareService.instance;
  }

  /**
   * Generate a shareable statistics card
   */
  async generateStatCard(girl: GirlWithMetrics, options: ShareOptions): Promise<ShareableContent> {
    // Apply privacy filtering
    const filteredGirl = PrivacyFilter.filterGirlData(girl, options.privacy);

    const content = {
      type: 'efficiency' as const,
      title: `${filteredGirl.name || 'Anonymous'} Statistics`,
      data: {
        name: filteredGirl.name,
        rating: filteredGirl.rating,
        metrics: filteredGirl.metrics,
        totalEntries: filteredGirl.totalEntries
      },
      style: {
        theme: 'dark' as const,
        accentColor: '#f2f661', // CPN yellow
        branding: 'minimal' as const,
        size: 'standard' as const
      }
    };

    const shareableContent: ShareableContent = {
      id: this.generateId(),
      type: 'card',
      content,
      metadata: {
        generatedAt: new Date(),
        privacy: options.privacy,
        watermark: options.watermark || { enabled: true, type: 'text', position: 'corner', opacity: 0.7, includeDomain: true, includeTimestamp: true }
      }
    };

    // Validate privacy compliance
    if (!PrivacyFilter.validateShareableContent(shareableContent, options.privacy)) {
      throw new Error('Content violates privacy settings');
    }

    return shareableContent;
  }

  /**
   * Generate an achievement badge for sharing
   */
  async generateAchievementBadge(achievement: any, options: ShareOptions): Promise<ShareableContent> {
    const content = {
      type: 'achievement' as const,
      title: `Achievement Unlocked: ${achievement.title}`,
      data: {
        ...achievement,
        tier: achievement.tier,
        points: achievement.points,
        unlockedAt: achievement.unlockedAt
      },
      style: {
        theme: 'dark' as const,
        accentColor: this.getTierColor(achievement.tier),
        branding: 'minimal' as const,
        size: 'standard' as const
      }
    };

    const shareableContent: ShareableContent = {
      id: this.generateId(),
      type: 'badge',
      content,
      metadata: {
        generatedAt: new Date(),
        privacy: options.privacy,
        watermark: options.watermark || { enabled: true, type: 'text', position: 'corner', opacity: 0.7, includeDomain: true, includeTimestamp: true }
      }
    };

    return shareableContent;
  }

  /**
   * Generate a comparison report
   */
  async generateComparisonReport(userStats: GlobalStats, options: ShareOptions): Promise<ShareableContent> {
    // Mock global data for comparison (in real app, this would come from aggregated data)
    const globalAvg = {
      avgCostPerNut: 12.50,
      avgEfficiency: 0.75,
      medianSpending: 500
    };

    const userCostPerNut = userStats.totalSpent / userStats.totalNuts;
    
    const content = {
      userMetrics: {
        costPerNut: options.privacy.showExactValues ? userCostPerNut : 0,
        efficiency: userStats.totalNuts / userStats.totalTime,
        totalSpent: options.privacy.showExactValues ? userStats.totalSpent : 0,
        percentile: this.calculatePercentile(userCostPerNut, globalAvg.avgCostPerNut)
      },
      globalMetrics: globalAvg,
      insights: this.generateInsights(userStats, globalAvg),
      recommendations: this.generateRecommendations(userStats),
      privacyLevel: options.privacy.showExactValues ? 'full' : 'partial'
    };

    // Apply privacy filtering
    const filteredContent = PrivacyFilter.applyPrivacySettings(content, options.privacy);

    const shareableContent: ShareableContent = {
      id: this.generateId(),
      type: 'comparison',
      content: filteredContent,
      metadata: {
        generatedAt: new Date(),
        privacy: options.privacy,
        watermark: options.watermark || { enabled: true, type: 'text', position: 'corner', opacity: 0.7, includeDomain: true, includeTimestamp: true }
      }
    };

    return shareableContent;
  }

  /**
   * Convert content to specified format
   */
  async toFormat(content: ShareableContent, format: ShareFormat): Promise<string | Blob> {
    switch (format) {
      case 'json':
        return JSON.stringify(content, null, 2);
      
      case 'markdown':
        return this.toMarkdown(content);
      
      case 'html':
        return this.toHTML(content);
      
      case 'image':
        return await this.toImage(content);
      
      case 'pdf':
        // PDF generation would require additional library
        throw new Error('PDF generation not yet implemented');
      
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Share content via clipboard
   */
  async shareViaClipboard(content: ShareableContent, format: ShareFormat = 'json'): Promise<boolean> {
    try {
      const formattedContent = await this.toFormat(content, format);
      
      if (typeof formattedContent === 'string') {
        await navigator.clipboard.writeText(formattedContent);
      } else {
        // For images, copy as blob (limited browser support)
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': formattedContent })
        ]);
      }

      this.addToHistory(content, format, 'clipboard');
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Share content via download
   */
  async shareViaDownload(content: ShareableContent, format: ShareFormat, filename?: string): Promise<void> {
    const formattedContent = await this.toFormat(content, format);
    const defaultFilename = `cpn-share-${content.type}-${Date.now()}`;
    const finalFilename = filename || `${defaultFilename}.${this.getFileExtension(format)}`;

    let blob: Blob;
    if (typeof formattedContent === 'string') {
      blob = new Blob([formattedContent], { type: this.getMimeType(format) });
    } else {
      blob = formattedContent;
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.addToHistory(content, format, 'download');
  }

  /**
   * Generate URL for sharing
   */
  async shareViaURL(content: ShareableContent): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('URL sharing not available on server-side');
    }

    // Compress and encode content for URL
    const compressed = this.compressData(JSON.stringify(content));
    const encoded = btoa(compressed);

    const urlData: URLShareData = {
      version: '1',
      type: content.type as any,
      data: encoded,
      expires: content.metadata.privacy.expirationTime ?
        Date.now() + (content.metadata.privacy.expirationTime * 60 * 60 * 1000) : undefined
    };

    // Create shareable URL with hash
    const hashData = `v${urlData.version}:${urlData.type}:${urlData.data}${urlData.expires ? ':' + urlData.expires : ''}`;
    const shareUrl = `${window.location.origin}/share#${hashData}`;

    // Check URL length (browser limit ~2048 chars)
    if (shareUrl.length > 2000) {
      throw new Error('Content too large for URL sharing. Try downloading instead.');
    }

    this.addToHistory(content, 'json', 'url');
    return shareUrl;
  }

  /**
   * Get share history
   */
  getShareHistory(): ShareHistoryEntry[] {
    // Ensure history is loaded on first access
    if (typeof window !== 'undefined' && this.shareHistory.length === 0) {
      this.loadShareHistory();
    }
    return [...this.shareHistory];
  }

  /**
   * Clear share history
   */
  clearShareHistory(): void {
    this.shareHistory = [];
    this.saveShareHistory();
  }

  // Private helper methods

  private generateId(): string {
    return `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculatePercentile(userValue: number, avgValue: number): number {
    // Simple percentile calculation - in real app would use more sophisticated algorithm
    const ratio = userValue / avgValue;
    if (ratio <= 0.5) return 95; // Very efficient
    if (ratio <= 0.75) return 80;
    if (ratio <= 1.0) return 60;
    if (ratio <= 1.25) return 40;
    return 20; // Less efficient
  }

  private generateInsights(userStats: GlobalStats, globalAvg: any): string[] {
    const insights: string[] = [];
    const userCostPerNut = userStats.totalSpent / userStats.totalNuts;
    
    if (userCostPerNut < globalAvg.avgCostPerNut) {
      insights.push('You\'re more cost-efficient than the average user!');
    } else {
      insights.push('There\'s room to improve your cost efficiency.');
    }

    if (userStats.totalGirls >= 5) {
      insights.push('You have good diversity in your tracking.');
    }

    return insights;
  }

  private generateRecommendations(userStats: GlobalStats): string[] {
    const recommendations: string[] = [];
    
    recommendations.push('Track more data points for better insights');
    recommendations.push('Set weekly efficiency goals');
    
    if (userStats.totalGirls < 3) {
      recommendations.push('Consider diversifying your tracking');
    }

    return recommendations;
  }

  private toMarkdown(content: ShareableContent): string {
    if (content.type === 'card') {
      const data = content.content.data;
      return `# CPN Statistics\n\n**${data.name || 'Anonymous'}** (Rating: ${data.rating}/10)\n\n- **Total Spent**: $${data.metrics.totalSpent.toFixed(2)}\n- **Total Nuts**: ${data.metrics.totalNuts}\n- **Cost per Nut**: $${data.metrics.costPerNut.toFixed(2)}\n- **Entries**: ${data.totalEntries}\n\n*Generated with CPN v2*`;
    }

    if (content.type === 'comparison') {
      const data = content.content;
      return `# CPN Performance Report\n\n## Your Stats\n- **Cost per Nut**: $${data.userMetrics.costPerNut.toFixed(2)}\n- **Percentile**: Top ${100 - (data.userMetrics.percentile || 50)}%\n\n## Insights\n${data.insights.map((insight: string) => `- ${insight}`).join('\n')}\n\n*Generated with CPN v2*`;
    }

    return `# CPN Share\n\n${JSON.stringify(content.content, null, 2)}\n\n*Generated with CPN v2*`;
  }

  private toHTML(content: ShareableContent): string {
    const watermark = content.metadata.watermark.enabled ? 
      `<div style="opacity: ${content.metadata.watermark.opacity}; font-size: 12px; color: #666;">Generated with CPN v2</div>` : '';

    if (content.type === 'card') {
      const data = content.content.data;
      return `
        <div style="background: #1f1f1f; color: white; padding: 20px; border-radius: 12px; max-width: 400px; font-family: Arial, sans-serif;">
          <h2 style="color: #f2f661; margin-top: 0;">${data.name || 'Anonymous'} Stats</h2>
          <p><strong>Rating:</strong> ${data.rating}/10</p>
          <p><strong>Total Spent:</strong> $${data.metrics.totalSpent.toFixed(2)}</p>
          <p><strong>Cost per Nut:</strong> $${data.metrics.costPerNut.toFixed(2)}</p>
          <p><strong>Total Entries:</strong> ${data.totalEntries}</p>
          ${watermark}
        </div>
      `;
    }

    return `<div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">${JSON.stringify(content.content, null, 2)}</div>`;
  }

  private async toImage(content: ShareableContent): Promise<Blob> {
    if (content.type === 'card') {
      const { CardGenerator } = await import('./generators/CardGenerator');
      return CardGenerator.generateGirlCard(content.content.data);
    } else if (content.type === 'comparison') {
      const { CardGenerator } = await import('./generators/CardGenerator');
      return CardGenerator.generateComparisonCard(content.content);
    } else if (content.type === 'badge') {
      const { BadgeGenerator } = await import('./generators/BadgeGenerator');
      return BadgeGenerator.generateBadge(content.content.data);
    }

    // Fallback to basic canvas generation for other types
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Canvas context not available');

    // Draw background
    ctx.fillStyle = '#1f1f1f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw generic content
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText('CPN Share', 40, 60);

    ctx.fillStyle = '#f2f661';
    ctx.font = '16px Arial';
    ctx.fillText(JSON.stringify(content.content, null, 2).substring(0, 200), 40, 120);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });
  }

  private compressData(data: string): string {
    // Simple compression - in production would use LZ-string or similar
    return data;
  }

  private getFileExtension(format: ShareFormat): string {
    const extensions = {
      'json': 'json',
      'markdown': 'md',
      'html': 'html',
      'image': 'png',
      'pdf': 'pdf'
    };
    return extensions[format] || 'txt';
  }

  private getMimeType(format: ShareFormat): string {
    const mimeTypes = {
      'json': 'application/json',
      'markdown': 'text/markdown',
      'html': 'text/html',
      'image': 'image/png',
      'pdf': 'application/pdf'
    };
    return mimeTypes[format] || 'text/plain';
  }

  private addToHistory(content: ShareableContent, format: ShareFormat, destination: string): void {
    const entry: ShareHistoryEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      type: content.type,
      format,
      privacyLevel: content.metadata.privacy.showExactValues ? 'full' : 'partial',
      expired: false,
      contentHash: this.generateContentHash(content)
    };

    this.shareHistory.unshift(entry); // Add to beginning
    
    // Keep only last 50 entries
    if (this.shareHistory.length > 50) {
      this.shareHistory = this.shareHistory.slice(0, 50);
    }

    this.saveShareHistory();
  }

  private generateContentHash(content: ShareableContent): string {
    // Simple hash for duplicate detection
    return btoa(JSON.stringify(content)).slice(0, 16);
  }

  private loadShareHistory(): void {
    try {
      if (typeof window === 'undefined') {
        this.shareHistory = [];
        return;
      }
      const stored = localStorage.getItem('cpn-share-history');
      if (stored) {
        this.shareHistory = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load share history:', error);
      this.shareHistory = [];
    }
  }

  private saveShareHistory(): void {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      localStorage.setItem('cpn-share-history', JSON.stringify(this.shareHistory));
    } catch (error) {
      console.warn('Failed to save share history:', error);
    }
  }

  private getTierColor(tier: string): string {
    const colors: Record<string, string> = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2'
    };
    return colors[tier] || '#f2f661';
  }
}