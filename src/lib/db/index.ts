import { sql } from 'drizzle-orm';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { eq } from 'drizzle-orm';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'storyboard.db');
const dbUrl = process.env.DATABASE_URL ?? `file:${dbPath}`;

const client = createClient({
  url: dbUrl,
});

export const db = drizzle(client, { schema });

// 初始化：确保 demo 用户存在
export async function ensureDemoUser() {
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, 'demo-user-001'))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(schema.users).values({
      id: 'demo-user-001',
      username: 'demo',
      email: 'demo@storyboard.local',
      avatar: null,
      preferences: {
        defaultStyle: 'cinematic',
        favoriteGenres: [],
        experienceLevel: 'professional',
      },
      createdAt: new Date().toISOString(),
    });
    console.log('Demo user created');
  }
}

export { schema };

let foreignKeysEnabled = false;
let demoUserEnsured = false;

export async function initDb() {
  if (!foreignKeysEnabled) {
    await db.run(sql`PRAGMA foreign_keys = ON`);
    foreignKeysEnabled = true;
  }
  if (!demoUserEnsured) {
    await ensureDemoUser();
    demoUserEnsured = true;
  }
}