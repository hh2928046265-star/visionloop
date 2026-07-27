import type { PipelineContext, ProductLock, ProductionConstraints, ThemeResult, StoryResult, SceneData, ShotData, ProjectTypeConfig } from "./types";
import { generateStructured, generateRawText } from "./provider";
import { extractProductLock, filterScenarios, enforcePackaging } from "./product-lock";
import { searchWeb, formatSearchContext } from "../search/web-search";
import { normalizeStory, normalizeScenes, normalizeShots, enforceProductLockOnScenes, enforceProductLockOnShots } from "./post-process";
// ============================================================
// 项目类型配置
// ============================================================
import { STYLE_SEEDING } from "./prompts/script-seeding";
import { SCRIPT_KOUBO_RAW_PROMPT, STYLE_KOUBO } from "./prompts/script-koubo";
import { STYLE_VLOG } from "./prompts/script-vlog";
import { STYLE_PROMO } from "./prompts/script-promo";
const PROJECT_TYPES: Record<string, ProjectTypeConfig> = {
  seeding:     { name: "种草推广", sceneCount: 4, shotCountFactor: 2, stylePrompt: STYLE_SEEDING,   scriptPrompt: "SEEDING",   noSceneDescription: false },
  koubo:       { name: "口播带货", sceneCount: 1, shotCountFactor: 1, stylePrompt: STYLE_KOUBO,     scriptPrompt: "KOUBO",     noSceneDescription: true },
  vlog:        { name: "Vlog",     sceneCount: 5, shotCountFactor: 2, stylePrompt: STYLE_VLOG,      scriptPrompt: "VLOG",      noSceneDescription: false },
  promo:       { name: "宣传片",   sceneCount: 7, shotCountFactor: 2, stylePrompt: STYLE_PROMO,     scriptPrompt: "PROMO",     noSceneDescription: false },
  short_video: { name: "短视频",   sceneCount: 4, shotCountFactor: 2, stylePrompt: STYLE_SEEDING,   scriptPrompt: "SHORT",     noSceneDescription: false },
};
function getProjectConfig(projectType?: string): ProjectTypeConfig {
  return PROJECT_TYPES[projectType || "seeding"] || PROJECT_TYPES.seeding;
}
// ============================================================
// Step 1: 主题分析
// ============================================================
export async function runThemeAnalysis(
  inputText: string,
  projectType: string | undefined,
  ctx: PipelineContext
): Promise<ThemeResult> {
  const config = getProjectConfig(projectType);
  const productLock = extractProductLock(inputText);
  let searchContext = "";
  if (ctx.searchEnabled) {
    try {
      const searchRes = await searchWeb(inputText + " 产品信息 包装 规格 使用场景", 5);
      searchContext = formatSearchContext(searchRes);
    } catch (_) { /* search fail silently */ }
  }
  const userPrompt = [
    config.stylePrompt,
    "用户输入：" + inputText,
    searchContext ? "【联网搜索结果-提取产品信息，禁止复制品牌名/型号】：\n" + searchContext : "",
    productLock ? "产品信息：包装=" + productLock.packaging + " 形态=" + productLock.productForm + " 场景=" + productLock.scenarios.join("、") : "",
    "输出JSON：{theme, emotions:[], visualKeywords:[], referenceStyle, suggestedDuration}",
  ].filter(Boolean).join("\n");
  const raw = await generateStructured({
    modelId: ctx.modelId,
    systemPrompt: "你是商业影视策划师。分析产品并输出JSON。先锁定产品信息再做主题分析。",
    userPrompt,
    customApiKeys: ctx.customApiKeys, temperature: 0.8,
  });
  return {
    theme: raw.theme || "",
    emotions: raw.emotions || [],
    visualKeywords: raw.visualKeywords || [],
    referenceStyle: raw.referenceStyle || "",
    suggestedDuration: raw.suggestedDuration || 30,
    productLock: productLock || {
      productName: inputText, packaging: "通用包装", productForm: "固体",
      scenarios: ["通用"], forbiddenScenarios: [],
    },
  };
}
// ============================================================
// Step 2: 故事生成
// ============================================================
export async function runStoryGen(
  themeResult: ThemeResult,
  constraints: ProductionConstraints | undefined,
  projectType: string | undefined,
  ctx: PipelineContext
): Promise<StoryResult> {
  const config = getProjectConfig(projectType);
  const lock = themeResult.productLock;
  const isNoActors = constraints?.talentMode === "no_actors";
  const isKoubo = projectType === "koubo";
  const scenarios = constraints?.locationType && constraints.locationType !== "any"
    ? filterScenarios(lock.scenarios, constraints.locationType)
    : lock.scenarios;
  // System prompt
  let systemPrompt = "你是商业故事编剧。围绕产品构建故事结构，输出JSON。";
  if (isKoubo) systemPrompt = "你是直播带货策划人。为口播设计结构。输出JSON。";
  else if (isNoActors) systemPrompt = "你是产品视觉导演。画面只有产品没有人。characters必须为空数组。输出JSON。";
  // Constraint lines
  const constraintLines: string[] = [];
  if (isNoActors) {
    constraintLines.push("[CRITICAL] 全程无人物出镜！characters必须为空数组[]。structure中不能描述人物动作。");
  }
  if (constraints?.locationType === "indoor") constraintLines.push("所有场景限定在室内。");
  if (constraints?.locationType === "outdoor") constraintLines.push("所有场景限定在户外。");
  if (constraints?.locationType === "nature") constraintLines.push("所有场景限定在自然环境中。");
  
  const userPrompt = [
    constraintLines.length > 0 ? constraintLines.join("\n") : "",
    "产品：" + lock.productName + "（包装：" + lock.packaging + "；形态：" + lock.productForm + "；场景：" + scenarios.join("、") + "）",
    "主题：" + themeResult.theme,
    "生成故事结构，包含：logline, theme, structure{beginning,middle,climax,ending}, characters[]",
    (isNoActors ? "[重申] characters必须为空数组[]。" : ""),
    "输出JSON。",
  ].filter(Boolean).join("\n");
  
  const raw = await generateStructured({
    modelId: ctx.modelId,
    systemPrompt,
    userPrompt,
    customApiKeys: ctx.customApiKeys, temperature: 0.7,
  });
  const story = normalizeStory(raw);
  if (isNoActors) story.characters = [];
  return story;
}

// ============================================================
// Step 3: 剧本创作
// ============================================================
export async function runScriptGen(
  story: StoryResult,
  constraints: ProductionConstraints | undefined,
  projectType: string | undefined,
  inputText: string | undefined,
  ctx: PipelineContext
): Promise<SceneData[]> {
  const config = getProjectConfig(projectType);
  const lock = extractProductLock(inputText || story.theme) || {
    productName: story.theme, packaging: "通用包装", productForm: "固体",
    scenarios: ["通用"], forbiddenScenarios: [],
  };
  const isKoubo = projectType === "koubo";
  const isNoActors = constraints?.talentMode === "no_actors";
  // ========== 口播路径：raw text ==========
  if (isKoubo) {
    const scenarios = constraints?.locationType && constraints.locationType !== "any"
      ? filterScenarios(lock.scenarios, constraints.locationType)
      : lock.scenarios;
    const locLabel = constraints?.locationType === "indoor" ? "室内"
      : constraints?.locationType === "outdoor" ? "户外"
      : constraints?.locationType === "nature" ? "自然环境中" : "合适的场景中";
    let searchCtx = "";
    if (ctx.searchEnabled) {
      try { const sr = await searchWeb(lock.productName + " 卖点 口感 使用体验", 5); searchCtx = formatSearchContext(sr); } catch (_) {}
    }
    const systemPrompt = SCRIPT_KOUBO_RAW_PROMPT;
    const userPrompt = [
      "产品：" + lock.productName,
      "包装：" + lock.packaging + "（硬约束，必须说对）",
      "产品形态：" + lock.productForm,
      "核心场景：" + scenarios.join("、"),
      "拍摄环境：" + locLabel,
      searchCtx ? "【联网参考】：" + searchCtx : "",
      "开始你的口播，直接说，不要任何前缀。",
    ].filter(Boolean).join("\n");
    let text = await generateRawText({
      modelId: ctx.modelId,
      systemPrompt,
      userPrompt,
      customApiKeys: ctx.customApiKeys, temperature: 0.7,
    });
    text = text.replace(/^(好的|OK|明白了|以下是|这是|那么).*?[\n。，]/, "").trim();
    if (lock.packaging !== "通用包装") {
      text = enforcePackaging(text, lock.packaging);
    }
    return [{
      sceneNumber: 1,
      durationSec: Math.max(30, Math.floor(text.length / 3)),
      location: "直播间",
      timeOfDay: "直播中",
      action: "主播口播",
      dialogue: text,
      voiceover: "",
      commercialNote: "",
    }];
  }
  // ========== 标准路径：SceneSchema ==========
  const constraintLines: string[] = [];
  if (isNoActors) {
    constraintLines.push("[CRITICAL] 全程无人物出镜！禁止任何人物动作描述（如：博主拿起、主角穿着、某人戴上）。禁止dialogue和voiceover中出现主播话术。禁止action中出现任何人称代词（他/她/我/你/主播/博主/主角/演员）。只能描述产品、物品、环境的运动。");
  }
  if (constraints?.locationType === "indoor") constraintLines.push("所有场景限定在室内环境。");
  if (constraints?.locationType === "outdoor") constraintLines.push("所有场景限定在户外人造环境。");
  if (constraints?.locationType === "nature") constraintLines.push("所有场景限定在纯自然环境。");
  
  const sysPromptLines = ["你是商业影视导演。把故事转化为可拍摄的剧本。输出JSON。"];
  if (isNoActors) sysPromptLines.push("[CRITICAL RULE] 本次创作全程无人物出镜。action字段只能描述产品本身、物品、光线、环境的运动，禁止任何人称代词和人物动作。dialogue和voiceover必须为空字符串。");
  
  const userPrompt = [
    constraintLines.length > 0 ? constraintLines.join("\n") : "",
    config.stylePrompt,
    "产品：" + lock.productName + "（包装：" + lock.packaging + "；形态：" + lock.productForm + "）",
    "主题：" + story.theme,
    "开场：" + story.structure.beginning,
    "发展：" + story.structure.middle,
    "高潮：" + story.structure.climax,
    "结局：" + story.structure.ending,
    "生成" + config.sceneCount + "个场景。每个场景包含：sceneNumber,durationSec,location,timeOfDay,action,dialogue,voiceover,commercialNote。",
    (isNoActors ? "[重申] 无人出镜——dialogue和voiceover全部为空字符串。action只能描述产品和环境。" : ""),
    "不同场景要有不同的location。不要从早到晚机械填充。",
    "输出JSON：{scenes:[...]}",
  ].filter(Boolean).join("\n");
  const raw = await generateStructured({
    modelId: ctx.modelId,
    systemPrompt: sysPromptLines.join(" "),
    userPrompt,
    customApiKeys: ctx.customApiKeys, temperature: 0.2,
  });
  const scenes = normalizeScenes(raw.scenes || []);
  return enforceProductLockOnScenes(scenes, lock, constraints);
}

// ============================================================
// Step 4: 分镜生成
export async function runShotsGen(
  scenes: SceneData[],
  constraints: ProductionConstraints | undefined,
  projectType: string | undefined,
  inputText: string | undefined,
  ctx: PipelineContext
): Promise<ShotData[]> {
  const config = getProjectConfig(projectType);
  const lock = extractProductLock(inputText || scenes[0]?.action || "") || {
    productName: "", packaging: "通用包装", productForm: "固体",
    scenarios: [], forbiddenScenarios: [],
  };
  const isNoActors = constraints?.talentMode === "no_actors";
  const shotsPerScene = config.shotCountFactor;
  const totalShots = projectType === "koubo" ? 1 : Math.max(6, config.sceneCount * shotsPerScene);
  let scriptSearchCtx = "";
  if (ctx.searchEnabled) {
    try {
      const scriptSearchRes = await searchWeb(lock.productName + " 使用场景 拍摄创意", 5);
      scriptSearchCtx = formatSearchContext(scriptSearchRes);
    } catch (_) { /* search fail silently */ }
  }
  const userPrompt = [
    config.stylePrompt,
    scriptSearchCtx ? "【联网搜索-产品参考信息】：\n" + scriptSearchCtx : "",
    "产品：" + lock.productName + "（" + lock.packaging + "）",
    "以下是要拆解的场景：",
    ...scenes.map(function(s) {
      return "Scene" + s.sceneNumber + ": " + s.location + " " + s.timeOfDay + " " + s.durationSec + "s - " + s.action;
    }),
    isNoActors ? "无人出镜。subject.person必须为空。" : "",
    "每场景拆" + shotsPerScene + "个镜头。总共至少" + totalShots + "个镜头。",
    "每个镜头的shotType、camera角度、焦段、composition必须各不相同。",
    "输出JSON：{shots:[...]}",
  ].filter(Boolean).join("\n");
  const raw = await generateStructured({
    modelId: ctx.modelId,
    systemPrompt: "你是资深电影摄影师。为场景拆解专业分镜。每个镜头包含shotNumber,durationSec,shotType,camera{lens,angle,movement[],composition},lighting{type,direction,quality,colorTemp},subject{person,action,costume,props[]},emotion,sound,directorNote。输出JSON。",
    userPrompt,
    customApiKeys: ctx.customApiKeys, temperature: 0.2,
  });
  const shots = normalizeShots(raw.shots || [], constraints);
  return enforceProductLockOnShots(shots, lock);
}
// ============================================================
// 导出
// ============================================================
export { PROJECT_TYPES, getProjectConfig };
