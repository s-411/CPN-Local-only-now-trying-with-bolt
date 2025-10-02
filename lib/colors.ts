/**
 * Color Assignment System for Girls
 *
 * Provides consistent color assignment across all charts and visualizations.
 * Each girl gets assigned a unique color that remains consistent throughout the app.
 */

// Base color palette with alternating colors to avoid similar adjacent shades
const BASE_COLORS = [
  '#1e90ff', // Girl 1: Dark blue
  '#dda0dd', // Girl 2: Light purple
  '#90ee90', // Girl 3: Light green
  '#ff69b4', // Girl 4: Hot pink
  '#20b2aa', // Girl 5: Dark teal
  '#ff6347', // Girl 6: Tomato (orange-red)
  '#9932cc', // Girl 7: Dark purple
  '#87ceeb', // Girl 8: Light blue
  '#228b22', // Girl 9: Dark green
  '#ff1493', // Girl 10: Deep pink
  '#40e0d0', // Girl 11: Light teal
  '#dc143c', // Girl 12: Dark red (crimson)
  '#da70d6', // Girl 13: Orchid (magenta-purple)
  '#ffa07a', // Girl 14: Light orange
  '#f2f661', // Girl 15: Light yellow (cpn-yellow)
  '#e6ac00'  // Girl 16: Dark yellow
];

// Extended color palette for girls 13+
// Generates variations of the base colors by adjusting HSL values
const generateColorVariations = (baseColors: string[], count: number): string[] => {
  const variations: string[] = [];

  for (let i = 0; i < count; i++) {
    const baseIndex = i % baseColors.length;
    const baseColor = baseColors[baseIndex];

    // Convert hex to HSL for manipulation
    const hsl = hexToHsl(baseColor);

    // Create variations by adjusting hue, saturation, and lightness
    const variationFactor = Math.floor(i / baseColors.length);

    // Adjust hue by ±15 degrees, saturation by ±10%, lightness by ±8%
    const hueShift = (variationFactor % 3 - 1) * 15;
    const satShift = (Math.floor(variationFactor / 3) % 3 - 1) * 0.1;
    const lightShift = (Math.floor(variationFactor / 9) % 3 - 1) * 0.08;

    const newH = (hsl.h + hueShift + 360) % 360;
    const newS = Math.max(0.2, Math.min(1, hsl.s + satShift));
    const newL = Math.max(0.3, Math.min(0.8, hsl.l + lightShift));

    variations.push(hslToHex(newH, newS, newL));
  }

  return variations;
};

// Color conversion utilities
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / (1/12)) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Generate extended color palette (supports unlimited girls)
const EXTENDED_COLORS = generateColorVariations(BASE_COLORS, 50);

// Main color assignment function
export function getGirlColor(girlId: string, allGirlIds: string[]): string {
  // Sort girl IDs to ensure consistent ordering
  const sortedGirlIds = [...allGirlIds].sort();
  const girlIndex = sortedGirlIds.indexOf(girlId);

  if (girlIndex === -1) {
    // Fallback color if girl not found
    return BASE_COLORS[0];
  }

  // Use base colors for first 12 girls, then extended colors
  if (girlIndex < BASE_COLORS.length) {
    return BASE_COLORS[girlIndex];
  } else {
    return EXTENDED_COLORS[girlIndex];
  }
}

// Get colors for multiple girls at once
export function getGirlColors(girlIds: string[]): { [girlId: string]: string } {
  const colorMap: { [girlId: string]: string } = {};

  girlIds.forEach(girlId => {
    colorMap[girlId] = getGirlColor(girlId, girlIds);
  });

  return colorMap;
}

// Get chart data with consistent colors
export function getChartColorsForGirls(girls: Array<{ id: string; name: string }>): string[] {
  const girlIds = girls.map(girl => girl.id);
  return girls.map(girl => getGirlColor(girl.id, girlIds));
}

// Utility to get color for a specific girl by name (for backwards compatibility)
export function getColorByGirlName(girlName: string, allGirls: Array<{ id: string; name: string }>): string {
  const girl = allGirls.find(g => g.name === girlName);
  if (!girl) return BASE_COLORS[0];

  const girlIds = allGirls.map(g => g.id);
  return getGirlColor(girl.id, girlIds);
}

// Export the base colors for reference
export { BASE_COLORS };