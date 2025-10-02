// Canvas-based card generation for sharing

export interface CardConfig {
  width: number;
  height: number;
  theme: 'dark' | 'light' | 'gradient';
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  secondaryTextColor: string;
  padding: number;
  cornerRadius: number;
}

export interface CardData {
  title: string;
  subtitle?: string;
  metrics: Array<{
    label: string;
    value: string;
    highlight?: boolean;
  }>;
  watermark?: {
    text: string;
    opacity: number;
    position: 'corner' | 'center' | 'diagonal';
  };
}

export class CardGenerator {
  private static readonly THEMES: Record<string, CardConfig> = {
    dark: {
      width: 800,
      height: 600,
      theme: 'dark',
      accentColor: '#f2f661', // CPN yellow
      backgroundColor: '#1f1f1f', // CPN dark
      textColor: '#ffffff',
      secondaryTextColor: '#ababab',
      padding: 40,
      cornerRadius: 24
    },
    instagramStory: {
      width: 1080,
      height: 1920,
      theme: 'dark',
      accentColor: '#f2f661', // CPN yellow
      backgroundColor: '#1f1f1f', // CPN dark
      textColor: '#ffffff',
      secondaryTextColor: '#ababab',
      padding: 80,
      cornerRadius: 32
    },
    light: {
      width: 800,
      height: 600,
      theme: 'light',
      accentColor: '#f2f661',
      backgroundColor: '#ffffff',
      textColor: '#1f1f1f',
      secondaryTextColor: '#666666',
      padding: 40,
      cornerRadius: 24
    },
    gradient: {
      width: 800,
      height: 600,
      theme: 'gradient',
      accentColor: '#f2f661',
      backgroundColor: '#1f1f1f',
      textColor: '#ffffff',
      secondaryTextColor: '#ababab',
      padding: 40,
      cornerRadius: 24
    }
  };

  /**
   * Generate a statistics card image
   */
  static async generateCard(data: CardData, theme: string = 'dark'): Promise<Blob> {
    const config = this.THEMES[theme] || this.THEMES.dark;
    
    const canvas = document.createElement('canvas');
    canvas.width = config.width;
    canvas.height = config.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // Clear canvas and draw background
    this.drawBackground(ctx, config);
    
    // Draw card content
    await this.drawCardContent(ctx, config, data);
    
    // Add watermark if provided
    if (data.watermark) {
      this.drawWatermark(ctx, config, data.watermark);
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 0.95);
    });
  }

  /**
   * Generate a girl statistics card specifically
   */
  static async generateGirlCard(girl: any): Promise<Blob> {
    const data: CardData = {
      title: girl.name || 'Anonymous',
      subtitle: `Rating: ${girl.rating}/10`,
      metrics: [
        {
          label: 'Total Spent',
          value: `$${girl.metrics.totalSpent.toFixed(2)}`,
          highlight: false
        },
        {
          label: 'Cost per Nut',
          value: `$${girl.metrics.costPerNut.toFixed(2)}`,
          highlight: true
        },
        {
          label: 'Total Nuts',
          value: girl.metrics.totalNuts.toString(),
          highlight: false
        },
        {
          label: 'Total Time',
          value: this.formatDuration(girl.metrics.totalTime),
          highlight: false
        },
        {
          label: 'Total Entries',
          value: girl.totalEntries.toString(),
          highlight: false
        }
      ],
      watermark: {
        text: 'Generated with CPN v2',
        opacity: 0.7,
        position: 'corner'
      }
    };

    return this.generateCard(data, 'dark');
  }

  /**
   * Generate an Instagram Story sized card for custom metrics
   */
  static async generateInstagramStoryCard(data: CardData): Promise<Blob> {
    return this.generateCard(data, 'instagramStory');
  }

  /**
   * Generate a comparison report card
   */
  static async generateComparisonCard(comparison: any): Promise<Blob> {
    const data: CardData = {
      title: 'Performance Comparison',
      subtitle: `You're in the top ${100 - (comparison.userMetrics.percentile || 50)}%`,
      metrics: [
        {
          label: 'Your Cost per Nut',
          value: `$${comparison.userMetrics.costPerNut.toFixed(2)}`,
          highlight: true
        },
        {
          label: 'Global Average',
          value: `$${comparison.globalMetrics.avgCostPerNut.toFixed(2)}`,
          highlight: false
        },
        {
          label: 'Your Efficiency',
          value: `${(comparison.userMetrics.efficiency * 100).toFixed(1)}%`,
          highlight: true
        },
        {
          label: 'Insights Found',
          value: comparison.insights.length.toString(),
          highlight: false
        }
      ],
      watermark: {
        text: 'Generated with CPN v2',
        opacity: 0.7,
        position: 'corner'
      }
    };

    return this.generateCard(data, 'dark');
  }

  // Private helper methods

  private static drawBackground(ctx: CanvasRenderingContext2D, config: CardConfig): void {
    if (config.theme === 'gradient') {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, config.width, config.height);
      gradient.addColorStop(0, config.backgroundColor);
      gradient.addColorStop(0.5, '#2a2a2a');
      gradient.addColorStop(1, config.backgroundColor);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = config.backgroundColor;
    }
    
    // Draw rounded rectangle background
    this.drawRoundedRect(ctx, 0, 0, config.width, config.height, config.cornerRadius);
    ctx.fill();

    // Add subtle border
    ctx.strokeStyle = config.accentColor + '20'; // 20% opacity
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private static async drawCardContent(
    ctx: CanvasRenderingContext2D, 
    config: CardConfig, 
    data: CardData
  ): Promise<void> {
    const { padding } = config;
    let yOffset = padding;
    const isInstagramStory = config.width === 1080 && config.height === 1920;

    // Adjust font sizes for Instagram Story format
    const titleFontSize = isInstagramStory ? 72 : 48;
    const subtitleFontSize = isInstagramStory ? 36 : 24;
    
    // Draw title
    ctx.fillStyle = config.accentColor;
    ctx.font = `bold ${titleFontSize}px National2Condensed, Arial Black, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(data.title, config.width / 2, yOffset + titleFontSize);
    yOffset += isInstagramStory ? 120 : 80;

    // Draw subtitle if present
    if (data.subtitle) {
      ctx.fillStyle = config.secondaryTextColor;
      ctx.font = `${subtitleFontSize}px ESKlarheit, Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(data.subtitle, config.width / 2, yOffset + subtitleFontSize);
      yOffset += isInstagramStory ? 100 : 60;
    }

    // Draw metrics - optimize layout for Instagram Story (vertical)
    if (isInstagramStory) {
      // For Instagram Story: single column with larger boxes
      const metricWidth = config.width - padding * 2;
      const metricHeight = 180;
      const startY = yOffset + 60;
      const spacing = 40;

      data.metrics.forEach((metric, index) => {
        const y = startY + (index * (metricHeight + spacing));
        this.drawMetricBox(ctx, config, metric, padding, y, metricWidth, metricHeight);
      });
    } else {
      // For regular cards: 2-column grid
      const metricsPerRow = 2;
      const metricWidth = (config.width - padding * 2 - 30) / metricsPerRow;
      const metricHeight = 100;
      const startY = yOffset + 40;

      data.metrics.forEach((metric, index) => {
        const row = Math.floor(index / metricsPerRow);
        const col = index % metricsPerRow;
        
        const x = padding + (col * (metricWidth + 30));
        const y = startY + (row * (metricHeight + 20));

        this.drawMetricBox(ctx, config, metric, x, y, metricWidth, metricHeight);
      });
    }
  }

  private static drawMetricBox(
    ctx: CanvasRenderingContext2D,
    config: CardConfig,
    metric: { label: string; value: string; highlight?: boolean },
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const isInstagramStory = config.width === 1080 && config.height === 1920;
    const cornerRadius = isInstagramStory ? 20 : 12;
    const padding = isInstagramStory ? 32 : 16;
    const labelFontSize = isInstagramStory ? 28 : 16;
    const valueFontSize = isInstagramStory ? 48 : 28;
    const labelYOffset = isInstagramStory ? 50 : 30;
    const valueYOffset = isInstagramStory ? 110 : 65;

    // Draw metric background
    ctx.fillStyle = metric.highlight ? config.accentColor + '15' : '#2a2a2a';
    this.drawRoundedRect(ctx, x, y, width, height, cornerRadius);
    ctx.fill();

    // Draw metric border for highlighted items
    if (metric.highlight) {
      ctx.strokeStyle = config.accentColor + '60';
      ctx.lineWidth = isInstagramStory ? 3 : 2;
      ctx.stroke();
    }

    // Draw metric label
    ctx.fillStyle = config.secondaryTextColor;
    ctx.font = `${labelFontSize}px ESKlarheit, Inter, sans-serif`;
    ctx.textAlign = isInstagramStory ? 'center' : 'left';
    const labelX = isInstagramStory ? x + width / 2 : x + padding;
    ctx.fillText(metric.label, labelX, y + labelYOffset);

    // Draw metric value
    ctx.fillStyle = metric.highlight ? config.accentColor : config.textColor;
    ctx.font = `bold ${valueFontSize}px National2Condensed, Arial Black, sans-serif`;
    ctx.textAlign = isInstagramStory ? 'center' : 'left';
    const valueX = isInstagramStory ? x + width / 2 : x + padding;
    ctx.fillText(metric.value, valueX, y + valueYOffset);
  }

  private static drawWatermark(
    ctx: CanvasRenderingContext2D,
    config: CardConfig,
    watermark: { text: string; opacity: number; position: string }
  ): void {
    ctx.save();
    ctx.globalAlpha = watermark.opacity;
    ctx.fillStyle = config.secondaryTextColor;
    ctx.font = '14px ESKlarheit, Inter, sans-serif';
    ctx.textAlign = 'right';

    let x: number, y: number;

    switch (watermark.position) {
      case 'center':
        x = config.width / 2;
        y = config.height / 2;
        ctx.textAlign = 'center';
        break;
      case 'diagonal':
        ctx.save();
        ctx.translate(config.width / 2, config.height / 2);
        ctx.rotate(-Math.PI / 4);
        ctx.textAlign = 'center';
        x = 0;
        y = 0;
        break;
      case 'corner':
      default:
        x = config.width - config.padding;
        y = config.height - 20;
        break;
    }

    ctx.fillText(watermark.text, x, y);
    
    if (watermark.position === 'diagonal') {
      ctx.restore();
    }
    
    ctx.restore();
  }

  private static drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  private static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 1440) { // Less than 24 hours
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
  }
}