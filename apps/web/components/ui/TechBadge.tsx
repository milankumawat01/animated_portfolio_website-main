import React from 'react';

interface TechBadgeProps {
  name: string;
  variant?: 'light' | 'dark' | 'outline' | 'blue';
  className?: string;
}

export const TechBadge: React.FC<TechBadgeProps> = ({
  name,
  variant = 'light',
  className = '',
}) => {
  const variantStyles = {
    light: 'bg-bg-soft text-text-secondary border-border hover:bg-border',
    dark: 'bg-text-on-dark/10 text-text-on-dark/80 border-text-on-dark/10 hover:bg-text-on-dark/15',
    outline: 'bg-surface-elevated text-text-primary border-border hover:border-blue hover:text-blue',
    blue: 'bg-blue-light text-blue border-blue/20 hover:bg-blue-light/80',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors duration-200 select-none ${variantStyles[variant]} ${className}`}
    >
      {name}
    </span>
  );
};
