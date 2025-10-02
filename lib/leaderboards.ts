import { 
  LeaderboardGroup, 
  LeaderboardMember, 
  LeaderboardStats, 
  LeaderboardRanking,
  MockUser,
  CreateGroupFormData,
  JoinGroupData 
} from './types';

const LEADERBOARD_GROUPS_KEY = 'cpn_leaderboard_groups';
const LEADERBOARD_MEMBERS_KEY = 'cpn_leaderboard_members';

// Utility function to safely parse JSON
function safeParseJSON<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      return parsed.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        ...(item.joinedAt && { joinedAt: new Date(item.joinedAt) }),
        ...(item.lastUpdated && { 
          stats: {
            ...item.stats,
            lastUpdated: new Date(item.stats.lastUpdated)
          }
        })
      })) as T;
    }
    return parsed;
  } catch (error) {
    console.error('Error parsing JSON from localStorage:', error);
    return defaultValue;
  }
}

// Generate invite token
function generateInviteToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Mock users for realistic leaderboard testing
export const mockUsers: MockUser[] = [
  {
    id: 'user1',
    username: 'EfficientKing',
    location: 'San Francisco',
    joinedDate: new Date('2024-01-15'),
    stats: {
      totalSpent: 1200,
      totalNuts: 180,
      costPerNut: 6.67,
      totalTime: 3600, // 60 hours
      totalGirls: 4,
      efficiency: 92,
      lastUpdated: new Date()
    }
  },
  {
    id: 'user2',
    username: 'BudgetPlayer',
    location: 'New York',
    joinedDate: new Date('2024-02-01'),
    stats: {
      totalSpent: 800,
      totalNuts: 100,
      costPerNut: 8.00,
      totalTime: 2400, // 40 hours
      totalGirls: 3,
      efficiency: 85,
      lastUpdated: new Date()
    }
  },
  {
    id: 'user3',
    username: 'BigSpender',
    location: 'Miami',
    joinedDate: new Date('2024-01-20'),
    stats: {
      totalSpent: 3500,
      totalNuts: 200,
      costPerNut: 17.50,
      totalTime: 4800, // 80 hours
      totalGirls: 8,
      efficiency: 65,
      lastUpdated: new Date()
    }
  },
  {
    id: 'user4',
    username: 'NutMaster',
    location: 'Austin',
    joinedDate: new Date('2024-02-10'),
    stats: {
      totalSpent: 1800,
      totalNuts: 240,
      costPerNut: 7.50,
      totalTime: 3200, // 53 hours
      totalGirls: 6,
      efficiency: 88,
      lastUpdated: new Date()
    }
  },
  {
    id: 'user5',
    username: 'CasualDater',
    location: 'Seattle',
    joinedDate: new Date('2024-02-15'),
    stats: {
      totalSpent: 600,
      totalNuts: 50,
      costPerNut: 12.00,
      totalTime: 1200, // 20 hours
      totalGirls: 2,
      efficiency: 78,
      lastUpdated: new Date()
    }
  },
  {
    id: 'user6',
    username: 'OptimizedLover',
    location: 'Denver',
    joinedDate: new Date('2024-01-25'),
    stats: {
      totalSpent: 900,
      totalNuts: 150,
      costPerNut: 6.00,
      totalTime: 2000, // 33 hours
      totalGirls: 3,
      efficiency: 95,
      lastUpdated: new Date()
    }
  }
];

// Leaderboard Groups CRUD
export const leaderboardGroupsStorage = {
  getAll: (): LeaderboardGroup[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(LEADERBOARD_GROUPS_KEY);
    return safeParseJSON(stored, []);
  },

  getById: (id: string): LeaderboardGroup | null => {
    const groups = leaderboardGroupsStorage.getAll();
    return groups.find(group => group.id === id) || null;
  },

  getByInviteToken: (token: string): LeaderboardGroup | null => {
    const groups = leaderboardGroupsStorage.getAll();
    return groups.find(group => group.inviteToken === token) || null;
  },

  create: (groupData: CreateGroupFormData, createdBy: string): LeaderboardGroup => {
    const newGroup: LeaderboardGroup = {
      ...groupData,
      id: crypto.randomUUID(),
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      inviteToken: generateInviteToken(),
      isPrivate: true,
      memberCount: 1 // creator is first member
    };

    const groups = leaderboardGroupsStorage.getAll();
    groups.push(newGroup);
    localStorage.setItem(LEADERBOARD_GROUPS_KEY, JSON.stringify(groups));
    
    // Auto-add creator as first member
    leaderboardMembersStorage.addMember(newGroup.id, createdBy, 'You');

    return newGroup;
  },

  update: (id: string, updates: Partial<Omit<LeaderboardGroup, 'id' | 'createdAt'>>): LeaderboardGroup | null => {
    const groups = leaderboardGroupsStorage.getAll();
    const groupIndex = groups.findIndex(group => group.id === id);
    
    if (groupIndex === -1) return null;

    const updatedGroup = {
      ...groups[groupIndex],
      ...updates,
      updatedAt: new Date()
    };

    groups[groupIndex] = updatedGroup;
    localStorage.setItem(LEADERBOARD_GROUPS_KEY, JSON.stringify(groups));
    return updatedGroup;
  },

  delete: (id: string): boolean => {
    const groups = leaderboardGroupsStorage.getAll();
    const filteredGroups = groups.filter(group => group.id !== id);
    
    if (filteredGroups.length === groups.length) return false;
    
    localStorage.setItem(LEADERBOARD_GROUPS_KEY, JSON.stringify(filteredGroups));
    // Also delete all members of this group
    leaderboardMembersStorage.deleteAllFromGroup(id);
    return true;
  }
};

// Leaderboard Members CRUD
export const leaderboardMembersStorage = {
  getAll: (): LeaderboardMember[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(LEADERBOARD_MEMBERS_KEY);
    return safeParseJSON(stored, []);
  },

  getByGroupId: (groupId: string): LeaderboardMember[] => {
    const members = leaderboardMembersStorage.getAll();
    return members.filter(member => member.groupId === groupId);
  },

  addMember: (groupId: string, userId: string, username: string, stats?: LeaderboardStats): LeaderboardMember => {
    // Use mock data for stats if not provided
    const mockUser = mockUsers.find(user => user.id === userId);
    const defaultStats: LeaderboardStats = mockUser?.stats || {
      totalSpent: 0,
      totalNuts: 0,
      costPerNut: 0,
      totalTime: 0,
      totalGirls: 0,
      efficiency: 0,
      lastUpdated: new Date()
    };

    const newMember: LeaderboardMember = {
      id: crypto.randomUUID(),
      groupId,
      userId,
      username,
      joinedAt: new Date(),
      stats: stats || defaultStats
    };

    const members = leaderboardMembersStorage.getAll();
    members.push(newMember);
    localStorage.setItem(LEADERBOARD_MEMBERS_KEY, JSON.stringify(members));

    // Update group member count
    const groups = leaderboardGroupsStorage.getAll();
    const groupIndex = groups.findIndex(group => group.id === groupId);
    if (groupIndex !== -1) {
      groups[groupIndex].memberCount = members.filter(m => m.groupId === groupId).length;
      localStorage.setItem(LEADERBOARD_GROUPS_KEY, JSON.stringify(groups));
    }

    return newMember;
  },

  addMockMember: (groupId: string): LeaderboardMember => {
    // Add a random mock user to the group
    const existingMembers = leaderboardMembersStorage.getByGroupId(groupId);
    const existingUserIds = existingMembers.map(member => member.userId);
    const availableMockUsers = mockUsers.filter(user => !existingUserIds.includes(user.id));
    
    if (availableMockUsers.length === 0) {
      throw new Error('No more mock users available');
    }

    const randomMockUser = availableMockUsers[Math.floor(Math.random() * availableMockUsers.length)];
    return leaderboardMembersStorage.addMember(groupId, randomMockUser.id, randomMockUser.username, randomMockUser.stats);
  },

  deleteMember: (memberId: string): boolean => {
    const members = leaderboardMembersStorage.getAll();
    const member = members.find(m => m.id === memberId);
    if (!member) return false;

    const filteredMembers = members.filter(m => m.id !== memberId);
    localStorage.setItem(LEADERBOARD_MEMBERS_KEY, JSON.stringify(filteredMembers));

    // Update group member count
    const groups = leaderboardGroupsStorage.getAll();
    const groupIndex = groups.findIndex(group => group.id === member.groupId);
    if (groupIndex !== -1) {
      groups[groupIndex].memberCount = filteredMembers.filter(m => m.groupId === member.groupId).length;
      localStorage.setItem(LEADERBOARD_GROUPS_KEY, JSON.stringify(groups));
    }

    return true;
  },

  deleteAllFromGroup: (groupId: string): boolean => {
    const members = leaderboardMembersStorage.getAll();
    const filteredMembers = members.filter(member => member.groupId !== groupId);
    localStorage.setItem(LEADERBOARD_MEMBERS_KEY, JSON.stringify(filteredMembers));
    return true;
  }
};

// Ranking calculations
export function calculateRankings(members: LeaderboardMember[]): LeaderboardRanking[] {
  // Sort by cost per nut (lower is better) and efficiency (higher is better)
  const sortedMembers = [...members].sort((a, b) => {
    // Primary sort: cost per nut (ascending)
    if (a.stats.costPerNut !== b.stats.costPerNut) {
      return a.stats.costPerNut - b.stats.costPerNut;
    }
    // Secondary sort: efficiency (descending)
    return b.stats.efficiency - a.stats.efficiency;
  });

  return sortedMembers.map((member, index) => ({
    rank: index + 1,
    member,
    // TODO: Calculate rank change when we have historical data
    change: undefined
  }));
}

// Initialize some sample groups for testing
export function initializeSampleGroups() {
  const existingGroups = leaderboardGroupsStorage.getAll();
  if (existingGroups.length > 0) return; // Already initialized

  // Create sample group
  const sampleGroup = leaderboardGroupsStorage.create(
    { name: 'The Boys' }, 
    'current-user'
  );

  // Add some mock members
  leaderboardMembersStorage.addMockMember(sampleGroup.id);
  leaderboardMembersStorage.addMockMember(sampleGroup.id);
  leaderboardMembersStorage.addMockMember(sampleGroup.id);
}