import { NextRequest, NextResponse } from 'next/server';
import { girlsDatabase } from '@/lib/database/girls';
import { getSessionTokenFromRequest } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = await getSessionTokenFromRequest(request);
    if (!sessionToken) {
      // Return empty array instead of 401 - user just doesn't have data yet
      return NextResponse.json([]);
    }
    const girls = await girlsDatabase.getAll(sessionToken);
    return NextResponse.json(girls);
  } catch (error) {
    console.error('Error in GET /api/girls:', error);
    // Return empty array on error to allow app to load
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newGirl = await girlsDatabase.create(body);
    return NextResponse.json(newGirl, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/girls:', error);
    return NextResponse.json(
      { error: 'Failed to create girl' },
      { status: 500 }
    );
  }
}
