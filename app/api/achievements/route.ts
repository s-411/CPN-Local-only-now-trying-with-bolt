import { NextRequest, NextResponse } from 'next/server';
import { achievementsDatabase } from '@/lib/database/achievements';

export async function GET() {
  try {
    const achievements = await achievementsDatabase.getAll();
    const totalPoints = await achievementsDatabase.getTotalPoints();

    return NextResponse.json({
      achievements,
      totalPoints,
    });
  } catch (error) {
    console.error('Achievements GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const achievement = await request.json();

    const unlocked = await achievementsDatabase.unlock(achievement);

    if (!unlocked) {
      return NextResponse.json(
        { error: 'Failed to unlock achievement' },
        { status: 500 }
      );
    }

    return NextResponse.json(unlocked, { status: 201 });
  } catch (error) {
    console.error('Achievements POST error:', error);
    return NextResponse.json(
      { error: 'Failed to unlock achievement' },
      { status: 500 }
    );
  }
}
