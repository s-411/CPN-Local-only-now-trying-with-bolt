import { NextRequest, NextResponse } from 'next/server';
import { leaderboardsDatabase } from '@/lib/database/leaderboards';

export async function GET() {
  try {
    const groups = await leaderboardsDatabase.getMyGroups();

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Leaderboards GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    const group = await leaderboardsDatabase.createGroup(name);

    if (!group) {
      return NextResponse.json(
        { error: 'Failed to create leaderboard group' },
        { status: 500 }
      );
    }

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Leaderboards POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create leaderboard group' },
      { status: 500 }
    );
  }
}
