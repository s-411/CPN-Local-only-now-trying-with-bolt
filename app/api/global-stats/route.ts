import { NextResponse } from 'next/server';
import { DemographicStats } from '@/lib/types';

export async function GET() {
  try {
    // TODO: Replace with actual Supabase queries when database is ready
    // For now, return zeroed stats for production launch
    const stats: DemographicStats = {
      ethnicity: {
        Asian: { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 },
        Black: { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 },
        Latina: { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 },
        White: { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 },
        'Middle Eastern': { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 },
        Indian: { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 },
        Mixed: { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 },
        'Native American': { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 },
        'Pacific Islander': { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 },
        Other: { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 }
      },
      hairColor: {
        Blonde: { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 },
        Brunette: { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 },
        Black: { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 },
        Red: { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 },
        Auburn: { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 },
        'Gray/Silver': { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 },
        'Dyed/Colorful': { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 },
        Other: { averageCostPerNut: 0, averageRating: 0, totalSpending: 0, userCount: 0 }
      },
      ratingTiers: {
        '5.0-6.0': { averageCostPerNut: 0, totalSpending: 0, popularityPercentage: 0 },
        '6.0-7.0': { averageCostPerNut: 0, totalSpending: 0, popularityPercentage: 0 },
        '7.0-8.0': { averageCostPerNut: 0, totalSpending: 0, popularityPercentage: 0 },
        '8.0-9.0': { averageCostPerNut: 0, totalSpending: 0, popularityPercentage: 0 },
        '9.0-10.0': { averageCostPerNut: 0, totalSpending: 0, popularityPercentage: 0 }
      },
      locations: {
        'United States': { averageCostPerNut: 0, popularity: 0 },
        'Canada': { averageCostPerNut: 0, popularity: 0 },
        'United Kingdom': { averageCostPerNut: 0, popularity: 0 },
        'Australia': { averageCostPerNut: 0, popularity: 0 },
        'Germany': { averageCostPerNut: 0, popularity: 0 },
        'France': { averageCostPerNut: 0, popularity: 0 },
        'Japan': { averageCostPerNut: 0, popularity: 0 },
        'Brazil': { averageCostPerNut: 0, popularity: 0 },
        'Other': { averageCostPerNut: 0, popularity: 0 }
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching global stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global statistics' },
      { status: 500 }
    );
  }
}

/* 
TODO: When Supabase is integrated, replace the static stats above with queries like:

async function getEthnicityStats() {
  const { data, error } = await supabase
    .from('girls')
    .select(`
      ethnicity,
      rating,
      data_entries (
        amount_spent,
        number_of_nuts
      )
    `)
    .not('ethnicity', 'is', null);
    
  // Group by ethnicity and calculate averages
  return processEthnicityData(data);
}

async function getHairColorStats() {
  // Similar aggregation query for hair color
}

async function getRatingTierStats() {
  // Group girls by rating ranges and calculate stats
}

async function getLocationStats() {
  // Aggregate by user location (from user profiles)
}
*/