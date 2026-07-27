'use client';
import { useState, useEffect } from "react";
import { Cpu, Wifi, ChevronDown, Check } from "lucide-react";

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  local: boolean;
}

interface Props {
  value: string;
  onChange: (modelId: string) => void;
}

// 静态列表（不依赖 API）
const STATIC_MODELS: ModelOption[] = [
  { id: "qwen2.5-7b", name: "Qwen 2.5 7B", provider: "Ollama", description: "本地 · 轻量快速 · 8GB显存", local: true },
  { id: "deepseek-r1:8b", name: "DeepSeek R1 8B", provider: "Ollama", description: "本地 · 推理严密 · 8GB显存", local: true },
  { id: "deepseek-v4pro", name: "DeepSeek 云端", provider: "DeepSeek", description: "云端 · 旗舰 · API已配置", local: false },
];

export default function ModelSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<ModelOption[]>(STATIC_MODELS);

  const selected = models.find((m) => m.id === value) || models[0];
  const localModels = models.filter((m) => m.local);
  const cloudModels = models.filter((m) => !m.local);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-3 py-2 text-xs font-medium text-[#3D3833] hover:border-[#0D1B2A]/40 hover:bg-[#F5F2EC] transition-colors"
      >
        {selected.local ? (
          <Cpu className="h-3.5 w-3.5 text-[#1E3A4D]" />
        ) : (
          <Wifi className="h-3.5 w-3.5 text-[#1E3A4D]" />
        )}
        <span>{selected.name}</span>
        <ChevronDown className={"h-3 w-3 text-[#6B8299] transition-transform " + (open ? "rotate-180" : "")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-[#e5e5e5] bg-white shadow-xl shadow-[#0D1B2A]/8 overflow-hidden">
            {/* 本地模型 */}
            <div className="px-3 py-2 bg-[#0D1B2A]/6 border-b border-[#0D1B2A]/15">
              <div className="flex items-center gap-1.5">
                <Cpu className="h-3 w-3 text-[#1E3A4D]" />
                <span className="text-[11px] font-bold text-[#1E3A4D] uppercase tracking-wider">本地模型 · 免费无限用</span>
              </div>
            </div>
            {localModels.map((m) => (
              <button
                key={m.id}
                onClick={() => { onChange(m.id); setOpen(false); }}
                className={"flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F5F2EC] transition-colors " + (m.id === value ? "bg-[#0D1B2A]/6" : "")}
              >
                <div className={"flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 " + (m.id === value ? "border-[#0D1B2A] bg-[#0D1B2A]" : "border-[#0D1B2A]/40")}>
                  {m.id === value && <Check className="h-3 w-3 text-white" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#0D1B2A]">{m.name}</div>
                  <div className="text-[11px] text-[#6B8299]">{m.description}</div>
                </div>
              </button>
            ))}

            {/* 云端模型 */}
            <div className="px-3 py-2 bg-[#0D1B2A]/6 border-y border-[#0D1B2A]/15">
              <div className="flex items-center gap-1.5">
                <Wifi className="h-3 w-3 text-[#1E3A4D]" />
                <span className="text-[11px] font-bold text-[#1E3A4D] uppercase tracking-wider">云端模型 · 需配置 API Key</span>
              </div>
            </div>
            {cloudModels.map((m) => (
              <button
                key={m.id}
                onClick={() => { onChange(m.id); setOpen(false); }}
                className={"flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F5F2EC] transition-colors " + (m.id === value ? "bg-[#0D1B2A]/6" : "")}
              >
                <div className={"flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 " + (m.id === value ? "border-[#0D1B2A] bg-[#0D1B2A]" : "border-[#0D1B2A]/40")}>
                  {m.id === value && <Check className="h-3 w-3 text-white" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#0D1B2A]">{m.name}</div>
                  <div className="text-[11px] text-[#6B8299]">{m.description}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
