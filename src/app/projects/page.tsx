'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, MoreHorizontal, Trash2, Sparkles, Clock, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const DEMO_USER_ID = "demo-user-001";
const ease = [0.16, 1, 0.3, 1] as const;

const PROJECT_TYPES: Record<string, { label: string; emoji: string }> = {
  seeding: { label: "种草推广", emoji: "🌶" },
  koubo: { label: "口播带货", emoji: "🎙️" },
  vlog: { label: "Vlog", emoji: "📫" },
  promo: { label: "宣传片", emoji: "🎬" },
  short_video: { label: "短视频", emoji: "⚡" },
};

const STATUS_CONFIG: Record<string, { label: string }> = {
  idea: { label: "主题" }, story: { label: "故事" },
  script: { label: "剧本" }, storyboard: { label: "分镜" }, completed: { label: "完成" },
};

interface Project {
  id: string; title: string; description: string;
  type: string; status: string; updatedAt: string;
}

function timeAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (d < 1) return "刚刚";
  if (d < 60) return d + "m";
  if (d < 1440) return Math.floor(d / 60) + "h";
  return Math.floor(d / 1440) + "d";
}

// ============ CREATE DIALOG ============
function CreateDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("short_video");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, description, type, ownerId: DEMO_USER_ID }) });
      if (!res.ok) throw new Error();
      onClose(); setTitle(""); setDescription(""); onCreated();
      toast("项目已创建");
    } catch { toast("创建失败"); }
    finally { setSaving(false); }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0D1B2A]/20 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.93, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 24 }} transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }} className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-[#0D1B2A]/6">
            <div className="p-8">
              <h2 className="font-display text-2xl text-[#0D1B2A] tracking-tight mb-1">新建项目</h2>
              <p className="text-sm text-[#0D1B2A]/40 mb-8">开始你的视觉创作</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-mono tracking-[0.15em] uppercase text-[#0D1B2A]/35 mb-2">名称</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="项目名称" className="w-full rounded-xl border border-[#0D1B2A]/8 bg-[#f8fafb] px-4 py-3 text-sm text-[#0D1B2A] placeholder:text-[#0D1B2A]/15 outline-none focus:border-[#0D1B2A]/25 focus:bg-white focus:ring-4 focus:ring-[#0D1B2A]/[0.03] transition-all duration-300" autoFocus />
                </div>
                <div>
                  <label className="block text-[11px] font-mono tracking-[0.15em] uppercase text-[#0D1B2A]/35 mb-2">描述</label>
                  <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="简短描述（可选）" className="w-full rounded-xl border border-[#0D1B2A]/8 bg-[#f8fafb] px-4 py-3 text-sm text-[#0D1B2A] placeholder:text-[#0D1B2A]/15 outline-none focus:border-[#0D1B2A]/25 focus:bg-white focus:ring-4 focus:ring-[#0D1B2A]/[0.03] transition-all duration-300" />
                </div>
                <div>
                  <label className="block text-[11px] font-mono tracking-[0.15em] uppercase text-[#0D1B2A]/35 mb-2">类型</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(PROJECT_TYPES).map(([key, info]) => (
                      <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => setType(key)} className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition-all duration-300 ${type === key ? "border-[#0D1B2A] bg-[#0D1B2A] text-white shadow-btn" : "border-[#0D1B2A]/6 bg-white text-[#0D1B2A]/50 hover:border-[#0D1B2A]/15 hover:text-[#0D1B2A]/70"}`}>{info.label}</motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <motion.button whileTap={{ scale: 0.96 }} onClick={onClose} className="flex-1 rounded-xl border border-[#0D1B2A]/8 px-4 py-3 text-sm font-medium text-[#0D1B2A]/50 hover:bg-[#F0F4F8] transition-colors">取消</motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={handleCreate} disabled={saving || !title.trim()} className="flex-1 rounded-xl bg-[#0D1B2A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1E3A4D] disabled:opacity-30 shadow-btn transition-all duration-300" data-ripple>{saving ? "创建中..." : "创建项目"}</motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============ PROJECT MENU ============
function ProjectMenu({ projectId, onDeleted }: { projectId: string; onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  async function handleDelete() {
    try { await fetch("/api/projects/" + projectId, { method: "DELETE" }); onDeleted(); toast("已删除"); } catch { toast("删除失败"); }
    setOpen(false);
  }
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOpen(!open)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[#F0F4F8] transition-colors">
        <MoreHorizontal className="h-3.5 w-3.5 text-[#0D1B2A]/25" strokeWidth={1.5} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -4 }} transition={{ duration: 0.15, ease }} className="absolute right-0 top-8 z-20 w-36 rounded-xl border border-[#0D1B2A]/6 bg-white/95 backdrop-blur-sm p-1 shadow-xl">
            <button onClick={handleDelete} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="h-3 w-3" strokeWidth={1.5} />删除</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ MAIN PAGE ============
export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProjects() {
    setLoading(true);
    try { const res = await fetch("/api/projects?ownerId=" + DEMO_USER_ID); setProjects(res.ok ? await res.json() : []); } catch { setProjects([]); }
    setLoading(false);
  }
  useEffect(() => { loadProjects(); }, []);

  const filtered = projects.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter && p.type !== filter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <motion.nav initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease }} className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-[#0D1B2A]/4">
        <div className="mx-auto max-w-6xl px-8 h-14 flex items-center justify-between">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push("/")} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#0D1B2A]/30 hover:text-[#0D1B2A] hover:bg-[#F0F4F8] transition-colors">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} onClick={() => setDialogOpen(true)} className="group relative flex items-center gap-1.5 rounded-full bg-[#0D1B2A] px-4 py-1.5 text-xs font-medium text-white overflow-hidden shadow-btn transition-shadow duration-500" data-ripple>
            <span className="absolute inset-0 bg-white -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            <span className="relative z-10 flex items-center gap-1.5 group-hover:text-[#0D1B2A] transition-colors duration-500"><Plus size={13} strokeWidth={1.5} />新建</span>
          </motion.button>
        </div>
      </motion.nav>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-8 py-12">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="mb-12">
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#0D1B2A]/30 mb-4">[ 项目 ]</p>
          <h1 className="font-display text-4xl md:text-5xl text-[#0D1B2A] tracking-[-0.02em] mb-3">我的项目</h1>
          <p className="text-[15px] text-[#0D1B2A]/40 max-w-md">管理你的创作项目，每个项目都是一次完整的视觉叙事。</p>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15, ease }} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
          <div className="relative flex-1 max-w-xs group glow-focus">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#0D1B2A]/20 group-focus-within:text-[#0D1B2A]/35 transition-colors" strokeWidth={1.5} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索" className="w-full rounded-xl border border-[#0D1B2A]/6 bg-[#f8fafb] pl-9 pr-4 py-2.5 text-sm text-[#0D1B2A] placeholder:text-[#0D1B2A]/15 outline-none focus:border-[#0D1B2A]/20 focus:bg-white transition-all duration-300" />
            {search && <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} whileTap={{ scale: 0.8 }} onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-3.5 w-3.5 text-[#0D1B2A]/25 hover:text-[#0D1B2A]/50" strokeWidth={1.5} /></motion.button>}
          </div>
          <div className="flex items-center gap-1.5">
            {[{ key: "", label: "全部" }, ...Object.entries(PROJECT_TYPES).map(([k, v]) => ({ key: k, label: v.label }))].map((item, i) => (
              <motion.button key={item.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 + i * 0.05 }} whileTap={{ scale: 0.94 }} onClick={() => setFilter(item.key)} className={`rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-all duration-300 ${filter === item.key ? "bg-[#0D1B2A] text-white shadow-btn" : "bg-[#F0F4F8] text-[#0D1B2A]/45 hover:bg-[#E2E8F0] hover:text-[#0D1B2A]/65"}`}>{item.label}</motion.button>
            ))}
          </div>
        </motion.div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-[20px] border border-[#0D1B2A]/4 overflow-hidden">
                <div className="h-1.5 bg-[#0D1B2A]/3" />
                <div className="p-6 space-y-4">
                  <div className="h-5 bg-[#0D1B2A]/[0.04] rounded-lg w-3/4 animate-pulse" />
                  <div className="h-4 bg-[#0D1B2A]/[0.03] rounded-lg w-full animate-pulse" />
                  <div className="pt-4 border-t border-[#0D1B2A]/4 flex justify-between">
                    <div className="h-3 bg-[#0D1B2A]/[0.03] rounded-lg w-16 animate-pulse" />
                    <div className="h-3 bg-[#0D1B2A]/[0.03] rounded-lg w-10 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease }} className="flex flex-col items-center justify-center py-32 text-center">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0F4F8] mb-6">
              <Sparkles className="h-7 w-7 text-[#0D1B2A]/12" strokeWidth={1.5} />
            </motion.div>
            <h2 className="font-display text-2xl text-[#0D1B2A]/50 mb-2">开始你的第一个项目</h2>
            <p className="text-sm text-[#0D1B2A]/30 max-w-sm mb-10 leading-relaxed">输入一个主题，AI 将从零到完整故事板，一站式完成创作。</p>
            {!search && !filter && (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} onClick={() => setDialogOpen(true)} className="group relative inline-flex items-center gap-2 rounded-full bg-[#0D1B2A] px-6 py-3 text-sm font-medium text-white overflow-hidden shadow-btn transition-shadow duration-500" data-ripple>
                <span className="absolute inset-0 bg-white -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <span className="relative z-10 flex items-center gap-2 group-hover:text-[#0D1B2A] transition-colors duration-500"><Plus size={16} strokeWidth={1.5} />创建项目</span>
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Project Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project, idx) => {
              const st = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.idea;
              const tp = PROJECT_TYPES[project.type] ?? PROJECT_TYPES.short_video;
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.5, delay: idx * 0.06, ease }}
                >
                  <div
                    onClick={() => router.push("/project/" + project.id)}
                    className="group cursor-pointer overflow-hidden rounded-[20px] border border-[#0D1B2A]/5 bg-white shadow-card hover:shadow-xl hover:shadow-[#0D1B2A]/[0.06] hover:-translate-y-1 transition-all duration-500"
                  >
                    {/* Top accent */}
                    <div className="relative h-1 bg-gradient-to-r from-[#dce4ec] via-[#c8d6e0] to-[#dce4ec] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-base font-semibold text-[#0D1B2A] leading-snug line-clamp-1 group-hover:text-[#0D1B2A]/80 transition-colors">{project.title}</h3>
                        <ProjectMenu projectId={project.id} onDeleted={loadProjects} />
                      </div>
                      <p className="text-sm text-[#0D1B2A]/35 leading-relaxed line-clamp-2 mb-6 min-h-[2.5rem]">{project.description || "未添加描述"}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-[#0D1B2A]/4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0D1B2A]/30 group-hover:text-[#0D1B2A]/45 transition-colors">
                          <span className="text-sm">{tp.emoji}</span>
                          {tp.label}
                        </span>
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-medium text-[#0D1B2A]/20 bg-[#F0F4F8] rounded-full px-2 py-0.5">{st.label}</span>
                          <span className="text-[10px] text-[#0D1B2A]/20 tabular-nums">{timeAgo(project.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <CreateDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreated={loadProjects} />
    </div>
  );
}
