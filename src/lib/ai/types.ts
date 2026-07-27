import { z } from "zod";

// ============================================================
// Pipeline Context — 贯穿整个 Pipeline 的上下文
// ============================================================
export interface PipelineContext {
  customApiKeys?: Record<string, string>;
  modelId: string;
  searchEnabled: boolean;
}

// ============================================================
// Product Lock — Pipeline 第 0 帧，每一步强制校验
// ============================================================
export interface ProductLock {
  productName: string;
  packaging: string;           // "真空包装"|"盒装"|"瓶装"|...
  productForm: "液体"|"固体"|"粉末"|"膏状"|"颗粒";
  scenarios: string[];
  forbiddenScenarios: string[];
}

// ============================================================
// 拍摄条件
// ============================================================
export interface ProductionConstraints {
  talentMode: "actors" | "no_actors";
  locationType: "any" | "indoor" | "outdoor" | "nature";
  budget: "zero" | "low" | "medium" | "high";
}

// ============================================================
// Theme Analysis — Pipeline Step 1
// ============================================================
export interface ThemeResult {
  theme: string;
  emotions: string[];
  visualKeywords: string[];
  referenceStyle: string;
  suggestedDuration: number;
  productLock: ProductLock;
}

// ============================================================
// Story — Pipeline Step 2
// ============================================================
export interface StoryStructure {
  beginning: string;
  middle: string;
  climax: string;
  ending: string;
}

export interface Character {
  name: string;
  role: "protagonist" | "supporting" | "background";
  description: string;
}

export interface StoryResult {
  logline: string;
  theme: string;
  structure: StoryStructure;
  characters: Character[];
}

// ============================================================
// Scene — Pipeline Step 3
// ============================================================
export interface SceneData {
  sceneNumber: number;
  durationSec: number;
  location: string;
  timeOfDay: string;
  action: string;
  dialogue: string;
  voiceover: string;
  commercialNote: string;
}

// ============================================================
// Shot — Pipeline Step 4
// ============================================================
export interface ShotData {
  shotNumber: number;
  durationSec: number;
  shotType: string;
  camera: {
    lens: string;
    angle: string;
    movement: string[];
    composition: string;
  };
  lighting: {
    type: string;
    direction: string;
    quality: string;
    colorTemp: string;
  };
  subject: {
    person: string;
    action: string;
    costume: string;
    props: string[];
  };
  emotion: string;
  sound: string;
  directorNote: string;
}

// ============================================================
// Storyboard Frame
// ============================================================
export interface StoryboardFrame {
  shotIndex: number;
  imageUrl: string;
  caption: string;
  shotData: ShotData;
}

// ============================================================
// Project Type Config
// ============================================================
export interface ProjectTypeConfig {
  name: string;
  sceneCount: number;
  shotCountFactor: number;
  stylePrompt: string;
  scriptPrompt: string;
  noSceneDescription: boolean;
}

// ============================================================
// Model Config
// ============================================================
export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  baseURL: string;
  model: string;
  apiKeyEnv: string;
  description: string;
  local: boolean;
}

// ============================================================
// Zod Schemas (for validation & prompting)
// ============================================================
export const ThemeSchema = z.object({
  theme: z.string(),
  emotions: z.array(z.string()),
  visualKeywords: z.array(z.string()),
  referenceStyle: z.string(),
  suggestedDuration: z.number(),
});

export const StorySchema = z.object({
  logline: z.string(),
  theme: z.string(),
  structure: z.object({
    beginning: z.string(),
    middle: z.string(),
    climax: z.string(),
    ending: z.string(),
  }),
  characters: z.array(z.object({
    name: z.string(),
    role: z.enum(["protagonist","supporting","background"]),
    description: z.string(),
  })),
});

export const SceneSchema = z.object({
  sceneNumber: z.number(),
  durationSec: z.number(),
  location: z.string(),
  timeOfDay: z.string(),
  action: z.string(),
  dialogue: z.string(),
  voiceover: z.string(),
  commercialNote: z.string().optional().default(""),
});

export const SceneListSchema = z.object({
  scenes: z.array(SceneSchema),
});

export const ShotSchema = z.object({
  shotNumber: z.union([z.number(), z.string()]),
  durationSec: z.number().min(2).max(15).default(5),
  shotType: z.string(),
  camera: z.object({
    lens: z.string(),
    angle: z.string(),
    movement: z.array(z.string()),
    composition: z.string(),
  }),
  lighting: z.object({
    type: z.string(),
    direction: z.string(),
    quality: z.string(),
    colorTemp: z.string().optional().default("4500K 中性"),
  }),
  subject: z.object({
    person: z.string().optional().default(""),
    action: z.string().optional().default(""),
    costume: z.string().optional().default(""),
    props: z.array(z.string()).optional().default([]),
  }),
  emotion: z.string().optional().default(""),
  sound: z.string().optional().default(""),
  directorNote: z.string().optional().default(""),
});

export const ShotListSchema = z.object({
  shots: z.array(ShotSchema),
});
