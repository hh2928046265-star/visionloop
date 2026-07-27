'use client';

import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  border?: boolean;
  onClick?: () => void;
}

export default function TiltCard({ children, className = '', strength = 12, border = true, onClick }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setRotate({ x: (y - 0.5) * -strength, y: (x - 0.5) * strength });
    setGlow({ x: x * 100, y: y * 100 });
  }, [strength]);

  const handleMouseEnter = useCallback(() => setHovering(true), []);
  const handleMouseLeave = useCallback(() => {
    setRotate({ x: 0, y: 0 });
    setGlow({ x: 50, y: 50 });
    setHovering(false);
  }, []);

  return (
    <div
      ref={ref}
      className="tilt-card"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <motion.div
        animate={{ rotateX: rotate.x, rotateY: rotate.y }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`tilt-card-inner ${className}`}
        style={{ position: 'relative' }}
      >
        {hovering && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(0,0,0,0.03) 0%, transparent 60%)`,
              borderRadius: 'inherit',
            }}
          />
        )}
        <div className="relative z-10">{children}</div>
      </motion.div>
    </div>
  );
}
