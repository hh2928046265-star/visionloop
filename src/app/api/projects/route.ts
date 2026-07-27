import { NextRequest, NextResponse } from 'next/server';
import { db, schema, initDb } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { now } from '@/lib/utils';

const { projects } = schema;

// GET /api/projects — 获取项目列表
export async function GET(req: NextRequest) {
  await initDb();
  try {
    const ownerId = req.nextUrl.searchParams.get('ownerId');
    if (!ownerId) {
      return NextResponse.json({ error: 'ownerId required' }, { status: 400 });
    }

    const list = await db
      .select()
      .from(projects)
      .where(eq(projects.ownerId, ownerId))
      .orderBy(desc(projects.updatedAt));

    return NextResponse.json(list);
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/projects — 创建项目
export async function POST(req: NextRequest) {
  await initDb();
  try {
    const body = await req.json();
    const { title, description, type, style, durationSec, ownerId } = body;

    if (!title || !ownerId) {
      return NextResponse.json({ error: 'title and ownerId required' }, { status: 400 });
    }

    const id = uuid();
    const timestamp = now();

    await db.insert(projects).values({
      id,
      title,
      description: description ?? '',
      type: type ?? 'short_video',
      status: 'theme',
      style: style ?? null,
      durationSec: durationSec ?? 60,
      ownerId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const created = await db.select().from(projects).where(eq(projects.id, id)).limit(1);

    return NextResponse.json(created[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
