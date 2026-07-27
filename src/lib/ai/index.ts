// AI Pipeline — unified export
// 统一导出所有 pipeline 函数和类型

export { runThemeAnalysis, runStoryGen, runScriptGen, runShotsGen, PROJECT_TYPES, getProjectConfig } from "./pipeline";
export { generateStructured, generateRawText, MODEL_REGISTRY, getModelConfig } from "./provider";
export type { PipelineContext, ProductLock, ProductionConstraints, ThemeResult, StoryResult, SceneData, ShotData, StoryboardFrame, ProjectTypeConfig, ModelConfig } from "./types";
