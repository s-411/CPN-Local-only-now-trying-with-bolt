import { NextRequest, NextResponse } from 'next/server';
import { leaderboardsDatabase } from '@/lib/database/leaderboards';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const params = await context.params;
    const { groupId } = params;
    const members = await leaderboardsDatabase.getGroupMembers(groupId);

    return NextResponse.json(members);
  } catch (error) {
    console.error('Leaderboard members GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard members' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const params = await context.params;
    const { groupId } = params;
    const { stats } = await request.json();

    if (!stats) {
      return NextResponse.json(
        { error: 'Stats are required' },
        { status: 400 }
      );
    }

    const success = await leaderboardsDatabase.updateMemberStats(groupId, stats);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update stats' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Leaderboard stats PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update leaderboard stats' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const params = await context.params;
    const { groupId } = params;
    const success = await leaderboardsDatabase.leaveGroup(groupId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to leave group' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Leaderboard leave DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to leave leaderboard group' },
      { status: 500 }
    );
  }
}
