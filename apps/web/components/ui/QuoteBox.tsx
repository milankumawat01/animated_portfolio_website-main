import React from 'react';

interface QuoteBoxProps {
  quote: string;
  author?: string;
  theme?: 'light' | 'dark';
  className?: string;
}

export const QuoteBox: React.FC<QuoteBoxProps> = ({
  quote,
  author = 'Milan Kumawat',
  theme = 'light',
  className = '',
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-start gap-4 ${className}`}>
      {/* Big Blue Quote Mark */}
      <span
        className="text-4xl sm:text-5xl font-serif text-blue select-none leading-none -mt-2"
        aria-hidden="true"
      >
        “
      </span>

      <div className="space-y-1">
        <p
          className={`text-base sm:text-lg font-medium italic leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-text-primary'
          }`}
        >
          {quote}
        </p>
        {author && (
          <p
            className={`text-xs font-bold tracking-wide ${
              isDark ? 'text-slate-400' : 'text-text-muted'
            }`}
          >
            — {author}
          </p>
        )}
      </div>
    </div>
  );
};
