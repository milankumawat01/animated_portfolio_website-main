import React from 'react';

interface SectionHeaderProps {
  number: string;
  badge: string;
  title: string;
  highlight?: string;
  titleSuffix?: string;
  description?: string;
  theme?: 'light' | 'dark';
  className?: string;
  breakBeforeHighlight?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  number,
  badge,
  title,
  highlight,
  titleSuffix = '',
  description,
  theme = 'light',
  className = '',
  breakBeforeHighlight = false,
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Eyebrow Label: solid blue line, blue number, uppercase tracking */}
      <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-label uppercase">
        <span className="w-6 h-[2px] bg-blue rounded-full inline-block" />
        <span className="text-blue">{number}</span>
        <span className={isDark ? 'text-text-on-dark/60' : 'text-text-muted'}>{badge}</span>
      </div>

      {/* Main Heading: weight 800-900, comfortable leading to prevent ascender clipping */}
      <h2
        className={`text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-black tracking-heading leading-[1.12] pt-1 pb-1 ${
          isDark ? 'text-text-on-dark' : 'text-text-primary'
        }`}
      >
        {title}{' '}
        {breakBeforeHighlight && <br className="hidden sm:inline" />}
        {highlight && <span className="text-blue">{highlight}</span>}
        {titleSuffix}
      </h2>

      {/* Body: 17-19px, line-height 1.6 */}
      {description && (
        <p
          className={`text-base sm:text-lg max-w-2xl leading-[1.6] ${
            isDark ? 'text-text-on-dark/60' : 'text-text-secondary'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
};
