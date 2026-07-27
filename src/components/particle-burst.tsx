'use client';

import { useEffect, useRef, useCallback } from 'react';

interface ParticleBurstProps {
  trigger: boolean;
  count?: number;
  color?: string;
}

export default function ParticleBurst({ trigger, count = 30, color = 'rgba(0,0,0,0.5)' }: ParticleBurstProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const burst = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const angle = (Math.PI * 2 * i) / count;
      const distance = 30 + Math.random() * 60;
      particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
      particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
      particle.style.left = '50%';
      particle.style.top = '50%';
      particle.style.background = color;
      particle.style.width = (2 + Math.random() * 4) + 'px';
      particle.style.height = particle.style.width;
      container.appendChild(particle);
      particle.addEventListener('animationend', () => particle.remove());
    }
  }, [count, color]);

  useEffect(() => {
    if (trigger) burst();
  }, [trigger, burst]);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none z-20" />;
}
