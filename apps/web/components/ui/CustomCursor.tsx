'use client';

import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClickable, setIsClickable] = useState(false);
  const [hoverText, setHoverText] = useState('');
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    // Check if device is touch-enabled
    if (typeof window !== 'undefined') {
      const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouch(touchDevice);
      if (touchDevice) return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('a, button, [role="button"], input, textarea, .cursor-pointer');
      const projectCard = target.closest('[data-cursor-view="true"]');

      if (projectCard) {
        setIsClickable(true);
        setHoverText('VIEW →');
      } else if (interactive) {
        setIsClickable(true);
        setHoverText('');
      } else {
        setIsClickable(false);
        setHoverText('');
      }
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (isTouch || !isHovered) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className={`rounded-full flex items-center justify-center transition-all duration-200 ${
          isClickable
            ? hoverText
              ? 'w-16 h-16 bg-blue text-text-on-dark text-3xs font-black tracking-wider shadow-lg shadow-blue/30 scale-100'
              : 'w-10 h-10 bg-blue/15 border border-blue text-transparent scale-100 backdrop-blur-2xs'
            : 'w-2 h-2 bg-blue shadow-sm'
        }`}
      >
        {hoverText && <span className="text-[10px] font-bold tracking-wider">{hoverText}</span>}
      </div>
    </div>
  );
};
