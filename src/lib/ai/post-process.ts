import type { StoryResult, SceneData, ShotData, ProductLock, ProductionConstraints } from "./types";
import { enforcePackaging } from "./product-lock";

// ============================================================
// normalizeStory — 确保 Story 输出格式一致（处理模型返回的各种变体）
// ============================================================
export function normalizeStory(raw: any): StoryResult {
  // 把对象值展平为字符串
  function toString(v: any): string {
    if (typeof v === "string") return v;
    if (v && typeof v === "object") {
      return v.description || v.text || v.content || v.desc || JSON.stringify(v);
    }
    return String(v || "");
  }

  const structure = raw.structure || {};
  return {
    logline: raw.logline || raw.summary || "",
    theme: raw.theme || raw.topic || "",
    structure: {
      beginning: toString(structure.beginning || structure.opening || structure.scene || structure.start || ""),
      middle: toString(structure.middle || structure.development || structure.conflict || structure.build || ""),
      climax: toString(structure.climax || structure.peak || structure.turning || structure.high || ""),
      ending: toString(structure.ending || structure.conclusion || structure.close || structure.final || ""),
    },
    characters: (raw.characters || []).map(function(c: any) {
      if (typeof c === "string") return { name: c, role: "supporting" as const, description: "" };
      return {
        name: c.name || c.character || c.person || "",
        role: (c.role === "protagonist" || c.role === "supporting" || c.role === "background") ? c.role : "supporting",
        description: c.description || c.desc || c.background || "",
      };
    }),
  };
}

// ============================================================
// normalizeScenes — 确保 Scene 输出格式一致
// ============================================================
export function normalizeScenes(rawScenes: any[]): SceneData[] {
  return (rawScenes || []).map(function(s: any, i: number) {
    return {
      sceneNumber: Number(s.sceneNumber) || i + 1,
      durationSec: Math.min(Math.max(Number(s.durationSec) || 5, 2), 60),
      location: String(s.location || ""),
      timeOfDay: String(s.timeOfDay || ""),
      action: String(s.action || ""),
      dialogue: String(s.dialogue || ""),
      voiceover: String(s.voiceover || ""),
      commercialNote: String(s.commercialNote || ""),
    };
  });
}

// ============================================================
// normalizeShots — 规范化镜头数据
// ============================================================
export function normalizeShots(rawShots: any[], constraints?: ProductionConstraints): ShotData[] {
  return (rawShots || []).map(function(shot: any, idx: number) {
    const cam = shot.camera || {};
    const lit = shot.lighting || {};
    const sub = shot.subject || {};
    return {
      shotNumber: Number(shot.shotNumber) || idx + 1,
      durationSec: Math.min(Math.max(Number(shot.durationSec) || 5, 2), 15),
      shotType: cleanShotType(shot.shotType || "medium"),
      camera: {
        lens: cleanLens(cam.lens || "35mm"),
        angle: cleanAngle(cam.angle || "平视"),
        movement: cleanMovement(cam.movement || ["固定"]),
        composition: cleanComposition(cam.composition || "三分法"),
      },
      lighting: {
        type: cleanLightingType(lit.type || "natural"),
        direction: lit.direction || "自然光",
        quality: cleanLightingQuality(lit.quality || "soft"),
        colorTemp: lit.colorTemp || "4500K 中性",
      },
      subject: {
        person: constraints?.talentMode === "no_actors" ? "" : (sub.person || ""),
        action: sub.action || "",
        costume: sub.costume || "",
        props: sub.props || [],
      },
      emotion: shot.emotion || "",
      sound: shot.sound || "",
      directorNote: shot.directorNote || "",
    };
  });
}

// ============================================================
// enforceProductLock — 扫描所有输出，强制替换包装词
// ============================================================
export function enforceProductLockOnScenes(scenes: SceneData[], lock: ProductLock, constraints?: ProductionConstraints): SceneData[] {
  const isNoActors = constraints?.talentMode === "no_actors";
  const noActorWords = ["博主", "主播", "主角", "我", "他", "她", "你", "演员", "模特",
    "拿起", "戴上", "穿上", "坐下", "站起", "走过", "看着", "指着", "对着镜子",
    "手里拿着", "用手", "坐在", "站在", "走在", "穿着", "戴着", "望着",
  ];
  let result = lock.packaging === "通用包装" ? scenes : scenes.map(function(s) {
    return {
      ...s,
      action: enforcePackaging(s.action, lock.packaging),
      dialogue: enforcePackaging(s.dialogue, lock.packaging),
      voiceover: enforcePackaging(s.voiceover, lock.packaging),
      location: enforcePackaging(s.location, lock.packaging),
      commercialNote: enforcePackaging(s.commercialNote, lock.packaging),
    };
  });
  
  if (isNoActors) {
    result = result.map(function(s) {
      let action = s.action;
      for (const w of noActorWords) {
        action = action.replace(new RegExp(w, "g"), "");
      }
      // Remove stray punctuation and extra spaces
      action = action.replace(/\s+/g, " ").replace(/^[,，。、\s]+/, "").trim();
      // If action is now empty, use a generic product description
      if (!action || action.length < 3) {
        action = lock.productName + "在" + s.location + "的展示画面。";
      }
      return {
        ...s,
        action: action,
        dialogue: "",
        voiceover: "",
      };
    });
  }
  return result;
}export function enforceProductLockOnShots(shots: ShotData[], lock: ProductLock): ShotData[] {
  if (lock.packaging === "通用包装") return shots;
  return shots.map(function(s) {
    return {
      ...s,
      subject: {
        ...s.subject,
        action: enforcePackaging(s.subject.action, lock.packaging),
      },
      directorNote: enforcePackaging(s.directorNote, lock.packaging),
      emotion: enforcePackaging(s.emotion, lock.packaging),
      sound: enforcePackaging(s.sound, lock.packaging),
    };
  });
}

// ============================================================
// 清理函数（从旧代码迁移）
// ============================================================
function cleanLens(s: string): string {
  return (s || "").replace(/^(镜头|焦段|焦距)/, "").replace(/(镜头|mm镜头).*$/, "mm").trim() || "35mm";
}
function cleanAngle(s: string): string {
  const angles = ["平视","低机位","高机位","俯拍","仰拍","过肩","POV","鸟瞰","侧拍","45度角"];
  for (const a of angles) { if ((s || "").indexOf(a) >= 0) return a; }
  return (s || "").slice(0, 10) || "平视";
}
function cleanMovement(s: string[]): string[] {
  const movements = ["固定","缓慢推近","缓慢拉远","横摇","手持跟拍","上升","下降","轨道横移"];
  const found = s.filter(function(m) { return movements.some(function(v) { return m.indexOf(v) >= 0; }); });
  return found.length > 0 ? found.slice(0, 2) : ["固定"];
}
function cleanComposition(s: string): string {
  const comps = ["三分法","中心对称","引导线","框架构图","大面积留白","前景虚化","对角线","对称"];
  for (const c of comps) { if ((s || "").indexOf(c) >= 0) return c; }
  return (s || "").slice(0, 15) || "三分法";
}
function cleanShotType(s: string): string {
  const t = (s || "").toLowerCase();
  if (t.indexOf("extreme wide") >= 0) return "extreme_wide";
  if (t.indexOf("wide") >= 0) return "wide";
  if (t.indexOf("extreme close") >= 0) return "extreme_closeup";
  if (t.indexOf("close") >= 0) return "closeup";
  if (t.indexOf("macro") >= 0) return "macro";
  return "medium";
}
function cleanLightingType(s: string): string {
  const t = (s || "").toLowerCase();
  if (t.indexOf("natural") >= 0) return "natural";
  if (t.indexOf("backlight") >= 0) return "backlight";
  if (t.indexOf("side") >= 0) return "side";
  if (t.indexOf("top") >= 0) return "top";
  return "natural";
}
function cleanLightingQuality(s: string): string {
  const t = (s || "").toLowerCase();
  if (t.indexOf("hard") >= 0 || t.indexOf("硬") >= 0) return "hard";
  if (t.indexOf("diffus") >= 0 || t.indexOf("散") >= 0) return "diffused";
  return "soft";
}
