import { NextRequest, NextResponse } from 'next/server';
import { dataEntriesDatabase } from '@/lib/database/dataEntries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entry = await dataEntriesDatabase.getById(id);
    if (!entry) {
      return NextResponse.json(
        { error: 'Data entry not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error in GET /api/data-entries/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data entry' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedEntry = await dataEntriesDatabase.update(id, body);
    if (!updatedEntry) {
      return NextResponse.json(
        { error: 'Data entry not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error in PUT /api/data-entries/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update data entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await dataEntriesDatabase.delete(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Data entry not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/data-entries/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete data entry' },
      { status: 500 }
    );
  }
}
