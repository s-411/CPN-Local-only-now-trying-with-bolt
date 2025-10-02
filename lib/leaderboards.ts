import {
  LeaderboardGroup,
  LeaderboardMember,
  LeaderboardStats,
  LeaderboardRanking,
  MockUser,
  CreateGroupFormData,
  JoinGroupData
} from './types';

// Mock users for realistic leaderboard testing
export const mockUsers: MockUser[] = [
  {
    id: 'user1',
    username: 'EfficientKing',
    location: 'San Francisco',
    avatar: '👑',
    joinedDate: new Date('2024-01-15'),
    stats: {
      totalSpent: 1250.50,
      totalNuts: 42,
      costPerNut: 29.77,
      totalTime: 840,
      totalGirls: 7,
      efficiency: 3.0,
      lastUpdated: new Date()
    }
  },
  {
    id: 'user2',
    username: 'BudgetChamp',
    location: 'Austin',
    avatar: '💰',
    joinedDate: new Date('2024-01-20'),
    stats: {
      totalSpent: 892.25,
      totalNuts: 35,
      costPerNut: 25.49,
      totalTime: 720,
      totalGirls: 5,
      efficiency: 2.9,
      lastUpdated: new Date()
    }
  },
  {
    id: 'user3',
    username: 'SpeedRunner',
    location: 'Miami',
    avatar: '⚡',
    joinedDate: new Date('2024-02-01'),
    stats: {
      totalSpent: 2100.00,
      totalNuts: 58,
      costPerNut: 36.21,
      totalTime: 960,
      totalGirls: 12,
      efficiency: 3.6,
      lastUpdated: new Date()
    }
  },
  {
    id: 'user4',
    username: 'ThriftyPro',
    location: 'Seattle',
    avatar: '🎯',
    joinedDate: new Date('2024-02-10'),
    stats: {
      totalSpent: 675.00,
      totalNuts: 28,
      costPerNut: 24.11,
      totalTime: 580,
      totalGirls: 4,
      efficiency: 2.9,
      lastUpdated: new Date()
    }
  },
  {
    id: 'user5',
    username: 'LuxuryPlayer',
    location: 'New York',
    avatar: '💎',
    joinedDate: new Date('2024-02-15'),
    stats: {
      totalSpent: 3500.75,
      totalNuts: 65,
      costPerNut: 53.86,
      totalTime: 1200,
      totalGirls: 15,
      efficiency: 3.3,
      lastUpdated: new Date()
    }
  }
];

// Calculate leaderboard rankings
export function calculateRankings(
  members: LeaderboardMember[],
  sortBy: 'efficiency' | 'costPerNut' | 'totalNuts' = 'efficiency'
): LeaderboardRanking[] {
  const sorted = [...members].sort((a, b) => {
    switch (sortBy) {
      case 'efficiency':
        return b.stats.efficiency - a.stats.efficiency;
      case 'costPerNut':
        return a.stats.costPerNut - b.stats.costPerNut;
      case 'totalNuts':
        return b.stats.totalNuts - a.stats.totalNuts;
      default:
        return 0;
    }
  });

  return sorted.map((member, index) => ({
    rank: index + 1,
    member,
    change: 0
  }));
}

// All leaderboard operations now use the database via API routes
// For legacy code that may still call these functions, they return empty arrays/nulls

export function getLeaderboardGroups(): LeaderboardGroup[] {
  console.warn('getLeaderboardGroups is deprecated. Use /api/leaderboards instead');
  return [];
}

export function createLeaderboardGroup(data: CreateGroupFormData): LeaderboardGroup | null {
  console.warn('createLeaderboardGroup is deprecated. Use POST /api/leaderboards instead');
  return null;
}

export function getGroupMembers(groupId: string): LeaderboardMember[] {
  console.warn('getGroupMembers is deprecated. Use GET /api/leaderboards/[groupId] instead');
  return [];
}

export function joinGroup(data: JoinGroupData): LeaderboardMember | null {
  console.warn('joinGroup is deprecated. Use POST /api/leaderboards/join instead');
  return null;
}

export function updateMemberStats(groupId: string, userId: string, stats: LeaderboardStats): boolean {
  console.warn('updateMemberStats is deprecated. Use PUT /api/leaderboards/[groupId] instead');
  return false;
}

export function leaveGroup(groupId: string, userId: string): boolean {
  console.warn('leaveGroup is deprecated. Use DELETE /api/leaderboards/[groupId] instead');
  return false;
}

export function deleteGroup(groupId: string): boolean {
  console.warn('deleteGroup is deprecated. Group creator RLS policy handles deletion');
  return false;
}
