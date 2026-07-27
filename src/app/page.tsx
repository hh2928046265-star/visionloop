'use client';

import Link from 'next/link';
import ModelSettingsPanel from "@/components/home/model-settings-panel";
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

function LogoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="7" height="14" rx="3.5" transform="rotate(-35 5.5 12)" fill="#0D1B2A" />
      <rect x="14" y="5" width="10" height="14" rx="5" transform="rotate(-35 19 12)" fill="#0D1B2A" />
    </svg>
  );
}

function Particle({ index }: { index: number }) {
  const seed = index * 137.5;
  return (
    <motion.div
      className="absolute rounded-full bg-[#0D1B2A]/[0.03]"
      style={{ left: ((seed * 73) % 100) + '%', top: ((seed * 47) % 100) + '%', width: 2 + (index % 3), height: 2 + (index % 3) }}
      animate={{ y: [0, -30, 0, 20, 0], x: [0, 15, -10, -15, 0], opacity: [0.15, 0.5, 0.25, 0.4, 0.15] }}
      transition={{ duration: 15 + (index % 20), delay: (index * 0.7) % 8, repeat: Infinity, ease: 'linear' }}
    />
  );
}

function CharReveal({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, delay: delay + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 35 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 35 });
  const rotateX = useTransform(springY, [0, 1], [2, -2]);
  const rotateY = useTransform(springX, [0, 1], [-2, 2]);
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });

  useEffect(() => {
    setMounted(true);
    const onMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <main ref={heroRef} className="relative min-h-screen bg-white flex flex-col justify-between overflow-hidden">
      {/* Mouse glow */}
      <div
        className="mouse-glow"
        style={{ left: mousePos.x, top: mousePos.y, opacity: mousePos.x > 0 ? 1 : 0 }}
      />

      {/* ============ NAVBAR ============ */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease }}
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none px-6 md:px-10 py-5 md:py-7"
      >
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 no-underline group">
              <motion.div whileHover={{ rotate: -8 }} transition={{ duration: 0.3 }}>
                <LogoIcon />
              </motion.div>
              <span className="hidden md:inline text-sm font-medium text-[#0D1B2A] tracking-tight group-hover:text-[#0D1B2A]/70 transition-colors">
                VisionLoop
              </span>
            </Link>

            {/* CTA */}
            <Link
              href="/projects"
              className="group relative flex items-center gap-2 bg-[#0D1B2A] rounded-full pl-3.5 pr-5 py-2 no-underline overflow-hidden shadow-btn transition-shadow duration-500"
              data-ripple
            >
              <span className="absolute inset-0 bg-white -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              <span className="relative z-10 w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-[#0D1B2A] transition-colors duration-500">
                <Plus size={12} strokeWidth={1.5} className="text-[#0D1B2A] group-hover:text-white transition-colors duration-500" />
              </span>
              <span className="relative z-10 text-[11px] font-medium text-white group-hover:text-[#0D1B2A] transition-colors duration-500">
                开始创作
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-3 bg-[#F0F4F8] rounded-full px-4 py-2 hover:bg-[#E2E8F0] transition-colors duration-300">
              <span className="text-[11px] font-medium text-[#0D1B2A]/60">AI分镜</span>
              <span className="text-[11px] font-medium text-[#0D1B2A]/60">故事板</span>
            </div>
          </div>

          <div className="hidden md:flex items-center">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-2 bg-[#F0F4F8] rounded-full pl-4 pr-2 py-2 cursor-pointer hover:bg-[#E2E8F0] transition-colors duration-300"
            >
              <span className="text-[11px] font-medium text-[#0D1B2A]/60">智能创作</span>
              <span className="w-7 h-7 rounded-full bg-[#0D1B2A] flex items-center justify-center">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <circle cx="3" cy="3" r="1.2" fill="white" /><circle cx="9" cy="3" r="1.2" fill="white" />
                  <circle cx="3" cy="9" r="1.2" fill="white" /><circle cx="9" cy="9" r="1.2" fill="white" />
                </svg>
              </span>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* ============ BACKGROUND ============ */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f8fafb] to-[#f0f4f8]" />
        {mounted && Array.from({ length: 20 }, (_, i) => <Particle key={i} index={i} />)}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.2 }} className="absolute inset-0">
          {[[70, 55], [55, 48], [45, 40], [60, 45], [48, 38]].map(([dur, size], i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                border: `${i === 2 ? '1px dashed' : '1px solid'} rgba(13,27,42,${0.03 - i * 0.005})`,
                [i < 3 ? 'top' : 'bottom']: `${10 + i * 12}%`,
                [i < 3 ? 'left' : 'right']: `${6 + i * 2}%`,
                width: `${size}vmin`, height: `${size}vmin`,
              }}
              animate={{ rotate: i % 2 ? -360 : 360 }}
              transition={{ duration: dur, repeat: Infinity, ease: 'linear' }}
            />
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 0.25 }}
          transition={{ duration: 2.4 }}
          className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(13,27,42,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(13,27,42,0.02) 1px, transparent 1px)', backgroundSize: '80px 80px' }}
        />
        {/* Light rays */}
        {[15, 40, -25, -50].map((angle, i) => (
          <motion.div
            key={i}
            className="light-ray"
            style={{ transform: `rotate(${angle}deg)` }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 8 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: i * 2 }}
          />
        ))}
      </div>

      {/* ============ HERO CONTENT - Narrow centered ============ */}
      <div className="relative z-20 flex-1 flex items-center">
        <motion.div
          className="w-full max-w-[440px] mx-auto px-6 pt-24 md:pt-20"
          style={{ rotateX, rotateY, transformPerspective: 1000 }}
        >
          {/* Subtitle */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease }}
            className="flex items-center gap-2 mb-6"
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-[#0D1B2A]"
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#0D1B2A]/50 font-medium">
              创意到分镜
            </span>
          </motion.div>

          {/* Main heading - serif, generous spacing */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease }}
            className="font-display font-normal text-[#0D1B2A] leading-[1.25] tracking-[-0.02em] mb-10"
            style={{ fontSize: 'clamp(2.4rem, 6.5vw, 4rem)' }}
          >
            {mounted ? (
              <div className="flex flex-col gap-3">
                <CharReveal text="输入创意，" delay={0.8} />
                <CharReveal text="生成专业分镜故事板" delay={1.4} />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <span>输入创意，</span>
                <span>生成专业分镜故事板</span>
              </div>
            )}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.4, ease }}
            className="text-[15px] text-[#1E3A4D]/70 leading-relaxed mb-6 max-w-[380px]">
            AI 自动完成主题分析、剧本创作、分镜拆解和故事板生成。从灵感到可视化，一站式完成。
          </motion.p>

          {/* Model settings */}
          <div className="mb-6">
            <ModelSettingsPanel />
          </div>

          {/* Buttons */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.6, ease }}
            className="flex items-center gap-3">
            <Link
              href="/projects"
              className="group relative flex items-center gap-2 bg-[#0D1B2A] rounded-full pl-5 pr-6 py-3 no-underline overflow-hidden shadow-btn transition-shadow duration-500"
              data-ripple>
              <span className="absolute inset-0 bg-white -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              <span className="relative z-10 flex items-center gap-2 group-hover:text-[#0D1B2A] transition-colors duration-500 text-white">
                <svg className="h-3.5 w-3.5 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                <span className="text-[14px] font-medium">开始创作</span>
              </span>
            </Link>
            <Link href="/projects" className="text-[14px] font-medium text-[#0D1B2A]/50 hover:text-[#0D1B2A] transition-colors duration-500">了解更多 →</Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ============ BOTTOM: type pills + scroll indicator ============ */}
      <div className="relative z-20 pb-8 md:pb-10 px-6 md:px-10">
        <div className="flex items-end justify-between">
          {/* Type pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.8, ease }}
            className="flex flex-wrap items-center gap-2"
          >
            {['种草推广', '口播带货', 'Vlog', '宣传片', '短视频'].map((tag, i) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 3.0 + i * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
                whileHover={{ scale: 1.04, backgroundColor: '#F0F4F8', borderColor: 'rgba(13,27,42,0.2)' }}
                className="inline-flex items-center px-4 py-2 bg-white border border-[#0D1B2A]/8 text-[11px] font-medium text-[#0D1B2A]/60 rounded-full cursor-default transition-all duration-300"
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 3.2 }}
            className="hidden md:flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-full border border-[#0D1B2A]/15 flex items-center justify-center gap-[2px]">
              <span className="w-[1px] h-[9px] bg-[#0D1B2A]/35 rounded-full" />
              <span className="w-[1px] h-[9px] bg-[#0D1B2A]/35 rounded-full" />
            </div>
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#0D1B2A]/35 font-medium">
              向下滚动
            </span>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
