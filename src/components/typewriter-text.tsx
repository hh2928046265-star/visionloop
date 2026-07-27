'use client';

import { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
}

export default function TypewriterText({ text, speed = 30, onComplete, className = '', showCursor = true }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    setDisplayed('');
    indexRef.current = 0;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        onComplete?.();
      }
    }, speed);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [text, speed]);

  return (
    <span className={className}>
      {displayed}
      {showCursor && displayed.length < text.length && (
        <span className="typewriter-cursor" />
      )}
    </span>
  );
}
