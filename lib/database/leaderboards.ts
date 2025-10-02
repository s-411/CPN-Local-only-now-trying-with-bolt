import { getSupabaseClient } from '../supabase';
import { getSessionToken } from './session';

export interface DbLeaderboardGroup {
  id: string;
  name: string;
  created_by: string;
  invite_token: string;
  is_private: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface DbLeaderboardMembership {
  id: string;
  group_id: string;
  user_id: string;
  username: string;
  stats_cache: {
    totalSpent: number;
    totalNuts: number;
    costPerNut: number;
    totalTime: number;
    totalGirls: number;
    efficiency: number;
  };
  joined_at: string;
  last_updated: string;
  created_at: string;
}

export const leaderboardsDatabase = {
  createGroup: async (name: string): Promise<DbLeaderboardGroup | null> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) return null;

    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (!user) return null;

    const inviteToken = crypto.randomUUID().substring(0, 8);

    const { data: group, error: groupError } = await supabase
      .from('leaderboard_groups')
      .insert({
        name,
        created_by: user.id,
        invite_token: inviteToken,
        is_private: true,
        member_count: 0,
      })
      .select()
      .maybeSingle<DbLeaderboardGroup>();

    if (groupError || !group) {
      console.error('Error creating leaderboard group:', groupError);
      return null;
    }

    const { error: memberError } = await supabase
      .from('leaderboard_memberships')
      .insert({
        group_id: group.id,
        user_id: user.id,
        username: 'Player',
        stats_cache: {
          totalSpent: 0,
          totalNuts: 0,
          costPerNut: 0,
          totalTime: 0,
          totalGirls: 0,
          efficiency: 0,
        },
      });

    if (memberError) {
      console.error('Error adding creator to group:', memberError);
    }

    return group;
  },

  getMyGroups: async (): Promise<DbLeaderboardGroup[]> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) return [];

    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (!user) return [];

    const { data: memberships } = await supabase
      .from('leaderboard_memberships')
      .select('group_id')
      .eq('user_id', user.id);

    if (!memberships || memberships.length === 0) return [];

    const groupIds = memberships.map(m => m.group_id);

    const { data, error } = await supabase
      .from('leaderboard_groups')
      .select('*')
      .in('id', groupIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leaderboard groups:', error);
      return [];
    }

    return data as DbLeaderboardGroup[];
  },

  getGroupByToken: async (inviteToken: string): Promise<DbLeaderboardGroup | null> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('leaderboard_groups')
      .select('*')
      .eq('invite_token', inviteToken)
      .maybeSingle<DbLeaderboardGroup>();

    if (error) {
      console.error('Error fetching group by token:', error);
      return null;
    }

    return data;
  },

  joinGroup: async (inviteToken: string, username: string): Promise<DbLeaderboardMembership | null> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) return null;

    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (!user) return null;

    const group = await leaderboardsDatabase.getGroupByToken(inviteToken);
    if (!group) return null;

    const { data, error } = await supabase
      .from('leaderboard_memberships')
      .insert({
        group_id: group.id,
        user_id: user.id,
        username,
        stats_cache: {
          totalSpent: 0,
          totalNuts: 0,
          costPerNut: 0,
          totalTime: 0,
          totalGirls: 0,
          efficiency: 0,
        },
      })
      .select()
      .maybeSingle<DbLeaderboardMembership>();

    if (error) {
      console.error('Error joining group:', error);
      return null;
    }

    return data;
  },

  getGroupMembers: async (groupId: string): Promise<DbLeaderboardMembership[]> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('leaderboard_memberships')
      .select('*')
      .eq('group_id', groupId)
      .order('last_updated', { ascending: false });

    if (error) {
      console.error('Error fetching group members:', error);
      return [];
    }

    return data as DbLeaderboardMembership[];
  },

  updateMemberStats: async (groupId: string, stats: DbLeaderboardMembership['stats_cache']): Promise<boolean> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) return false;

    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (!user) return false;

    const { error } = await supabase
      .from('leaderboard_memberships')
      .update({
        stats_cache: stats,
        last_updated: new Date().toISOString(),
      })
      .eq('group_id', groupId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating member stats:', error);
      return false;
    }

    return true;
  },

  leaveGroup: async (groupId: string): Promise<boolean> => {
    const sessionToken = getSessionToken();
    if (!sessionToken) return false;

    const supabase = getSupabaseClient();
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (!user) return false;

    const { error } = await supabase
      .from('leaderboard_memberships')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error leaving group:', error);
      return false;
    }

    return true;
  },
};
