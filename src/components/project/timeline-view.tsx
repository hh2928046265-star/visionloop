'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Camera, MapPin } from 'lucide-react';

var SHOT_TYPE_LABELS: Record<string, string> = {
  extreme_wide: '远景', wide: '全景', medium: '中景',
  closeup: '特写', extreme_closeup: '大特写', macro: '微距',
};

interface ShotData {
  shotNumber: number; durationSec: number; shotType: string;
  camera: { lens: string; angle: string; movement: string[] };
  subject: { person: string; action: string };
  emotion: string; directorNote: string;
}

interface SceneData {
  sceneNumber: number; durationSec: number; location: string;
  timeOfDay: string; action: string;
}

function calcTimeline(shots: ShotData[], scenes: SceneData[]) {
  var totalDuration = shots.reduce(function(sum, s) { return sum + (s.durationSec || 5); }, 0) || 1;
  return shots.map(function(shot, i) {
    var scene = scenes.find(function(s) { return s.sceneNumber === Math.ceil(shot.shotNumber / 2); }) || scenes[0];
    return {
      shotNumber: shot.shotNumber,
      durationSec: shot.durationSec || 5,
      shotType: shot.shotType,
      widthPercent: ((shot.durationSec || 5) / totalDuration) * 100,
      sceneLocation: scene ? scene.location : '',
      sceneTimeOfDay: scene ? scene.timeOfDay : '',
    };
  });
}

function getHue(n: number) { return (n * 37) % 360; }

export default function TimelineView({ shots, scenes, onShotClick }: {
  shots: ShotData[];
  scenes: SceneData[];
  onShotClick?: (shotNumber: number) => void;
}) {
  if (shots.length === 0) return null;
  var items = calcTimeline(shots, scenes);
  
  var sceneGroups = new Map();
  items.forEach(function(item) {
    var sceneNum = Math.ceil(item.shotNumber / 2) || 1;
    if (!sceneGroups.has(sceneNum)) sceneGroups.set(sceneNum, []);
    sceneGroups.get(sceneNum).push(item);
  });

  return (
    React.createElement('div', { className: 'rounded-xl border border-[#0D1B2A]/10 bg-white p-4 overflow-x-auto' },
      React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
        React.createElement(Clock, { className: 'h-4 w-4 text-[#0D1B2A]' }),
        React.createElement('span', { className: 'text-sm font-semibold text-[#0D1B2A]/75' }, '时间轴 · ' + items.length + ' 个镜头'),
        React.createElement('span', { className: 'text-xs text-[#0D1B2A]/40 ml-auto' }, '← 滑动查看 →')
      ),
      React.createElement('div', { className: 'flex items-end gap-0.5 min-w-[600px]', style: { height: '120px' } },
        items.map(function(item, idx) {
          var isNewScene = idx === 0 || Math.ceil(item.shotNumber / 2) !== Math.ceil(items[idx-1] ? items[idx-1].shotNumber / 2 : 0);
          var hue = getHue(item.shotNumber);
          var bg = 'hsl(' + hue + ', 40%, 88%)';
          var border = '1px solid hsl(' + hue + ', 30%, 75%)';
          return React.createElement('div', {
            key: item.shotNumber,
            className: 'flex flex-col items-center',
            style: { width: item.widthPercent + '%', minWidth: '40px' }
          },
            isNewScene ? React.createElement('div', { className: 'text-[10px] text-[#0D1B2A] font-bold mb-1 whitespace-nowrap overflow-hidden text-ellipsis', style: { maxWidth: '100%' } },
              React.createElement(MapPin, { className: 'h-2.5 w-2.5 inline mr-0.5' }),
              item.sceneLocation
            ) : null,
            React.createElement('button', {
              onClick: function() { onShotClick && onShotClick(item.shotNumber); },
              className: 'w-full rounded-md cursor-pointer transition-all hover:shadow-md flex flex-col items-center justify-center hover:scale-105',
              style: { height: isNewScene ? '80px' : '90px', background: bg, border: border }
            },
              React.createElement('span', { className: 'text-[10px] font-bold text-[#0D1B2A]/60' }, '#' + item.shotNumber),
              React.createElement('span', { className: 'text-[9px] text-[#0D1B2A]/50' }, SHOT_TYPE_LABELS[item.shotType] || item.shotType),
              React.createElement('span', { className: 'text-[9px] text-[#0D1B2A]/40' }, item.durationSec + 's')
            ),
            React.createElement('span', { className: 'text-[9px] text-[#0D1B2A]/40 mt-0.5' }, item.durationSec + 's')
          );
        })
      ),
      React.createElement('div', { className: 'flex gap-4 mt-3 pt-2 border-t border-[#0D1B2A]/6' },
        Array.from(sceneGroups.entries()).map(function(entry: any) {
          var num = entry[0];
          var groupShots = entry[1];
          var hue = getHue(groupShots[0].shotNumber);
          return React.createElement('div', { key: num, className: 'flex items-center gap-1.5' },
            React.createElement('div', { className: 'h-3 w-3 rounded', style: { background: 'hsl(' + hue + ', 40%, 88%)', border: '1px solid hsl(' + hue + ', 30%, 75%)' } }),
            React.createElement('span', { className: 'text-[10px] text-[#0D1B2A]/50' }, '场景' + num + ' · ' + groupShots.length + '镜')
          );
        })
      )
    )
  );
}