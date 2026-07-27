'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

// ============================================================
// Custom Cursor
// ============================================================
function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hover, setHover] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };
    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);
    const onHoverStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target?.closest('a, button, input, [data-cursor-hover]')) setHover(true);
    };
    const onHoverEnd = () => setHover(false);
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseover', onHoverStart as EventListener);
    document.addEventListener('mouseout', onHoverEnd);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseover', onHoverStart as EventListener);
      document.removeEventListener('mouseout', onHoverEnd);
    };
  }, [visible]);

  if (!visible) return null;
  return (
    <>
      <div
        className="custom-cursor-dot"
        style={{ left: pos.x - 2, top: pos.y - 2 }}
      />
      <div
        className={`custom-cursor ${hover ? 'hover' : ''}`}
        style={{ left: pos.x - 10, top: pos.y - 10 }}
      />
    </>
  );
}

// ============================================================
// Noise Overlay
// ============================================================
function NoiseOverlay() {
  return <div className="noise-overlay" />;
}

// ============================================================
// Vignette
// ============================================================
function VignetteOverlay() {
  return <div className="vignette" />;
}

// ============================================================
// Scroll Progress
// ============================================================
function ScrollProgress() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setWidth(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: width + '%' }} />;
}

// ============================================================
// Ripple Provider — wraps children with ripple click effect
// ============================================================
function RippleProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target?.closest('button, a, [data-ripple]')) return;
    const el = target.closest('button, a, [data-ripple]') as HTMLElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    const existing = el.querySelector('.ripple-container');
    const target_el = existing || el;
    if (!existing && !el.classList.contains('ripple-container')) {
      el.style.position = el.style.position || 'relative';
      el.style.overflow = 'hidden';
    }
    target_el.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleClick]);

  return <div ref={containerRef}>{children}</div>;
}

// ============================================================
// Page Transition
// ============================================================
function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================
// Global Effects Wrapper
// ============================================================
export default function GlobalEffects({ children }: { children: React.ReactNode }) {
  return (
    <RippleProvider>
      <CustomCursor />
      <NoiseOverlay />
      <VignetteOverlay />
      <ScrollProgress />
      <PageTransition>
        {children}
      </PageTransition>
    </RippleProvider>
  );
}

export { CustomCursor, NoiseOverlay, VignetteOverlay, ScrollProgress, PageTransition };
