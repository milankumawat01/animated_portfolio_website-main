import React from 'react';

interface HandwritingProps {
  text: string;
  color?: 'blue' | 'charcoal' | 'white' | 'slate';
  rotation?: '-6' | '-4' | '-3' | '-2' | '0' | '2' | '3' | '4' | '6' | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  underline?: boolean;
  arrow?: 'down' | 'right' | 'up-right' | 'left' | 'none';
  className?: string;
}

export const Handwriting: React.FC<HandwritingProps> = ({
  text,
  color = 'blue',
  rotation = '-3',
  size = 'md',
  underline = false,
  arrow = 'none',
  className = '',
}) => {
  const colorMap = {
    blue: 'text-blue',
    charcoal: 'text-text-primary',
    white: 'text-text-on-dark',
    slate: 'text-text-secondary',
  };

  const rotationMap: Record<string, string> = {
    '-6': '-rotate-6',
    '-4': '-rotate-[4deg]',
    '-3': '-rotate-[3deg]',
    '-2': '-rotate-2',
    '0': 'rotate-0',
    '2': 'rotate-2',
    '3': 'rotate-[3deg]',
    '4': 'rotate-[4deg]',
    '6': 'rotate-6',
  };

  const sizeMap = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
  };

  return (
    <div
      className={`inline-block font-handwriting select-none transform transition-transform ${
        colorMap[color]
      } ${rotationMap[rotation as keyof typeof rotationMap] || '-rotate-3'} ${
        sizeMap[size]
      } ${className}`}
      style={{ lineHeight: 1.2 }}
    >
      <div className="whitespace-pre-line">{text}</div>

      {underline && (
        <svg
          className="w-full h-3 mt-0.5 text-current opacity-80"
          viewBox="0 0 100 12"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M2 8 C 20 2, 50 11, 98 4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      )}

      {arrow === 'right' && (
        <svg
          className="w-8 h-4 inline-block ml-1 text-current"
          viewBox="0 0 32 16"
          fill="none"
        >
          <path
            d="M2 8h24m-6-6l7 6-7 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {arrow === 'down' && (
        <svg
          className="w-6 h-8 mx-auto mt-1 text-current"
          viewBox="0 0 16 32"
          fill="none"
        >
          <path
            d="M8 2v24m-6-6l6 7 6-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
};
