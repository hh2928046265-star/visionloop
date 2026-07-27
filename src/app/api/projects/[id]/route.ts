import { NextRequest, NextResponse } from 'next/server';
import { db, schema, initDb } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { now } from '@/lib/utils';

const { projects } = schema;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb();
  try {
    const { id } = await params;
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);

    if (!result[0]) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb();
  try {
    const { id } = await params;
    const body = await req.json();
    const timestamp = now();

    const existing = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (!existing[0]) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db
      .update(projects)
      .set({ ...body, updatedAt: timestamp })
      .where(eq(projects.id, id));

    const updated = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PATCH /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb();
  try {
    const { id } = await params;

    const existing = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (!existing[0]) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.delete(projects).where(eq(projects.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
