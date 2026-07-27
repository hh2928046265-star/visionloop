'use client';
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Cpu, Wifi, Check, Key, Eye, EyeOff } from "lucide-react";
import { useSettings, MODEL_OPTIONS, type ModelOption } from "@/lib/settings-store";
import { createPortal } from "react-dom";

const ease = [0.16, 1, 0.3, 1] as const;

function ModelRow({ m, selected, onClick }: { m: ModelOption; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={"flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 "+(selected?"bg-[#0D1B2A]/5":"hover:bg-[#F5F2EC]/60")}>
      <div className={"flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 "+(selected?"border-[#0D1B2A] bg-[#0D1B2A]":"border-[#0D1B2A]/25")}>{selected&&<Check className="h-3 w-3 text-white"/>}</div>
      <div><div className="text-sm font-semibold text-[#0D1B2A]">{m.name}</div><div className="text-[11px] text-[#6B8299]">{m.description}</div></div>
      {!m.local&&<span className="ml-auto text-[9px] font-medium text-[#0D1B2A]/25 uppercase tracking-wider">API</span>}
    </button>
  );
}

export default function ModelSettingsPanel() {
  const { settings, setModelId, setApiKey, selectedModel } = useSettings();
  const [open, setOpen] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyValue, setKeyValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hasKey = !!settings.customApiKeys[selectedModel.provider];

  function handleSave() { const t = keyValue.trim(); if (t) setApiKey(selectedModel.provider, t); setShowKeyInput(false); setKeyValue(""); }
  function onSelect(id: string) { setModelId(id); setOpen(false); }

  const localModels = MODEL_OPTIONS.filter(m => m.local);
  const cloudModels = MODEL_OPTIONS.filter(m => !m.local);

  // Get trigger button position for portal placement
  const triggerRect = triggerRef.current?.getBoundingClientRect();

  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:2.0,ease}} className="w-full max-w-md">
      <div className="flex flex-wrap items-start gap-2">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(!open)}
          className="group inline-flex items-center gap-2.5 rounded-full border border-[#0D1B2A]/10 bg-white/80 backdrop-blur px-4 py-2.5 text-sm font-medium text-[#0D1B2A]/70 hover:border-[#0D1B2A]/25 hover:text-[#0D1B2A] hover:bg-white transition-all duration-300 shadow-sm"
        >
          {selectedModel.local ? <Cpu className="h-4 w-4 text-[#0D1B2A]/40 group-hover:text-[#0D1B2A]/70 transition-colors" /> : <Wifi className="h-4 w-4 text-[#0D1B2A]/40 group-hover:text-[#0D1B2A]/70 transition-colors" />}
          <span>{selectedModel.name}</span>
          <svg className={"h-3.5 w-3.5 transition-transform duration-300 "+(open?"rotate-180":"")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
        </button>

        <button type="button" onClick={() => { setShowKeyInput(!showKeyInput); setKeyValue(settings.customApiKeys[selectedModel.provider]||""); }} className="inline-flex items-center gap-1.5 rounded-full border bg-white/80 backdrop-blur px-3 py-2.5 text-xs font-medium transition-all duration-300 shadow-sm" style={{borderColor:hasKey?"rgba(34,197,94,0.35)":"rgba(239,68,68,0.25)",color:hasKey?"#15803D":"#B91C1C"}}>
          <Key className="h-3 w-3" /><span>{hasKey?"已配置密钥":"未配置密钥"}</span>
        </button>
      </div>

      {/* Portal dropdown to document.body — avoids all parent CSS issues */}
      {open && triggerRect && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[9999] w-80 rounded-2xl border border-[#0D1B2A]/8 bg-white shadow-2xl shadow-[#0D1B2A]/10 overflow-hidden"
            style={{ top: triggerRect.bottom + 12, left: triggerRect.left }}
          >
            <div className="px-4 py-3 bg-[#F0F4F8]/60 border-b border-[#0D1B2A]/6"><div className="flex items-center gap-2"><Cpu className="h-3.5 w-3.5 text-[#1E3A4D]"/><span className="text-[11px] font-semibold text-[#1E3A4D] uppercase tracking-wider">本地模型 · 免费无限用</span></div></div>
            {localModels.map(m => <ModelRow key={m.id} m={m} selected={m.id===settings.selectedModelId} onClick={() => onSelect(m.id)} />)}
            <div className="px-4 py-3 bg-[#F0F4F8]/60 border-y border-[#0D1B2A]/6"><div className="flex items-center gap-2"><Wifi className="h-3.5 w-3.5 text-[#1E3A4D]"/><span className="text-[11px] font-semibold text-[#1E3A4D] uppercase tracking-wider">云端模型 · 需配置 API Key</span></div></div>
            {cloudModels.map(m => <ModelRow key={m.id} m={m} selected={m.id===settings.selectedModelId} onClick={() => onSelect(m.id)} />)}
          </div>
        </>,
        document.body
      )}

      {showKeyInput && (
        <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} transition={{duration:0.2}} className="overflow-hidden mt-3">
          <div className="rounded-2xl border border-[#0D1B2A]/8 bg-white p-4 shadow-lg">
            <p className="text-[11px] text-[#1E3A4D]/60 mb-3">输入 {selectedModel.provider} 的 API Key，安全保存在本地浏览器</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input type={showKey?"text":"password"} value={keyValue} onChange={e=>setKeyValue(e.target.value)} placeholder="sk-..." className="w-full rounded-lg border border-[#0D1B2A]/12 bg-[#f8fafb] px-3 py-2.5 pr-8 text-xs text-[#0D1B2A] placeholder:text-[#0D1B2A]/20 outline-none focus:border-[#0D1B2A]/30 focus:bg-white transition-all duration-200" />
                <button type="button" onClick={()=>setShowKey(!showKey)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0D1B2A]/25 hover:text-[#0D1B2A]/60 transition-colors">{showKey?<EyeOff className="h-3.5 w-3.5"/>:<Eye className="h-3.5 w-3.5"/>}</button>
              </div>
              <button type="button" onClick={handleSave} className="rounded-lg bg-[#0D1B2A] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1E3A4D] transition-colors">保存</button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
