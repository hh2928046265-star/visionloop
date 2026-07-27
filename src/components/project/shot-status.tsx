'use client';
import React from 'react';

import { motion } from 'framer-motion';
import { Circle, CheckCircle2, Eye, AlertCircle } from 'lucide-react';

export type ShotStatus = 'draft' | 'review' | 'approved' | 'rejected';

var STATUS_CONFIG: Record<ShotStatus, { label: string; icon: any; color: string; bg: string }> = {
  draft:    { label: '草稿',   icon: Circle,         color: 'text-[#0D1B2A]/40', bg: 'bg-[#F0F4F8]' },
  review:   { label: '待审',   icon: Eye,           color: 'text-amber-500', bg: 'bg-amber-50' },
  approved: { label: '通过',   icon: CheckCircle2,  color: 'text-green-600', bg: 'bg-green-50' },
  rejected: { label: '需修改', icon: AlertCircle,   color: 'text-red-500',   bg: 'bg-red-50' },
};

export function ShotStatusBadge({ status, onChange }: { status: ShotStatus; onChange?: (s: ShotStatus) => void }) {
  var config = STATUS_CONFIG[status];
  var Icon = config.icon;

  if (!onChange) {
    return (
      <span className={'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ' + config.color + ' ' + config.bg}>
        <Icon className="h-3 w-3" />{config.label}
      </span>
    );
  }

  var nextStatus: Record<ShotStatus, ShotStatus> = {
    draft: 'review',
    review: 'approved',
    approved: 'rejected',
    rejected: 'draft',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={function() { onChange(nextStatus[status]); }}
      className={'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer transition-colors ' + config.color + ' ' + config.bg + ' hover:brightness-95'}
    >
      <Icon className="h-3 w-3" />{config.label}
    </motion.button>
  );
}

export function ShotStatusBar({ shots, onUpdateStatus }: {
  shots: Array<{ shotNumber: number; status?: ShotStatus }>;
  onUpdateStatus: (shotNumber: number, status: ShotStatus) => void;
}) {
  var counts = { draft: 0, review: 0, approved: 0, rejected: 0 };
  shots.forEach(function(s) {
    var st: ShotStatus = s.status || 'draft';
    counts[st] = (counts[st] || 0) + 1;
  });

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white border border-[#0D1B2A]/10 p-3">
      <span className="text-xs font-semibold text-[#0D1B2A]/50">分镜审核</span>
      <div className="flex gap-3">
        {(['draft', 'review', 'approved', 'rejected'] as ShotStatus[]).map(function(st) {
          var config = STATUS_CONFIG[st];
          var Icon = config.icon;
          return (
            <div key={st} className="flex items-center gap-1.5">
              <Icon className={'h-3.5 w-3.5 ' + config.color} />
              <span className="text-xs font-semibold text-[#0D1B2A]/60">{config.label}</span>
              <span className="text-xs text-[#0D1B2A]/40">{counts[st]}</span>
            </div>
          );
        })}
      </div>
      <div className="ml-auto flex-1 h-1.5 bg-[#F0F4F8] rounded-full overflow-hidden flex">
        {shots.length > 0 && (
          <>
            <div className="bg-gray-300 h-full" style={{ width: (counts.draft / shots.length * 100) + '%' }} />
            <div className="bg-amber-400 h-full" style={{ width: (counts.review / shots.length * 100) + '%' }} />
            <div className="bg-green-500 h-full" style={{ width: (counts.approved / shots.length * 100) + '%' }} />
            <div className="bg-red-400 h-full" style={{ width: (counts.rejected / shots.length * 100) + '%' }} />
          </>
        )}
      </div>
    </div>
  );
}
