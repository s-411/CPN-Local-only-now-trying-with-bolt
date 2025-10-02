import { NextRequest, NextResponse } from 'next/server';
import { leaderboardsDatabase } from '@/lib/database/leaderboards';

export async function POST(request: NextRequest) {
  try {
    const { inviteToken, username } = await request.json();

    if (!inviteToken || !username) {
      return NextResponse.json(
        { error: 'Invite token and username are required' },
        { status: 400 }
      );
    }

    const membership = await leaderboardsDatabase.joinGroup(inviteToken, username);

    if (!membership) {
      return NextResponse.json(
        { error: 'Failed to join group. Invalid token or already a member.' },
        { status: 400 }
      );
    }

    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    console.error('Join leaderboard POST error:', error);
    return NextResponse.json(
      { error: 'Failed to join leaderboard group' },
      { status: 500 }
    );
  }
}
