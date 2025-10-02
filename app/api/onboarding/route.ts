import { NextRequest, NextResponse } from 'next/server';
import { onboardingDatabase } from '@/lib/database/onboarding';

export async function GET() {
  try {
    const state = await onboardingDatabase.getOrCreate();

    if (!state) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    return NextResponse.json(state);
  } catch (error) {
    console.error('Onboarding GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding state' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json();

    const state = await onboardingDatabase.update(updates);

    if (!state) {
      return NextResponse.json(
        { error: 'Failed to update onboarding state' },
        { status: 500 }
      );
    }

    return NextResponse.json(state);
  } catch (error) {
    console.error('Onboarding PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding state' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'complete') {
      const state = await onboardingDatabase.complete();

      if (!state) {
        return NextResponse.json(
          { error: 'Failed to complete onboarding' },
          { status: 500 }
        );
      }

      return NextResponse.json(state);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Onboarding POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process onboarding action' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const success = await onboardingDatabase.clear();

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to clear onboarding state' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to clear onboarding state' },
      { status: 500 }
    );
  }
}
