import { NextResponse } from 'next/server';
import { getOrCreateSession } from '@/lib/database/session';

export async function POST() {
  try {
    const session = await getOrCreateSession();
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error in POST /api/session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
