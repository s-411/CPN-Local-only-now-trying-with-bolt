import { NextRequest, NextResponse } from 'next/server';
import { dataEntriesDatabase } from '@/lib/database/dataEntries';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('cpn_session_token')?.value;
    const { searchParams } = new URL(request.url);
    const girlId = searchParams.get('girlId');

    if (girlId) {
      const entries = await dataEntriesDatabase.getByGirlId(girlId);
      return NextResponse.json(entries);
    }

    const entries = await dataEntriesDatabase.getAll(sessionToken);
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error in GET /api/data-entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newEntry = await dataEntriesDatabase.create(body);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/data-entries:', error);
    return NextResponse.json(
      { error: 'Failed to create data entry' },
      { status: 500 }
    );
  }
}
