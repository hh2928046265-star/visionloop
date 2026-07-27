'use client';
import React from 'react';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Check, X, Camera, Clock, Maximize2, Aperture } from 'lucide-react';

var SHOT_TYPE_OPTIONS = [
  { value: 'extreme_wide', label: '远景' },
  { value: 'wide', label: '全景' },
  { value: 'medium', label: '中景' },
  { value: 'closeup', label: '特写' },
  { value: 'extreme_closeup', label: '大特写' },
  { value: 'macro', label: '微距' },
];

var SHOT_TYPE_LABELS: Record<string, string> = {};
SHOT_TYPE_OPTIONS.forEach(function(o) { SHOT_TYPE_LABELS[o.value] = o.label; });

export interface ShotData {
  shotNumber: number; durationSec: number; shotType: string;
  camera: { lens: string; angle: string; movement: string[]; composition: string };
  lighting: { type: string; direction: string; quality: string; colorTemp: string };
  subject: { person: string; action: string; costume: string; props: string[] };
  emotion: string; sound: string; directorNote: string;
}

function InlineField({ label, value, onChange, type }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="flex items-center gap-2 py-1 group">
      <span className="text-xs text-[#0D1B2A]/40 w-14 shrink-0">{label}</span>
      <input
        type={type || 'text'}
        value={value}
        onChange={function(e: any) { onChange(e.target.value); }}
        className="flex-1 bg-transparent border-b border-transparent text-sm text-[#0D1B2A]/75 px-1 py-0.5 focus:border-[#0D1B2A] focus:outline-none hover:border-[#0D1B2A]/10 transition-colors"
      />
    </div>
  );
}

function InlineSelect({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs text-[#0D1B2A]/40 w-14 shrink-0">{label}</span>
      <select
        value={value}
        onChange={function(e: any) { onChange(e.target.value); }}
        className="flex-1 bg-transparent border-b border-[#0D1B2A]/10 text-sm text-[#0D1B2A]/75 px-1 py-0.5 focus:border-[#0D1B2A] focus:outline-none"
      >
        {options.map(function(o) {
          return React.createElement('option', { key: o.value, value: o.value }, o.label);
        })}
      </select>
    </div>
  );
}

export default function ShotEditor({ shot, onSave, onCancel }: {
  shot: ShotData;
  onSave: (shot: ShotData) => void;
  onCancel: () => void;
}) {
  var [edited, setEdited] = useState<ShotData>(JSON.parse(JSON.stringify(shot)));

  function update(path: string, value: any) {
    var keys = path.split('.');
    var obj: any = JSON.parse(JSON.stringify(edited));
    var current = obj;
    for (var i = 0; i < keys.length - 1; i++) current = current[keys[i]];
    current[keys[keys.length - 1]] = value;
    setEdited(obj);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border-2 border-[#0D1B2A]/30 bg-white p-4 shadow-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-[#1E3A4D]">
          <Edit3 className="h-4 w-4 inline mr-1" />
          编辑分镜 #{shot.shotNumber}
        </span>
        <div className="flex gap-1">
          <button onClick={function() { onSave(edited); }} className="rounded-lg bg-[#0D1B2A] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1E3A4D]">
            <Check className="h-3 w-3 inline mr-1" />保存
          </button>
          <button onClick={onCancel} className="rounded-lg bg-[#F0F4F8] px-3 py-1 text-xs font-semibold text-[#0D1B2A]/60 hover:bg-[#E2E8F0]">
            <X className="h-3 w-3 inline mr-1" />取消
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
        {/* 基础信息 */}
        <div className="col-span-2 border-b border-[#0D1B2A]/6 pb-2 mb-2">
          <span className="text-[10px] font-bold text-[#0D1B2A]/40 uppercase tracking-wider">基础信息</span>
        </div>
        <InlineSelect label="景别" value={edited.shotType} options={SHOT_TYPE_OPTIONS} onChange={function(v: string) { update('shotType', v); }} />
        <InlineField label="时长" value={String(edited.durationSec)} onChange={function(v: string) { update('durationSec', parseInt(v) || 5); }} type="number" />

        {/* 摄影 */}
        <div className="col-span-2 border-b border-[#0D1B2A]/6 pb-2 mb-2 mt-2">
          <span className="text-[10px] font-bold text-[#0D1B2A]/40 uppercase tracking-wider">摄影</span>
        </div>
        <InlineField label="焦段" value={edited.camera.lens} onChange={function(v: string) { update('camera.lens', v); }} />
        <InlineField label="机位" value={edited.camera.angle} onChange={function(v: string) { update('camera.angle', v); }} />
        <InlineField label="运镜" value={edited.camera.movement.join(' · ')} onChange={function(v: string) { update('camera.movement', v.split('·').map(function(s: string) { return s.trim(); })); }} />
        <InlineField label="构图" value={edited.camera.composition} onChange={function(v: string) { update('camera.composition', v); }} />

        {/* 光线 */}
        <div className="col-span-2 border-b border-[#0D1B2A]/6 pb-2 mb-2 mt-2">
          <span className="text-[10px] font-bold text-[#0D1B2A]/40 uppercase tracking-wider">光线</span>
        </div>
        <InlineField label="类型" value={edited.lighting.type} onChange={function(v: string) { update('lighting.type', v); }} />
        <InlineField label="方向" value={edited.lighting.direction} onChange={function(v: string) { update('lighting.direction', v); }} />
        <InlineField label="质感" value={edited.lighting.quality} onChange={function(v: string) { update('lighting.quality', v); }} />
        <InlineField label="色温" value={edited.lighting.colorTemp} onChange={function(v: string) { update('lighting.colorTemp', v); }} />

        {/* 主体 */}
        <div className="col-span-2 border-b border-[#0D1B2A]/6 pb-2 mb-2 mt-2">
          <span className="text-[10px] font-bold text-[#0D1B2A]/40 uppercase tracking-wider">主体</span>
        </div>
        <InlineField label="人物" value={edited.subject.person} onChange={function(v: string) { update('subject.person', v); }} />
        <InlineField label="动作" value={edited.subject.action} onChange={function(v: string) { update('subject.action', v); }} />
        <InlineField label="服装" value={edited.subject.costume} onChange={function(v: string) { update('subject.costume', v); }} />

        {/* 艺术指导 */}
        <div className="col-span-2 border-b border-[#0D1B2A]/6 pb-2 mb-2 mt-2">
          <span className="text-[10px] font-bold text-[#0D1B2A]/40 uppercase tracking-wider">艺术指导</span>
        </div>
        <InlineField label="情绪" value={edited.emotion} onChange={function(v: string) { update('emotion', v); }} />
        <InlineField label="声音" value={edited.sound} onChange={function(v: string) { update('sound', v); }} />
        <div className="col-span-2">
          <InlineField label="备注" value={edited.directorNote} onChange={function(v: string) { update('directorNote', v); }} />
        </div>
      </div>
    </motion.div>
  );
}
