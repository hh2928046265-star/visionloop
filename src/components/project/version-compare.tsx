'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, History, X, Check, GitCompare } from 'lucide-react';
import { useState } from 'react';
import type { PipelineSnapshot } from '@/types';

export function SnapshotToolbar({ snapshots, activeId, onSave, onLoad, onDelete, onCompare }: {
  snapshots: PipelineSnapshot[];
  activeId: string | null;
  onSave: () => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onCompare: (id: string | null) => void;
}) {
  const [showPanel, setShowPanel] = useState(false);
  
  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={onSave}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D1B2A]/10 px-3 py-1.5 text-xs font-semibold text-[#1E3A4D] hover:bg-[#0D1B2A]/20 transition-colors"
        >
          <Save className="h-3.5 w-3.5" />保存版本
        </motion.button>
        
        {snapshots.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={function() { setShowPanel(!showPanel); }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#F0F4F8] px-3 py-1.5 text-xs font-semibold text-[#0D1B2A]/60 hover:bg-[#E2E8F0] transition-colors"
          >
            <History className="h-3.5 w-3.5" />
            版本 ({snapshots.length})
          </motion.button>
        )}
      </div>
      
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full mt-2 right-0 z-50 w-72 rounded-xl border border-[#0D1B2A]/10 bg-white shadow-xl p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#0D1B2A]/50">版本历史</span>
              <button onClick={function() { setShowPanel(false); }} className="text-[#0D1B2A]/40 hover:text-[#0D1B2A]/60">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {snapshots.map(function(snap) {
                var isActive = snap.isActive;
                var rowClass = isActive 
                  ? 'bg-[#0D1B2A]/10 border border-[#0D1B2A]/30' 
                  : 'bg-[#f8fafb] border border-transparent hover:bg-[#F0F4F8]';
                return (
                  <div key={snap.id} className={'flex items-center gap-2 rounded-lg p-2 text-xs transition-colors ' + rowClass}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0D1B2A]/75 truncate">{snap.label}</p>
                      <p className="text-[#0D1B2A]/40">{new Date(snap.createdAt).toLocaleString('zh-CN')}</p>
                      <p className="text-[#0D1B2A]/40">{snap.shots.length} 镜 · {snap.scenes.length} 场</p>
                    </div>
                    <div className="flex gap-1">
                      {!isActive && (
                        <>
                          <button onClick={function() { onLoad(snap.id); }} className="rounded p-1 hover:bg-[#0D1B2A]/20 text-[#0D1B2A]" title="加载此版本">
                            <Check className="h-3 w-3" />
                          </button>
                          <button onClick={function() { onCompare(snap.id); }} className="rounded p-1 hover:bg-[#F0F4F8] text-[#0D1B2A]/50" title="对比">
                            <GitCompare className="h-3 w-3" />
                          </button>
                        </>
                      )}
                      <button onClick={function() { onDelete(snap.id); }} className="rounded p-1 hover:bg-red-100 text-red-400" title="删除">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CompareView({ snapshots, activeId, onClose }: {
  snapshots: PipelineSnapshot[];
  activeId: string | null;
  onClose: () => void;
}) {
  if (!activeId) return null;
  var compare = snapshots.find(function(s) { return s.id === activeId; });
  if (!compare) return null;
  var current = snapshots.find(function(s) { return s.isActive; });
  if (!current) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border-2 border-blue-200 bg-blue-50/30 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-[#0D1B2A]/75">
          <GitCompare className="h-4 w-4 inline mr-1" />
          对比：当前版本 vs {compare.label}
        </span>
        <button onClick={onClose} className="text-blue-400 hover:text-blue-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="font-semibold text-[#0D1B2A]/50 mb-1">当前版本 ({current.label})</p>
          <p className="text-[#0D1B2A]/60">场景: {current.scenes.length} | 镜头: {current.shots.length}</p>
          <p className="text-[#0D1B2A]/40 mt-1">{current.scenes[0]?.action?.substring(0, 80)}...</p>
        </div>
        <div>
          <p className="font-semibold text-[#0D1B2A]/50 mb-1">对比版本 ({compare.label})</p>
          <p className="text-[#0D1B2A]/60">场景: {compare.scenes.length} | 镜头: {compare.shots.length}</p>
          <p className="text-[#0D1B2A]/40 mt-1">{compare.scenes[0]?.action?.substring(0, 80)}...</p>
        </div>
      </div>
    </motion.div>
  );
}
