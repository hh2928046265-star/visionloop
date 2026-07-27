import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

// ============================================================
// 用户表
// ============================================================
export const users = sqliteTable('users', {
  id:            text('id').primaryKey(),
  username:      text('username').notNull().unique(),
  email:         text('email').notNull().unique(),
  avatar:        text('avatar'),
  preferences:   text('preferences', { mode: 'json' }),
  createdAt:     text('created_at').notNull(),
});

// ============================================================
// 项目表
// ============================================================
export const projects = sqliteTable('projects', {
  id:            text('id').primaryKey(),
  title:         text('title').notNull(),
  description:   text('description').default(''),
  type:          text('type').notNull().default('short_video'),
  status:        text('status').notNull().default('theme'),
  style:         text('style', { mode: 'json' }),
  durationSec:   integer('duration_sec').default(60),
  ownerId:       text('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt:     text('created_at').notNull(),
  updatedAt:     text('updated_at').notNull(),
});

// ============================================================
// 主题表
// ============================================================
export const ideas = sqliteTable('ideas', {
  id:            text('id').primaryKey(),
  projectId:     text('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  version:       integer('version').notNull().default(1),
  inputText:     text('input_text').notNull(),
  analysis:      text('analysis', { mode: 'json' }),
  status:        text('status').default('draft'),
  createdAt:     text('created_at').notNull(),
});

// ============================================================
// 故事表
// ============================================================
export const stories = sqliteTable('stories', {
  id:            text('id').primaryKey(),
  projectId:     text('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  ideaId:        text('idea_id').references(() => ideas.id, { onDelete: 'set null' }),
  version:       integer('version').notNull().default(1),
  logline:       text('logline').default(''),
  theme:         text('theme').default(''),
  structure:     text('structure', { mode: 'json' }),
  characters:    text('characters', { mode: 'json' }),
  status:        text('status').default('draft'),
  createdAt:     text('created_at').notNull(),
});

// ============================================================
// 剧本表
// ============================================================
export const scripts = sqliteTable('scripts', {
  id:            text('id').primaryKey(),
  projectId:     text('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  storyId:       text('story_id').references(() => stories.id, { onDelete: 'set null' }),
  version:       integer('version').notNull().default(1),
  title:         text('title').default(''),
  status:        text('status').default('draft'),
  createdAt:     text('created_at').notNull(),
});

// ============================================================
// 场景表
// ============================================================
export const scenes = sqliteTable('scenes', {
  id:            text('id').primaryKey(),
  scriptId:      text('script_id').references(() => scripts.id, { onDelete: 'cascade' }).notNull(),
  sceneNumber:   integer('scene_number').notNull(),
  location:      text('location').default(''),
  timeOfDay:     text('time_of_day').default(''),
  durationSec:   integer('duration_sec'),
  action:        text('action').default(''),
  dialogue:      text('dialogue').default(''),
  voiceover:     text('voiceover').default(''),
  sortOrder:     integer('sort_order').notNull().default(0),
  createdAt:     text('created_at').notNull(),
});

// ============================================================
// 分镜表（核心实体）
// ============================================================
export const shots = sqliteTable('shots', {
  id:            text('id').primaryKey(),
  sceneId:       text('scene_id').references(() => scenes.id, { onDelete: 'cascade' }).notNull(),
  projectId:     text('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  shotNumber:    integer('shot_number').notNull(),
  durationSec:   integer('duration_sec'),
  shotType:      text('shot_type').default('medium'),
  camera:        text('camera', { mode: 'json' }),
  lighting:      text('lighting', { mode: 'json' }),
  subject:       text('subject', { mode: 'json' }),
  emotion:       text('emotion').default(''),
  sound:         text('sound').default(''),
  directorNote:  text('director_note').default(''),
  sortOrder:     integer('sort_order').notNull().default(0),
  status:        text('status').default('draft'),
  createdAt:     text('created_at').notNull(),
});

// ============================================================
// 故事板表
// ============================================================
export const storyboards = sqliteTable('storyboards', {
  id:            text('id').primaryKey(),
  projectId:     text('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  layout:        text('layout').default('3x3'),
  title:         text('title').default(''),
  version:       integer('version').notNull().default(1),
  status:        text('status').default('draft'),
  createdAt:     text('created_at').notNull(),
});

// ============================================================
// 故事板帧表
// ============================================================
export const storyboardFrames = sqliteTable('storyboard_frames', {
  id:            text('id').primaryKey(),
  storyboardId:  text('storyboard_id').references(() => storyboards.id, { onDelete: 'cascade' }).notNull(),
  shotId:        text('shot_id').references(() => shots.id, { onDelete: 'set null' }),
  imageUrl:      text('image_url').default(''),
  caption:       text('caption').default(''),
  sortOrder:     integer('sort_order').notNull().default(0),
  createdAt:     text('created_at').notNull(),
});

// ============================================================
// 资产表
// ============================================================
export const assets = sqliteTable('assets', {
  id:            text('id').primaryKey(),
  projectId:     text('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  type:          text('type').notNull(),
  url:           text('url').notNull(),
  thumbnailUrl:  text('thumbnail_url').default(''),
  metadata:      text('metadata', { mode: 'json' }),
  createdAt:     text('created_at').notNull(),
});

// ============================================================
// 分镜-资产关联表（多对多）
// ============================================================
export const shotAssets = sqliteTable('shot_assets', {
  shotId:  text('shot_id').references(() => shots.id, { onDelete: 'cascade' }).notNull(),
  assetId: text('asset_id').references(() => assets.id, { onDelete: 'cascade' }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.shotId, t.assetId] }),
}));

// ============================================================
// AI 请求记录表
// ============================================================
export const aiRequests = sqliteTable('ai_requests', {
  id:            text('id').primaryKey(),
  projectId:     text('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  model:         text('model').notNull(),
  type:          text('type').notNull(),
  input:         text('input', { mode: 'json' }).notNull(),
  output:        text('output', { mode: 'json' }),
  tokens:        integer('tokens'),
  latencyMs:     integer('latency_ms'),
  version:       integer('version').notNull().default(1),
  createdAt:     text('created_at').notNull(),
});

// ============================================================
// 快照表（通用版本管理）
// ============================================================
export const snapshots = sqliteTable('snapshots', {
  id:            text('id').primaryKey(),
  projectId:     text('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  entityType:    text('entity_type').notNull(),
  entityId:      text('entity_id').notNull(),
  version:       integer('version').notNull(),
  data:          text('data', { mode: 'json' }).notNull(),
  createdAt:     text('created_at').notNull(),
});
