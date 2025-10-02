// Achievement badge generator for sharing

import { Achievement, AchievementTier } from '../../achievements/types';

export class BadgeGenerator {
  /**
   * Generate an achievement badge image
   */
  static async generateBadge(achievement: Achievement): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Canvas context not available');

    // Draw background with tier-based styling
    this.drawBackground(ctx, achievement.tier);
    
    // Draw badge content
    await this.drawBadgeContent(ctx, achievement);
    
    // Draw decorative elements
    this.drawDecorations(ctx, achievement.tier);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 0.95);
    });
  }

  /**
   * Generate a certificate-style achievement
   */
  static async generateCertificate(achievement: Achievement): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Canvas context not available');

    // Draw certificate background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    const tierColor = this.getTierColor(achievement.tier);
    ctx.strokeStyle = tierColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Draw inner border
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Certificate content
    ctx.fillStyle = '#1f1f1f';
    ctx.textAlign = 'center';

    // Header
    ctx.font = 'bold 32px Arial';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', canvas.width / 2, 120);

    // Achievement icon
    ctx.font = '60px Arial';
    ctx.fillText(achievement.icon, canvas.width / 2, 200);

    // Title
    ctx.fillStyle = tierColor;
    ctx.font = 'bold 36px Arial';
    ctx.fillText(achievement.title, canvas.width / 2, 260);

    // Description
    ctx.fillStyle = '#1f1f1f';
    ctx.font = '20px Arial';
    ctx.fillText(achievement.description, canvas.width / 2, 300);

    // Points and date
    ctx.font = '18px Arial';
    ctx.fillText(`Points Earned: ${achievement.points}`, canvas.width / 2, 360);
    
    if (achievement.unlockedAt) {
      ctx.fillText(
        `Achieved on: ${achievement.unlockedAt.toLocaleDateString()}`,
        canvas.width / 2,
        390
      );
    }

    // Watermark
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Generated with CPN v2', canvas.width - 50, canvas.height - 50);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 0.95);
    });
  }

  /**
   * Generate a compact card-style badge
   */
  static async generateCard(achievement: Achievement): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Canvas context not available');

    const tierColor = this.getTierColor(achievement.tier);

    // Draw background
    ctx.fillStyle = '#1f1f1f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, tierColor + '20');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = tierColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Content area
    const padding = 30;
    let yOffset = padding + 20;

    // Achievement icon
    ctx.font = '40px Arial';
    ctx.fillStyle = tierColor;
    ctx.textAlign = 'center';
    ctx.fillText(achievement.icon, canvas.width / 2, yOffset + 30);
    yOffset += 60;

    // Title
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#ffffff';
    const titleLines = this.wrapText(ctx, achievement.title, canvas.width - padding * 2);
    titleLines.forEach(line => {
      ctx.fillText(line, canvas.width / 2, yOffset);
      yOffset += 25;
    });

    // Tier indicator
    yOffset += 10;
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = tierColor;
    ctx.fillText(achievement.tier.toUpperCase(), canvas.width / 2, yOffset);
    yOffset += 25;

    // Points
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f2f661';
    ctx.fillText(`+${achievement.points} points`, canvas.width / 2, yOffset);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 0.95);
    });
  }

  // Private helper methods

  private static drawBackground(ctx: CanvasRenderingContext2D, tier: AchievementTier): void {
    const tierColor = this.getTierColor(tier);
    
    // Main background
    ctx.fillStyle = '#1f1f1f';
    ctx.fillRect(0, 0, 600, 400);

    // Radial gradient overlay
    const gradient = ctx.createRadialGradient(300, 200, 0, 300, 200, 300);
    gradient.addColorStop(0, tierColor + '40');
    gradient.addColorStop(0.5, tierColor + '20');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);
  }

  private static async drawBadgeContent(ctx: CanvasRenderingContext2D, achievement: Achievement): Promise<void> {
    const tierColor = this.getTierColor(achievement.tier);
    
    // Border
    ctx.strokeStyle = tierColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 560, 360);

    // Achievement icon background circle
    ctx.beginPath();
    ctx.arc(300, 120, 50, 0, 2 * Math.PI);
    ctx.fillStyle = tierColor + '30';
    ctx.fill();
    ctx.strokeStyle = tierColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Achievement icon
    ctx.font = '60px Arial';
    ctx.fillStyle = tierColor;
    ctx.textAlign = 'center';
    ctx.fillText(achievement.icon, 300, 135);

    // Title
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(achievement.title, 300, 200);

    // Tier badge
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = tierColor;
    ctx.fillText(achievement.tier.toUpperCase(), 300, 225);

    // Description
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ababab';
    const descLines = this.wrapText(ctx, achievement.description, 520);
    descLines.forEach((line, index) => {
      ctx.fillText(line, 300, 250 + (index * 20));
    });

    // Points
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#f2f661';
    ctx.fillText(`+${achievement.points} points`, 300, 320);

    // Date
    if (achievement.unlockedAt) {
      ctx.font = '14px Arial';
      ctx.fillStyle = '#ababab';
      ctx.fillText(
        `Unlocked: ${achievement.unlockedAt.toLocaleDateString()}`,
        300,
        345
      );
    }

    // Watermark
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillText('Generated with CPN v2', 580, 380);
  }

  private static drawDecorations(ctx: CanvasRenderingContext2D, tier: AchievementTier): void {
    const tierColor = this.getTierColor(tier);
    
    // Corner decorations
    ctx.strokeStyle = tierColor + '60';
    ctx.lineWidth = 2;
    
    // Top left
    ctx.beginPath();
    ctx.moveTo(40, 60);
    ctx.lineTo(60, 40);
    ctx.stroke();
    
    // Top right  
    ctx.beginPath();
    ctx.moveTo(540, 40);
    ctx.lineTo(560, 60);
    ctx.stroke();
    
    // Bottom left
    ctx.beginPath();
    ctx.moveTo(40, 340);
    ctx.lineTo(60, 360);
    ctx.stroke();
    
    // Bottom right
    ctx.beginPath();
    ctx.moveTo(560, 340);
    ctx.lineTo(540, 360);
    ctx.stroke();
  }

  private static getTierColor(tier: AchievementTier): string {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700', 
      platinum: '#E5E4E2'
    };
    return colors[tier];
  }

  private static wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }
}