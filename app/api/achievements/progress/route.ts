import { NextRequest, NextResponse } from 'next/server';
import { achievementsDatabase } from '@/lib/database/achievements';

export async function GET() {
  try {
    const progress = await achievementsDatabase.getProgress();

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Achievement progress GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievement progress' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { achievementType, currentValue, targetValue } = await request.json();

    if (!achievementType || currentValue === undefined || targetValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const progress = await achievementsDatabase.updateProgress(
      achievementType,
      currentValue,
      targetValue
    );

    if (!progress) {
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Achievement progress PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update achievement progress' },
      { status: 500 }
    );
  }
}
