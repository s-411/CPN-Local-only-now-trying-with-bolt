import { NextRequest, NextResponse } from 'next/server';
import { girlsDatabase } from '@/lib/database/girls';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const girl = await girlsDatabase.getById(id);
    if (!girl) {
      return NextResponse.json(
        { error: 'Girl not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(girl);
  } catch (error) {
    console.error('Error in GET /api/girls/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch girl' },
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
    const updatedGirl = await girlsDatabase.update(id, body);
    if (!updatedGirl) {
      return NextResponse.json(
        { error: 'Girl not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(updatedGirl);
  } catch (error) {
    console.error('Error in PUT /api/girls/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update girl' },
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
    const success = await girlsDatabase.delete(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Girl not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/girls/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete girl' },
      { status: 500 }
    );
  }
}
