import { NextRequest, NextResponse } from 'next/server';
import { girlsDatabase } from '@/lib/database/girls';

export async function GET() {
  try {
    const girls = await girlsDatabase.getAll();
    return NextResponse.json(girls);
  } catch (error) {
    console.error('Error in GET /api/girls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch girls' },
      { status: 500 }
    );
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
