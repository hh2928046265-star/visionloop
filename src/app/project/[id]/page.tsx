'use client';
import React from 'react';
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Cpu, Lightbulb, BookOpen, FileText, Camera, Layout, Settings, Users, MapPin, Smartphone, Wallet, Sun, Download,
  Sparkles, ChevronRight, Play, Clock, User, Mic, Maximize2, Aperture,
  Eye, Palette, Save, Plus, CheckCircle2, Circle,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSettings } from "@/lib/settings-store";
import { SnapshotToolbar, CompareView } from "@/components/project/version-compare";
import TimelineView from "@/components/project/timeline-view";
import ShotEditor from "@/components/project/shot-editor";
import ParticleBurst from "@/components/particle-burst";
import { ShotStatusBadge, type ShotStatus } from "@/components/project/shot-status";
import type { IdeaAnalysis, StoryStructure, Character, ShotData, SceneData } from "@/types";
import { generateBatchImagesBrowser, type BatchProgress } from "@/lib/image-service";

const PROJECT_TYPES: Record<string, string> = {
  seeding: "种草推广",
  koubo: "口播带货",
  vlog: "Vlog",
  promo: "宣传片",
  short_video: "短视频",
};

const SHOT_TYPE_LABELS: Record<string, string> = {
  extreme_wide: "远景", wide: "全景", medium: "中景",
  closeup: "特写", extreme_closeup: "大特写", macro: "微距",
};

const PIPELINE = [
  { key: "theme", label: "主题分析", icon: Lightbulb, color: "from-[#0D1B2A] to-[#1E3A4D]", bg: "bg-[#0D1B2A]/8", text: "text-[#1E3A4D]" },
  { key: "constraints", label: "拍摄条件", icon: Settings, color: "from-[#0D1B2A] to-[#1E3A4D]", bg: "bg-[#0D1B2A]/6", text: "text-[#1E3A4D]" },
  { key: "story", label: "故事结构", icon: BookOpen, color: "from-[#0D1B2A] to-[#1E3A4D]", bg: "bg-[#0D1B2A]/8", text: "text-[#1E3A4D]" },
  { key: "script", label: "剧本创作", icon: FileText, color: "from-[#0D1B2A] to-[#1E3A4D]", bg: "bg-[#0D1B2A]/8", text: "text-[#1E3A4D]" },
  { key: "storyboard", label: "故事板", icon: Layout, color: "from-[#0D1B2A] to-[#1E3A4D]", bg: "bg-[#0D1B2A]/8", text: "text-[#1E3A4D]" },
];








function exportScript(scenes: SceneData[], title: string) {
  const nl = "\n";
  let text = "═══════════════════════════════════════════" + nl;
  text += "  " + (title || "未命名项目") + nl;
  text += "  完整剧本" + nl;
  text += "  导出日期：" + new Date().toLocaleDateString("zh-CN") + nl;
  text += "═══════════════════════════════════════════" + nl + nl;
  
  scenes.forEach(function(s) {
    text += "┌─ 场景 " + s.sceneNumber + " ─────────────────────────────" + nl;
    text += "│ 地点：" + s.location + nl;
    text += "│ 时间：" + s.timeOfDay + "  ·  时长：" + s.durationSec + "s" + nl;
    text += "│" + nl;
    text += "│ 【画面动作】" + nl;
    text += "│ " + s.action + nl;
    if (s.dialogue) {
      text += "│" + nl;
      text += "│ 【台词】" + nl;
      text += "│ " + s.dialogue + nl;
    }
    if (s.voiceover) {
      text += "│" + nl;
      text += "│ 【旁白】" + nl;
      text += "│ " + s.voiceover + nl;
    }
    if (s.commercialNote) {
      text += "│" + nl;
      text += "│ 【商业备注】" + nl;
      text += "│ " + s.commercialNote + nl;
    }
    text += "└" + "─".repeat(46) + nl + nl;
  });
  return text;
}

function exportStoryboardHTML(shots: ShotData[], scenes: SceneData[], storyboardImages: Record<number, string>, title: string) {
  const shotTypeLabels: Record<string, string> = {
    extreme_wide: "远景", wide: "全景", medium: "中景",
    closeup: "特写", extreme_closeup: "大特写", macro: "微距",
  };
  
  var cards = shots.map(function(shot) {
    var imgSrc = storyboardImages[shot.shotNumber] || "";
    var imgHtml = imgSrc 
      ? '<img src="' + imgSrc + '" alt="分镜 ' + shot.shotNumber + '" style="width:100%;border-radius:12px;display:block;" />'
      : '<div style="width:100%;aspect-ratio:16/9;background:#f3f4f6;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:14px;">暂无图片</div>';
    
    return [
      '<div class="card">',
      '  <div class="card-header">',
      '    <span class="shot-num">#' + shot.shotNumber + '</span>',
      '    <span class="shot-type">' + (shotTypeLabels[shot.shotType] || shot.shotType) + '</span>',
      '    <span class="shot-dur">' + shot.durationSec + 's</span>',
      '  </div>',
      '  ' + imgHtml,
      '  <div class="card-body">',
      '    <div class="info-row"><span class="label">焦段</span><span>' + shot.camera.lens + '</span></div>',
      '    <div class="info-row"><span class="label">机位</span><span>' + shot.camera.angle + '</span></div>',
      '    <div class="info-row"><span class="label">运镜</span><span>' + shot.camera.movement.join(" · ") + '</span></div>',
      '    <div class="info-row"><span class="label">构图</span><span>' + shot.camera.composition + '</span></div>',
      '    <div class="info-row"><span class="label">光线</span><span>' + shot.lighting.direction + '（' + shot.lighting.quality + '）' + shot.lighting.colorTemp + '</span></div>',
      '    <div class="info-row"><span class="label">动作</span><span>' + (shot.subject.person ? shot.subject.person + ' · ' : '') + shot.subject.action + '</span></div>',
      '    <div class="info-row"><span class="label">情绪</span><span>' + (shot.emotion || '—') + '</span></div>',
      '    <div class="info-row"><span class="label">声音</span><span>' + (shot.sound || '—') + '</span></div>',
      '    <div class="info-row"><span class="label">导演备注</span><span>' + (shot.directorNote || '—') + '</span></div>',
      '  </div>',
      '</div>'
    ].join("\n");
  }).join("\n");

  return [
    '<!DOCTYPE html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<title>' + (title || "故事板") + ' · 故事板</title>',
    '<style>',
    '* { margin: 0; padding: 0; box-sizing: border-box; }',
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; background: #f5f4f0; color: #333; padding: 40px 20px; }',
    '.container { max-width: 800px; margin: 0 auto; }',
    'h1 { font-size: 28px; font-weight: 700; text-align: center; margin-bottom: 4px; color: #1a1a1a; }',
    '.subtitle { text-align: center; font-size: 14px; color: #888; margin-bottom: 32px; }',
    '.card { background: #fff; border-radius: 16px; overflow: hidden; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }',
    '.card-header { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: linear-gradient(135deg, #0D1B2A, #1E3A4D); color: #fff; }',
    '.shot-num { font-weight: 700; font-size: 16px; }',
    '.shot-type { font-size: 13px; opacity: 0.9; }',
    '.shot-dur { margin-left: auto; font-size: 13px; opacity: 0.9; }',
    '.card-body { padding: 16px; }',
    '.info-row { display: flex; padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }',
    '.info-row:last-child { border-bottom: none; }',
    '.label { width: 80px; flex-shrink: 0; color: #888; font-weight: 500; }',
    '@media print { body { background: #fff; padding: 20px; } .card { box-shadow: none; border: 1px solid #e5e5e5; break-inside: avoid; } }',
    '</style>',
    '</head>',
    '<body>',
    '<div class="container">',
    '<h1>' + (title || "故事板") + '</h1>',
    '<p class="subtitle">故事板 · ' + shots.length + ' 个分镜 · ' + new Date().toLocaleDateString("zh-CN") + '</p>',
    cards,
    '</div>',
    '</body>',
    '</html>'
  ].join("\n");
}

function downloadText(content: string, filename: string, mimeType?: string) {
  var blob = new Blob([content], { type: mimeType || "text/plain;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("seeding");
  const [status, setStatus] = useState("theme");

  const [themeInput, setIdeaInput] = useState("");
  const [themeAnalysis, setIdeaAnalysis] = useState<IdeaAnalysis | null>(null);
  const [storyData, setStoryData] = useState<{
    logline: string; theme: string;
    structure: StoryStructure; characters: Character[];
  } | null>(null);
  const [scenes, setScenes] = useState<SceneData[]>([]);
  const [shots, setShots] = useState<ShotData[]>([]);
  const [storyboardImages, setStoryboardImages] = useState<Record<number, string>>({});
  const { settings } = useSettings();
  const modelId = settings.selectedModelId;
  const modelName = settings.selectedModelId === "deepseek-v4pro" ? "DeepSeek 云端" : settings.selectedModelId === "qwen2.5-7b" ? "Qwen 2.5 7B" : "DeepSeek R1 8B";
  const [constraints, setConstraints] = useState({ talentMode: "actors", locationType: "any", equipment: "camera", budget: "low", lighting: "natural", crew: "solo" });
  const [generating, setGenerating] = useState("");
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>(null);
  const [compareSnapshotId, setCompareSnapshotId] = useState<string | null>(null);

  const [shotStatuses, setShotStatuses] = useState<Record<number, any>>({});
  const [editingShot, setEditingShot] = useState<number | null>(null);

  useEffect(() => { loadProject(); }, [id]);

  async function loadProject() {
    try {
      const res = await fetch("/api/projects/" + id);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProject(data);
      setTitle(data.title);
      setDescription(data.description ?? "");
      setType(data.type);
      setStatus(data.status);
    } catch { toast("加载失败", { id: "load-fail" }); }
    finally { setLoading(false); }
  }

  async function handleSave(fields?: Record<string, unknown>) {
    try {
      await fetch("/api/projects/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type, status, ...fields }),
      });
    } catch { toast("保存失败", { id: "save-fail" }); }
  }

  async function runThemeAnalysis() {
    if (!themeInput.trim()) { toast("请先输入主题", { id: "need-idea" }); return; }
    setGenerating("theme");
    toast("AI 正在分析你的主题...", { id: "analyzing" });
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze_theme", data: { inputText: themeInput, projectType: type }, modelId, customApiKeys: settings.customApiKeys, searchEnabled: true }),
      });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.error || "AI 服务错误"); }
      const data = await res.json();
      setIdeaAnalysis(data);
      setStatus("constraints");
      handleSave({ status: "constraints" });
      toast("主题分析完成！请设置拍摄条件", { id: "analysis-done" });
    } catch (err: any) {
      toast(err.message || "AI 分析失败，请检查API Key 配置", { id: "analysis-err" });
    }
    setGenerating("");
  }

  async function runStoryGen() {
    if (!themeAnalysis) { toast("请先完成主题分析", { id: "need-analysis" }); return; }
    setGenerating("story");
    toast("正在生成故事...", { id: "story-gen" });
    try {
      const storyRes = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_story", data: { idea: themeAnalysis, projectType: type, inputText: themeInput, productDescription: themeAnalysis?.productDescription || "", packaging: themeAnalysis?.packaging || "" }, modelId, customApiKeys: settings.customApiKeys, constraints, searchEnabled: true }),
      });
      if (!storyRes.ok) {
        const errData = await storyRes.json().catch(() => ({}));
        throw new Error(errData.error || "故事生成失败");
      }
      const newStoryData = await storyRes.json();
      setStoryData(newStoryData);
      
      setGenerating("script");
      toast("正在生成剧本...", { id: "script-gen" });
      const scriptRes = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_script", data: { story: newStoryData, projectType: type, inputText: themeInput, productDescription: themeAnalysis?.productDescription || "", packaging: themeAnalysis?.packaging || "" }, modelId, customApiKeys: settings.customApiKeys, constraints, searchEnabled: true }),
      });
      if (!scriptRes.ok) {
        const errData = await scriptRes.json().catch(() => ({}));
        throw new Error(errData.error || "剧本生成失败");
      }
      const scriptData = await scriptRes.json();
      setScenes(scriptData.scenes || []);
      
      toast("故事和剧本已按你的条件生成！", { id: "story-script-done" });
      setStatus("script");
      handleSave({ status: "script" });
    } catch (err: any) {
      toast(err.message || "生成失败，请检查Ollama 是否运行", { id: "gen-err" });
    }
    setGenerating("");
  }

  async function runShotGen() {
    setStoryboardImages({}); setShots([]);
    if (scenes.length === 0) { toast("请先生成剧本", { id: "need-script" }); return; }
    setGenerating("storyboard");
    toast("正在生成故事板...", { id: "shot-gen" });
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_shots", data: { scenes, projectType: type, inputText: themeInput, productDescription: themeAnalysis?.productDescription || "", packaging: themeAnalysis?.packaging || "" }, modelId, customApiKeys: settings.customApiKeys, constraints, searchEnabled: true }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "分镜生成失败");
      }
      const data = await res.json();
      setShots(data.shots || []);
      toast("分镜拆解完成！共 " + (data.shots?.length || 0) + " 个镜头", { id: "shot-done" });
      setStatus("storyboard");
      handleSave({ status: "storyboard" });
    } catch (err: any) {
      toast(err.message || "分镜生成失败，请检查API Key 配置", { id: "shot-err" });
    }
    setGenerating("");
  }

  // ===== 版本管理（快照系统）=====
  function handleSaveSnapshot() {
    var snap = {
      id: crypto.randomUUID(), version: snapshots.length + 1,
      label: "版本" + (snapshots.length + 1) + " · " + new Date().toLocaleTimeString("zh-CN"),
      createdAt: new Date().toISOString(),
      themeInput: themeInput, themeAnalysis: themeAnalysis, constraints: constraints,
      storyData: storyData, scenes: scenes, shots: shots, storyboardImages: storyboardImages,
      isActive: true,
    };
    setSnapshots([...snapshots.map(function(s: any) { return Object.assign({}, s, { isActive: false }); }), snap]);
    setActiveSnapshotId(snap.id);
    toast("版本已保存 · 共" + (snapshots.length + 1) + "个版本");
  }
  function handleLoadSnapshot(id: string) {
    var target = snapshots.find(function(s: any) { return s.id === id; });
    if (!target) return;
    setIdeaInput(target.themeInput); setIdeaAnalysis(target.themeAnalysis);
    setConstraints(target.constraints); setStoryData(target.storyData);
    setScenes(target.scenes); setShots(target.shots);
    setStoryboardImages(target.storyboardImages);
    setSnapshots(snapshots.map(function(s: any) { return Object.assign({}, s, { isActive: s.id === id }); }));
    setActiveSnapshotId(id);
    toast("已切换到：" + target.label);
  }
  function handleDeleteSnapshot(id: string) {
    setSnapshots(snapshots.filter(function(s: any) { return s.id !== id; }));
    if (activeSnapshotId === id) setActiveSnapshotId(null);
  }


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ffffff]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0D1B2A]/8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0D1B2A]/30 border-t-[#0D1B2A]" />
          </div>
          <span className="text-sm font-medium text-[#0D1B2A]/40">加载项目中..</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#ffffff]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0F4F8]">
          <Layout className="h-7 w-7 text-[#0D1B2A]/15" />
        </div>
        <p className="text-lg font-semibold text-[#0D1B2A]/15">项目未找到</p>
        <button onClick={() => router.push("/projects")}
          className="rounded-xl bg-[#0D1B2A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E3A4D] shadow-btn transition-all">
          返回项目列表
        </button>
      </div>
    );
  }

  const currentIdx = PIPELINE.findIndex((s) => s.key === status);
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-2xl border-b border-[#0D1B2A]/4">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
                <button
                  onClick={() => router.push("/projects")}
                  className="flex items-center justify-center rounded-lg p-1.5 text-[#0D1B2A]/35 hover:text-[#0D1B2A]/70 hover:bg-[#F0F4F8] transition-colors"
                  title="返回项目列表"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                </button>
              <div className="min-w-0">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleSave()}
                  className="w-full bg-transparent text-lg font-bold text-[#0D1B2A] outline-none placeholder:text-[#0D1B2A]/15 truncate"
                  placeholder="项目名称..."
                />
                <p className="text-xs text-[#0D1B2A]/40 font-medium mt-0.5">
                  {PROJECT_TYPES[type] ?? type} · 步骤 {currentIdx + 1}/{PIPELINE.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSave()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#0D1B2A]/10 px-4 py-2 text-sm font-semibold text-[#0D1B2A]/60 hover:bg-[#F0F4F8] hover:border-[#0D1B2A]/30 transition-colors"
              >
                <Save className="h-4 w-4" strokeWidth={1.5} /> 保存
              </button>
              <Link href="/" className="inline-flex items-center gap-1.5 rounded-xl border border-[#0D1B2A]/8 bg-white/60 px-3 py-1.5 text-xs font-medium text-[#0D1B2A]/50 hover:text-[#0D1B2A] hover:border-[#0D1B2A]/20 hover:bg-white transition-all duration-300"><Cpu className="h-3 w-3" />{modelName}</Link>
              <SnapshotToolbar snapshots={snapshots} activeId={activeSnapshotId} onSave={handleSaveSnapshot} onLoad={handleLoadSnapshot} onDelete={handleDeleteSnapshot} onCompare={function(id: string | null) { setCompareSnapshotId(id); }} />
              <button
                onClick={async () => {
                  if (!confirm("确认删除该项目？此操作不可恢复。")) return;
                  try {
                    const delRes = await fetch("/api/projects/" + id, { method: "DELETE" });
                    if (!delRes.ok) {
                      const errData = await delRes.json().catch(() => ({}));
                      throw new Error(errData.error || "服务器返回 " + delRes.status);
                    }
                    toast.success("项目已删除");
                    router.push("/projects");
                  } catch (err: any) { toast.error("删除失败: " + (err?.message || "网络错误")); }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#0D1B2A]/10 px-3 py-2 text-sm font-semibold text-[#0D1B2A]/50 hover:bg-[#F0F4F8] hover:border-[#0D1B2A]/15 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                删除
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Two-column layout */}
      <div className="mx-auto max-w-7xl px-6 md:px-10 flex gap-8">
        {/* Sidebar - Pipeline Timeline */}
        <aside className="hidden lg:block w-52 flex-shrink-0 pt-10">
          <div className="sticky top-28">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#0D1B2A]/20 mb-6">创作流程</p>
            <div className="relative">
              {PIPELINE.map((step, idx) => {
                var Icon = step.icon;
                var isActive = idx === currentIdx;
                var isDone = idx < currentIdx;
                return (
                  <div key={step.key} className="relative flex items-start gap-3 pb-8 last:pb-0">
                    {idx < PIPELINE.length - 1 && (
                      <div className="absolute left-[15px] top-9 bottom-0 w-px bg-[#E2E8F0]">
                        {isDone && <div className="absolute inset-0 w-px bg-[#1B3142]/25" />}
                      </div>
                    )}
                    <button
                      onClick={() => { setStatus(step.key); handleSave({ status: step.key }); }}
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-300 flex-shrink-0 ${
                        isActive ? "bg-[#1B3142] border-[#1B3142] text-white shadow-lg shadow-[#1B3142]/20" :
                        isDone ? "bg-[#1B3142]/8 border-[#1B3142]/20 text-[#1B3142]" :
                        "bg-white border-[#0D1B2A]/6 text-[#0D1B2A]/20 hover:border-[#0D1B2A]/15 hover:text-[#0D1B2A]/40"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
                    </button>
                    <div className="pt-1">
                      <p className={`text-[13px] font-semibold transition-colors ${
                        isActive ? "text-[#0D1B2A]" : isDone ? "text-[#0D1B2A]/60" : "text-[#0D1B2A]/20"
                      }`}>{step.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 py-10 pb-40">
        {/* Stage 0: Idea Input */}
        {status === "theme" && !themeAnalysis && (
          <motion.div key="theme-input"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <StageCard step={PIPELINE[0]} subtitle="输入你的创作主题">
              <textarea
                value={themeInput}
                onChange={(e) => setIdeaInput(e.target.value)}
                rows={5}
                placeholder="例如：一个老人每天去海边等待离开的孩子，风吹过很多年..."
                className="w-full rounded-2xl border border-[#0D1B2A]/8 bg-[#fafafa] px-6 py-5 text-[15px] leading-relaxed outline-none resize-none placeholder:text-[#6B8299]/60 focus:border-[#0D1B2A]/30 focus:bg-white focus:ring-4 focus:ring-[#0D1B2A]/[0.04] transition-all duration-300"
              />
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={runThemeAnalysis}
                disabled={!themeInput.trim() || generating === "theme"}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1E3A4D] px-6 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-40 transition-all shadow-lg shadow-[#0D1B2A]/25"
              >
                {generating === "theme" ? (
                  <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />AI 正在分析...</>
                ) : (
                  <><Sparkles className="h-4 w-4" strokeWidth={1.5} />AI 分析主题</>
                )}
              </motion.button>
            
      
</StageCard>
          </motion.div>
        )}

        {/* Idea Result + Constraints */}
        {themeAnalysis && (status === "constraints") && (
          <>
            <ThemeResultView themeInput={themeInput} themeAnalysis={themeAnalysis} status={status} generating={generating} onNext={runStoryGen} />
            <ConstraintsView constraints={constraints} setConstraints={setConstraints} generating={generating} onNext={runStoryGen} projectType={type} />
          </>
        )}

        {/* Story View */}
        {storyData && (status === "story" || status === "script") && (
          <StoryView storyData={storyData} status={status} generating={generating} onNext={runShotGen} />
        )}

        {/* Script View */}
        {scenes.length > 0 && (status === "script" || status === "storyboard") && (
          <ScriptView scenes={scenes} setScenes={setScenes} generating={generating} onNext={runShotGen} title={title} />
        )}

        {/* Storyboard View */}
        {shots.length > 0 && status === "storyboard" && (
          <StoryboardView title={title} shots={shots} scenes={scenes} storyboardImages={storyboardImages} setStoryboardImages={setStoryboardImages} modelId={modelId} generating={generating} setGenerating={setGenerating} editingShot={editingShot} setEditingShot={setEditingShot} shotStatuses={shotStatuses} setShotStatuses={setShotStatuses} setShots={setShots} />
        )}
        </main>
      </div>
    </div>
  );
}
// ===================== Shared Components =====================

function StageCard({
  step, subtitle, children, extra,
}: {
  step: typeof PIPELINE[0]; subtitle: string; children: React.ReactNode; extra?: React.ReactNode;
}) {
  var IconComponent = step.icon;
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#0D1B2A]/4 bg-white shadow-card transition-all duration-500 hover:shadow-xl hover:shadow-[#0D1B2A]/[0.06] hover:-translate-y-0.5">
      <div className="bg-gradient-to-r from-[#1B3142] via-[#243D50] to-[#2E4A5E] px-7 py-5 relative overflow-hidden"><div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{backgroundImage: "radial-gradient(circle at 30% 50%, #ffffff 1px, transparent 1px), radial-gradient(circle at 70% 50%, #ffffff 1.5px, transparent 1.5px)", backgroundSize: "32px 32px, 48px 48px"}} /><ParticleBurst trigger={false} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] border border-white/[0.1] backdrop-blur-sm">
              <IconComponent className="h-4 w-4 text-white/90" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{step.label}</h3>
              <p className="text-[13px] text-white/60 font-medium">{subtitle}</p>
            </div>
          </div>
          {extra}
        </div>
      </div>
      <div className="p-7">{children}</div>
    </div>
  );
}
function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#0D1B2A]/30">{label}</span>
      <p className="mt-1.5 text-sm font-semibold text-[#0D1B2A]/80 leading-snug">{value}</p>
    </div>
  );
}

function MiniCard({ label, content, color }: { label: string; content: string; color: string }) {
  return (
    <div className={`rounded-xl border-l-[3px] p-5 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5 ${color}`}>
      <span className="text-[10px] font-mono tracking-[0.12em] uppercase text-[#0D1B2A]/30">{label}</span>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[#0D1B2A]/75">{content}</p>
    </div>
  );
}

// ===================== Pipeline Views =====================

function ThemeResultView({
  themeInput, themeAnalysis, status, generating, onNext,
}: {
  themeInput: string; themeAnalysis: IdeaAnalysis; status: string;
  generating: string; onNext: () => void;
}) {
  return (
    <motion.div key="theme-result" className="space-y-6"
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <StageCard step={PIPELINE[0]} subtitle={"基于《" + themeInput.slice(0, 30) + "...》的分析"}>
        <div className="grid gap-6 sm:grid-cols-2">
          <InfoBlock label="主题" value={themeAnalysis.theme} />
          <InfoBlock label="参考风格" value={themeAnalysis.referenceStyle} />
          <InfoBlock label="情绪基调" value={themeAnalysis.emotions.join(" · ")} />
          <InfoBlock label="建议时长" value={themeAnalysis.suggestedDuration + " 秒"} />
        </div>
        <div className="mt-5 pt-5 border-t border-gray-50">
          <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#0D1B2A]/30">视觉关键词</span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {themeAnalysis.visualKeywords.map((kw: string) => (
              <span key={kw} className="inline-flex items-center rounded-lg bg-gradient-to-r from-[#0D1B2A]/8 to-[#3D5566]/12 px-3 py-1.5 text-xs font-semibold text-[#1E3A4D] border border-[#0D1B2A]/10">{kw}</span>
            ))}
          </div>
        </div>
      </StageCard>
    </motion.div>
  );
}

function StoryView({
  storyData, status, generating, onNext,
}: {
  storyData: { logline: string; theme: string; structure: StoryStructure; characters: Character[] };
  status: string; generating: string; onNext: () => void;
}) {
  return (
    <motion.div key="story" className="space-y-6"
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <StageCard step={PIPELINE[2]} subtitle={storyData.logline}>
        <InfoBlock label="主题" value={storyData.theme} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MiniCard label="🎀 开场" content={storyData.structure.beginning} color="border-l-blue-400 bg-[#0D1B2A]/10" />
          <MiniCard label="⚡发展" content={storyData.structure.middle} color="border-l-amber-400 bg-[#0D1B2A]/10" />
          <MiniCard label="🔥 高潮" content={storyData.structure.climax} color="border-l-orange-400 bg-[#0D1B2A]/10" />
          <MiniCard label="🍂 结局" content={storyData.structure.ending} color="border-l-emerald-400 bg-[#0D1B2A]/10" />
        </div>
        {status === "script" && (
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={onNext} disabled={generating === "storyboard"}
            className="group relative mt-6 inline-flex items-center gap-2 rounded-full bg-[#1B3142] px-6 py-3 text-sm font-semibold text-white overflow-hidden shadow-btn hover:shadow-xl transition-all duration-500 disabled:opacity-40"
          >
            {generating === "storyboard" ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />正在生成故事板...</>
            ) : (
              <><Sparkles className="h-4 w-4" strokeWidth={1.5} />下一步：生成故事板</>
            )}
          </motion.button>
        )}
      </StageCard>
    </motion.div>
  );
}

function ScriptView({
  scenes, setScenes, generating, onNext, title, status,
}: {
  scenes: SceneData[]; setScenes: (s: SceneData[]) => void; generating: string; onNext: () => void; title: string; status?: string;
}) {
  const [editingScene, setEditingScene] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<SceneData | null>(null);

  function startEdit(scene: SceneData) { setEditingScene(scene.sceneNumber); setEditValues({...scene}); }
  function cancelEdit() { setEditingScene(null); setEditValues(null); }
  function saveEdit() {
    if (!editValues) return;
    const updated = scenes.map(s => s.sceneNumber === editValues.sceneNumber ? editValues : s);
    setScenes(updated);
    setEditingScene(null); setEditValues(null);
    toast("场景已更新");
  }
  function deleteScene(num: number) {
    if (!confirm("删除场景 " + num + "？")) return;
    const filtered = scenes.filter(s => s.sceneNumber !== num);
    const renumbered = filtered.map((s, i) => ({...s, sceneNumber: i + 1}));
    setScenes(renumbered);
    toast("场景已删除");
  }
  function addScene() {
    const newNum = scenes.length + 1;
    const newScene: SceneData = {
      sceneNumber: newNum, durationSec: 5, location: "新场景",
      timeOfDay: "白天", action: "描述这个场景的动作", dialogue: "", voiceover: "", commercialNote: ""
    };
    setScenes([...scenes, newScene]);
    toast("已添加新场景");
  }
  return (
    <motion.div key="script" className="space-y-6"
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <StageCard step={PIPELINE[3]} subtitle={"共" + scenes.length + " 个场景"} extra={
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); downloadText(exportScript(scenes, title || "Script"), (title || "script") + "-script.txt"); }} className="inline-flex items-center gap-1.5 rounded-lg bg-[#2E4A5E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3A5E7A] transition-colors"><Download className="h-3.5 w-3.5" strokeWidth={1.5} />导出剧本</button>
          <button onClick={(e) => { e.stopPropagation(); addScene(); }} className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B3142] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2E4A5E] transition-colors"><Plus className="h-3.5 w-3.5" strokeWidth={1.5} />新建场景</button>
        </div>
      }>
        <div className="space-y-3">
          {scenes.map((scene: SceneData) => (
            <div key={scene.sceneNumber}
              className="rounded-xl border border-[#0D1B2A]/5 bg-white p-6 hover:border-[#0D1B2A]/15 hover:shadow-md hover:-translate-y-0.5 transition-all duration-500">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1B3142] to-[#2E4A5E] text-sm font-bold text-white shadow-sm">
                  {scene.sceneNumber}
                </span>
                <div className="flex-1">
                  <span className="text-sm font-bold text-[#0D1B2A]/80">场景 {scene.sceneNumber}</span>
                  {editingScene === scene.sceneNumber ? (
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <input value={(editValues||scene).location} onChange={(e) => editValues && setEditValues({...editValues, location: e.target.value})} className="text-[11px] rounded-md border border-[#0D1B2A]/15 px-2 py-0.5 w-24" />
                      <input value={(editValues||scene).timeOfDay} onChange={(e) => editValues && setEditValues({...editValues, timeOfDay: e.target.value})} className="text-[11px] rounded-md border border-[#0D1B2A]/15 px-2 py-0.5 w-20" />
                      <input type="number" value={(editValues||scene).durationSec} onChange={(e) => editValues && setEditValues({...editValues, durationSec: Number(e.target.value)})} className="text-[11px] rounded-md border border-[#0D1B2A]/15 px-2 py-0.5 w-14" />s
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-[11px] text-[#0D1B2A]/30"><MapPin className="h-3 w-3" />{scene.location}</span>
                      <span className="flex items-center gap-1 text-[11px] text-[#0D1B2A]/30"><Clock className="h-3 w-3" />{scene.timeOfDay} · {scene.durationSec}s</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {editingScene === scene.sceneNumber ? (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); saveEdit(); }} className="rounded-lg bg-[#1B3142] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#2E4A5E] transition-colors">保存</button>
                      <button onClick={(e) => { e.stopPropagation(); cancelEdit(); }} className="rounded-lg border border-[#0D1B2A]/10 px-2 py-1 text-[11px] font-medium text-[#0D1B2A]/50 hover:bg-[#F0F4F8] transition-colors">取消</button>
                    </>
                  ) : (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); startEdit(scene); }} className="rounded-lg border border-[#0D1B2A]/10 px-2 py-1 text-[11px] font-medium text-[#0D1B2A]/40 hover:text-[#0D1B2A] hover:bg-[#F0F4F8] transition-colors">编辑</button>
                      <button onClick={(e) => { e.stopPropagation(); deleteScene(scene.sceneNumber); }} className="rounded-lg border border-red-200 px-2 py-1 text-[11px] font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">删除</button>
                    </>
                  )}
                </div>
              </div>
                            {editingScene === scene.sceneNumber ? (
                <div className="space-y-3 mt-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#0D1B2A]/30 mb-1 block">动 作 描 述</label>
                    <textarea value={(editValues||scene).action} onChange={(e) => editValues && setEditValues({...editValues, action: e.target.value})} rows={3} className="w-full text-xs rounded-md border border-[#0D1B2A]/15 px-3 py-2 resize-y focus:outline-none focus:border-[#1B3142]/30" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#0D1B2A]/30 mb-1 block">对 话</label>
                    <textarea value={(editValues||scene).dialogue || ''} onChange={(e) => editValues && setEditValues({...editValues, dialogue: e.target.value})} rows={5} className="w-full text-xs rounded-md border border-[#0D1B2A]/15 px-3 py-2 resize-y focus:outline-none focus:border-[#1B3142]/30" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-[#0D1B2A]/30 mb-1 block">旁 白</label>
                    <textarea value={(editValues||scene).voiceover || ''} onChange={(e) => editValues && setEditValues({...editValues, voiceover: e.target.value})} rows={6} className="w-full text-xs rounded-md border border-[#0D1B2A]/15 px-3 py-2 resize-y focus:outline-none focus:border-[#1B3142]/30" />
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-[#0D1B2A]/60 mt-2">{scene.action}</p>
                  {scene.voiceover && (
                    <p className="mt-2 text-sm leading-relaxed text-[#0D1B2A]/70 italic bg-[#0D1B2A]/[0.04] rounded-lg px-3 py-2 border border-[#0D1B2A]/5">
                      旁白：{scene.voiceover}
                    </p>
                  )}
                  {scene.dialogue && (
                    <p className="mt-2 text-sm leading-relaxed text-[#0D1B2A]/75 font-medium bg-[#0D1B2A]/[0.04] rounded-lg px-3 py-2 border border-[#0D1B2A]/5">
                      对话：{scene.dialogue}
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          onClick={onNext} disabled={generating === "storyboard"}
          className="group relative mt-6 inline-flex items-center gap-2 rounded-full bg-[#1B3142] px-6 py-3 text-sm font-semibold text-white overflow-hidden shadow-btn hover:shadow-xl transition-all duration-500 disabled:opacity-40"
        >
          {generating === "storyboard" ? (
            <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />正在生成故事板...</>
          ) : (
            <><Sparkles className="h-4 w-4" strokeWidth={1.5} />{status === "storyboard" ? "重新生成故事板" : "下一步：生成故事板"}</>
          )}
        </motion.button>
      </StageCard>
    </motion.div>
  );
}

// ===================== Constraints View =====================

const TALENT_OPTIONS = [
  { value: "actors", label: "有人物出镜", desc: "演员/模特/人物表演", icon: "👤" },
  { value: "no_actors", label: "纯产品展示", desc: "只有产品本身和环境", icon: "📦" },
];

const LOCATION_OPTIONS = [
  { value: "any", label: "无限制", desc: "不限制场景类型", icon: "🌍" },
  { value: "indoor", label: "室内", desc: "家中/办公室/商店等室内空间", icon: "🏠" },
  { value: "outdoor", label: "室外", desc: "街道/广场/建筑外墙等户外人造环境", icon: "🏙️" },
  { value: "nature", label: "自然", desc: "山脉/森林/海岸等纯自然环境", icon: "⛰️" },
];

const BUDGET_OPTIONS = [
  { value: "zero", label: "零预算", desc: "只用现有物品和场景", icon: "🆓" },
  { value: "low", label: "低成本", desc: "简单补光/道具即可", icon: "💰" },
  { value: "medium", label: "中等预算", desc: "基本灯光和道具配置", icon: "💵" },
  { value: "high", label: "充足预算", desc: "专业团队和设备", icon: "💎" },
];
function Tag({ icon: Icon, text, color }: { icon: any; text: string; color: string }) {
  return (
    <span className={"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium " + color}>
      <Icon className="h-3 w-3" />{text}
    </span>
  );
}



function ConstraintGroup({ label, options, value, onChange }: { label: string; options: Array<{ value: string; label: string; desc: string; icon: string }>; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold text-[#0D1B2A]/40 uppercase tracking-wider">{label}</h4>
      <div className="grid grid-cols-2 gap-2">
        {options.map(function(opt) {
          var isActive = value === opt.value;
          return (
            <button key={opt.value} onClick={function() { onChange(opt.value); }}
              className={"rounded-xl border p-3.5 text-left transition-all duration-300 " + (isActive ? "border-[#0D1B2A] bg-[#0D1B2A]/[0.04] shadow-md ring-1 ring-[#0D1B2A]/10" : "border-[#0D1B2A]/6 bg-white hover:border-[#0D1B2A]/15 hover:bg-[#f8fafb]/70")}>
              <div className="text-lg">{opt.icon}</div>
              <div className="mt-1.5 text-sm font-semibold text-[#0D1B2A]/80 leading-snug">{opt.label}</div>
              <div className="text-xs text-[#0D1B2A]/50">{opt.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}



function ConstraintsView({ constraints, setConstraints, generating, onNext, projectType }: { constraints: any; setConstraints: (c: any) => void; generating: string | null; onNext: () => void; projectType?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <StageCard step={PIPELINE[1]} subtitle="选择你的拍摄条件，AI将严格按此约束创作">
        <div className="space-y-8">
          <ConstraintGroup label="🎬 出镜方式" options={projectType === "koubo" ? TALENT_OPTIONS.filter(function(o: any) { return o.value !== "no_actors"; }) : TALENT_OPTIONS} value={constraints.talentMode} onChange={function(v: string) { setConstraints({ ...constraints, talentMode: v, locationType: constraints.locationType || "any", equipment: "camera", budget: constraints.budget || "low", lighting: "natural", crew: "solo" }); }} />
          <ConstraintGroup label="📍 拍摄场景" options={LOCATION_OPTIONS} value={constraints.locationType} onChange={function(v: string) { setConstraints({ ...constraints, locationType: v, talentMode: constraints.talentMode || "actors", equipment: "camera", budget: constraints.budget || "low", lighting: "natural", crew: "solo" }); }} />
          <ConstraintGroup label="💰 拍摄成本" options={BUDGET_OPTIONS} value={constraints.budget} onChange={function(v: string) { setConstraints({ ...constraints, budget: v, talentMode: constraints.talentMode || "actors", locationType: constraints.locationType || "any", equipment: "camera", lighting: "natural", crew: "solo" }); }} />
        </div>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          onClick={onNext} disabled={!!generating}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0D1B2A] to-[#1E3A4D] px-6 py-3 font-semibold text-white shadow-lg shadow-[#0D1B2A]/25 transition-all hover:shadow-xl disabled:opacity-50">
          {generating ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />正在生成...</> : <><Sparkles className="h-4 w-4" strokeWidth={1.5} />开始生成故事</>}
        </motion.button>
      </StageCard>
    </motion.div>
  );
}

// ===================== Storyboard View =====================

function StoryboardView({ title, shots, scenes, storyboardImages, setStoryboardImages, modelId, generating, setGenerating, editingShot, setEditingShot, shotStatuses, setShotStatuses, setShots }: { title: string; shots: ShotData[]; scenes: SceneData[]; storyboardImages: Record<number, string>; setStoryboardImages: (v: Record<number, string>) => void; modelId: string; generating: string; setGenerating: (v: string) => void; editingShot: number | null; setEditingShot: (v: number | null) => void; shotStatuses: Record<number, any>; setShotStatuses: (v: Record<number, any>) => void; setShots: (v: ShotData[]) => void }) {
    async function exportPDF() {
    var { jsPDF } = await import("jspdf");
    var { default: autoTable } = await import("jspdf-autotable");
    var doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFontSize(16);
    doc.text(title || "项目分镜表", 14, 15);
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString("zh-CN"), 14, 22);
    var rows = shots.map(function(s: any) {
      return [
        String(s.shotNumber),
        s.shotType,
        String(s.durationSec) + "s",
        s.camera.lens,
        s.camera.angle,
        s.camera.movement.join(" · "),
        s.camera.composition,
        s.subject.action,
        s.emotion,
        s.directorNote || "",
      ];
    });
    autoTable(doc, {
      head: [["#", "景别", "时长", "焦段", "机位", "运镜", "构图", "动作", "情绪", "备注"]],
      body: rows,
      startY: 28,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [0, 0, 0], textColor: 255 },
    });
    doc.save((title || "分镜表") + "-分镜表.pdf");
  }

  const [imagesLoading, setImagesLoading] = useState(false);
  const [totalGenerated, setTotalGenerated] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [localImages, setLocalImages] = useState<Record<number, string>>({});
  const hasImages = Object.keys(storyboardImages).length > 0 || Object.keys(localImages).length > 0;

  // 仅口播模式（1个镜头）自动生成图片，其他模式手动触发避免等待
  useEffect(() => {
    if (shots.length === 1) { generateAllImages(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shots.length]);

  function buildPrompt(shot: ShotData): string {
    const product = title || "the product";
    const m: Record<string, string> = { extreme_wide: "extreme wide establishing shot", wide: "wide full shot", medium: "medium shot", closeup: "close-up detail shot", extreme_closeup: "extreme close-up detail", macro: "macro detail shot" };
    const d = m[shot.shotType] || shot.shotType;
    const hasPerson = !!shot.subject.person;
    
    // 核心描述：人物或产品的动作
    var coreDesc = hasPerson 
      ? shot.subject.person + " " + (shot.subject.action || "")
      : product + " " + (shot.subject.action || "");
    
    return [
      "colorful comic art style",
      "storyboard illustration",
      "manga aesthetic", 
      "clean linework",
      "flat colors",
      "cel shading",
      d,
      coreDesc,
      shot.camera.angle + " angle",
      shot.camera.composition + " composition",
      shot.lighting.direction + " " + shot.lighting.quality + " lighting",
      (shot.emotion || "neutral") + " mood",
      hasPerson ? product + " also visible in scene" : product + " as main subject",
      "high quality illustration",
      "professional storyboard panel"
    ].filter(Boolean).join(", ");
  }

  async function generateAllImages() {
    if (shots.length === 0) return;
    setImagesLoading(true); setTotalGenerated(0); setErrorMsg("");
    
    const results: Record<number, string> = {};
    for (var k in storyboardImages) { results[Number(k)] = storyboardImages[Number(k)]; }
    
    const pending = shots.filter(function(s) { return !results[s.shotNumber]; });
    
    if (pending.length === 0) {
      setImagesLoading(false);
      toast("所有故事板图片已就绪");
      return;
    }
    
    toast("正在生成 " + pending.length + " 张故事板图片...", { id: "img-gen" });
    
    try {
      const prompts = pending.map(function(shot) {
        return { id: shot.shotNumber, prompt: buildPrompt(shot) };
      });
      
      const newResults = await generateBatchImagesBrowser(prompts, function(progress: BatchProgress) {
        setTotalGenerated(progress.completed);
        if (progress.errors.length > 0) {
          console.warn("Image errors:", progress.errors);
        }
      });
      
      // Merge results
      for (var key in newResults) {
        results[Number(key)] = newResults[Number(key)];
        setLocalImages(Object.assign({}, results));
      }
      
      var ok = Object.keys(results).length;
      if (ok === 0) {
        setErrorMsg("所有图片生成失败，请检查网络连接后重试");
        toast("图片生成失败", { id: "img-err" });
      } else {
        setStoryboardImages(results);
        setLocalImages(results);
        if (ok < shots.length) {
          toast("已生成 " + ok + "/" + shots.length + " 张图片（部分失败可重试）", { id: "img-done" });
        } else {
          toast("故事板图片全部生成完成！", { id: "img-done" });
        }
      }
    } catch (e: any) {
      console.error("Batch image generation failed:", e);
      setErrorMsg("图片服务异常: " + (e.message || "未知错误"));
    }
    
    setImagesLoading(false);
  }

  function getImgUrl(shotNumber: number): string | null {
    return localImages[shotNumber] || storyboardImages[shotNumber] || null;
  }

  const allImagesReady = shots.every(function(s) { return !!getImgUrl(s.shotNumber); });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <StageCard step={PIPELINE[4]} subtitle={shots.length + " 个分镜 · " + (allImagesReady ? "全部图片已生成" : imagesLoading ? "正在生成图片..." : "点击按钮生成图片")} extra={
        !allImagesReady && !imagesLoading ? (
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={generateAllImages} className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-white/[0.12] transition-colors"><Sparkles className="h-3 w-3" />生成图片</motion.button>
        ) : allImagesReady ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white backdrop-blur"><CheckCircle2 className="h-3 w-3" />完成</span>
        ) : null
      }>

        {imagesLoading && (
          <div className="mb-4 rounded-xl bg-[#F0F4F8] border border-[#0D1B2A]/8 p-3">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0D1B2A]/30 border-t-[#0D1B2A]" />
              <div>
                <p className="text-sm font-semibold text-[#1E3A4D]">正在生成故事板图片...</p>
                <p className="text-xs text-[#0D1B2A]/50">{totalGenerated}/{shots.length} 张已完成</p>
              </div>
            </div>
          </div>
        )}
        {errorMsg && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3"><p className="text-sm text-red-600">{errorMsg}</p></div>}

        {/* 统一卡片布局：图片在上，文字在下 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {shots.map(function(shot) {
            var imgUrl = getImgUrl(shot.shotNumber);
            return (
              <div key={shot.shotNumber} className="film-frame rounded-xl border border-[#0D1B2A]/5 bg-white overflow-hidden shadow-card hover:shadow-xl hover:shadow-[#0D1B2A]/[0.08] hover:-translate-y-1 transition-all duration-500">
                {/* 图片区 */}
                <div className="relative" style={{ aspectRatio: "16/9" }}>
                  {imgUrl ? (
                    <img 
                    src={imgUrl} 
                    alt={"Shot " + shot.shotNumber} 
                    className="image-reveal h-full w-full object-cover" 
                    crossOrigin="anonymous"
                    loading="lazy"
                    onError={function(e: any) { 
                      var el = e.target as HTMLImageElement;
                      el.src = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" fill="%23f3f4f6"><rect width="400" height="225"/><text x="200" y="115" text-anchor="middle" fill="%239ca3af" font-size="14">图片加载失败</text></svg>');
                    }} 
                  />
                  ) : imagesLoading ? (
                    <div className="flex h-full w-full items-center justify-center bg-[#F0F4F8]">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0D1B2A]/30 border-t-[#0D1B2A]" />
                        <span className="text-xs text-[#0D1B2A]/40">生成中...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#F0F4F8]">
                      <span className="text-[#0D1B2A]/40 text-sm">点击下方「生成故事板图片」按钮</span>
                    </div>
                  )}
                  {/* 角标 */}
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#0D1B2A]/60 backdrop-blur-sm px-2 py-0.5 text-xs font-bold text-white">#{shot.shotNumber}</span>
                  </div>
                </div>
                
                {/* 文字信息区 */}
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <Tag icon={Camera} text={SHOT_TYPE_LABELS[shot.shotType] || shot.shotType} color="bg-[#0D1B2A]/[0.04] text-[#0D1B2A]/60 border border-[#0D1B2A]/6" />
                    <Tag icon={Clock} text={shot.durationSec + "s"} color="bg-[#0D1B2A]/[0.04] text-[#0D1B2A]/60 border border-[#0D1B2A]/6" />
                    <Tag icon={Maximize2} text={shot.camera.angle} color="bg-[#0D1B2A]/[0.04] text-[#0D1B2A]/60 border border-[#0D1B2A]/6" />
                    <Tag icon={Aperture} text={shot.camera.lens} color="bg-[#0D1B2A]/[0.04] text-[#0D1B2A]/60 border border-[#0D1B2A]/6" />
                  </div>
                  <p className="text-sm text-[#0D1B2A]/75 leading-relaxed">{shot.subject.action}</p>
                  {shot.directorNote && <p className="mt-1.5 text-xs italic text-[#0D1B2A]/40">🎬 {shot.directorNote}</p>}
                  {shot.emotion && <p className="mt-1 text-xs text-[#0D1B2A]/40">🎭 {shot.emotion}</p>}
                  {shot.sound && <p className="mt-0.5 text-xs text-[#0D1B2A]/40">🔊 {shot.sound}</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-[#0D1B2A]/6">
          <button onClick={() => downloadText(exportScript(scenes, title), (title || "剧本") + "-剧本.txt")} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#1B3142] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2E4A5E] shadow-btn hover:shadow-xl transition-all duration-500"><Download className="h-4 w-4" strokeWidth={1.5} />导出脚本</button>
          <button onClick={() => downloadText(exportStoryboardHTML(shots, scenes, storyboardImages, title), (title || "故事板") + "-故事板.html", "text/html")} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#1B3142] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2E4A5E] shadow-btn hover:shadow-xl transition-all duration-500"><Download className="h-4 w-4" strokeWidth={1.5} />导出故事板</button>
        </div>
      </StageCard>
    </motion.div>
  );
}
