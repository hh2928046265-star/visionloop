// ============================================================
// VisionLoop - 统一类型定义
// ============================================================

// --- 管线步骤 ---
export type PipelineStep = "theme" | "constraints" | "story" | "storyboard" | "completed";

// --- 主题分析 (Idea) ---
export interface IdeaAnalysis {
  theme: string;
  productName: string;
  packaging: string;         // 盒装/瓶装/袋装/杯装/罐装/真空包装/散装...
  productForm: string;       // 液体/固体/粉末/膏状/颗粒
  productFeatures: string;   // 外观特征 ≥30字
  productScenarios: string[];
  forbiddenScenarios: string[];
  productDescription: string; // 完整描述 ≥50字
  emotions: string[];
  visualKeywords: string[];
  referenceStyle: string;
  suggestedDuration: number;
  contentType?: string;
  productRole?: string;
  avoidList?: string[];
}

// --- 故事结构 ---
export interface StoryStructure {
  beginning: string;
  middle: string;
  climax: string;
  ending: string;
}

// --- 角色 ---
export interface Character {
  name: string;
  role: "protagonist" | "supporting" | "background";
  description: string;
  age?: number;
  gender?: string;
  costume?: string;
  notes?: string;
}

// --- 拍摄条件 ---
export interface ProductionConstraints {
  talentMode: "actors" | "no_actors" | "silhouette_only";
  locationType: "any" | "indoor" | "outdoor" | "nature";
  equipment: "phone" | "camera" | "pro" | "drone";
  budget: "zero" | "low" | "medium" | "high";
  lighting: "natural" | "basic" | "pro";
  crew: "solo" | "small" | "full";
}

export const DEFAULT_CONSTRAINTS: ProductionConstraints = {
  talentMode: "actors",
  locationType: "any",
  equipment: "camera",
  budget: "low",
  lighting: "natural",
  crew: "solo",
};

// --- 场景 (Script 中的一场) ---
export interface SceneData {
  sceneNumber: number;
  durationSec: number;
  location: string;
  timeOfDay: string;
  action: string;
  dialogue: string;
  voiceover: string;
  commercialNote?: string;
}

// --- 分镜数据 ---
export interface ShotData {
  shotNumber: number;
  durationSec: number;
  shotType: string;
  scene: string;
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
  hookPoint?: string;
  brandIntegration?: string;
}

// --- 故事数据 ---
export interface StoryData {
  logline: string;
  theme: string;
  structure: StoryStructure;
  characters: Character[];
}

// --- AI 模型配置 ---
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

// --- 版本快照 ---
export interface PipelineSnapshot {
  id: string;
  version: number;
  label: string;
  createdAt: string;
  themeInput: string;
  themeAnalysis: any;
  constraints: any;
  storyData: any;
  scenes: SceneData[];
  shots: ShotData[];
  storyboardImages: Record<number, string>;
  isActive: boolean;
}

// --- 项目状态 ---
export interface ProjectState {
  id: string;
  title: string;
  description: string;
  type: string;
  status: PipelineStep;
  modelId: string;
  generating: string;
  themeInput: string;
  themeAnalysis: any;
  constraints: ProductionConstraints;
  storyData: StoryData | null;
  scenes: SceneData[];
  shots: ShotData[];
  storyboardImages: Record<number, string>;
  snapshots: PipelineSnapshot[];
  activeSnapshotId: string | null;
}

// --- Project Actions ---
export type ProjectAction =
  | { type: "SET_PROJECT"; payload: any }
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_TYPE"; payload: string }
  | { type: "SET_STATUS"; payload: PipelineStep }
  | { type: "SET_THEME_INPUT"; payload: string }
  | { type: "SET_THEME_ANALYSIS"; payload: any }
  | { type: "SET_CONSTRAINTS"; payload: any }
  | { type: "SET_STORY_DATA"; payload: any }
  | { type: "SET_SCENES"; payload: SceneData[] }
  | { type: "SET_SHOTS"; payload: ShotData[] }
  | { type: "SET_STORYBOARD_IMAGES"; payload: Record<number, string> }
  | { type: "SET_MODEL_ID"; payload: string }
  | { type: "SET_GENERATING"; payload: string }
  | { type: "SAVE_SNAPSHOT"; payload: { label: string } }
  | { type: "LOAD_SNAPSHOT"; payload: string }
  | { type: "DELETE_SNAPSHOT"; payload: string }
  | { type: "COMPARE_SNAPSHOT"; payload: string | null };

// --- AI 请求参数 ---
export interface AiRequestParams {
  action: string;
  data: Record<string, any>;
  modelId?: string;
  constraints?: ProductionConstraints;
  searchEnabled?: boolean;
}