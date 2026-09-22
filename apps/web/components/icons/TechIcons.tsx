import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const TechIcon: React.FC<{ name: string; className?: string; size?: number }> = ({
  name,
  className = 'w-6 h-6',
  size = 24,
}) => {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  switch (key) {
    case 'python':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#387EB8" d="M63.5 6.4c-14.8 0-23.7 6.4-23.7 18.8v13.8h24.4v3.5H30.4C14.7 42.5 0 51.5 0 71.4c0 19.9 12.8 28.5 28.5 28.5h9.2V86.7c0-13.8 11.6-25.2 25.4-25.2h24.4V36.7c0-13.4-11.4-25.2-24.4-25.2h.4zM48 18.5c2.6 0 4.8 2.1 4.8 4.8s-2.1 4.8-4.8 4.8-4.8-2.1-4.8-4.8 2.1-4.8 4.8-4.8z" />
          <path fill="#FFE052" d="M64.5 121.6c14.8 0 23.7-6.4 23.7-18.8V89H63.8v-3.5h33.8c15.7 0 30.4-9 30.4-28.9 0-19.9-12.8-28.5-28.5-28.5h-9.2v13.2c0 13.8-11.6 25.2-25.4 25.2H30.5v24.8c0 13.4 11.4 25.2 24.4 25.2h9.6zm15.5-12.1c-2.6 0-4.8-2.1-4.8-4.8s2.1-4.8 4.8-4.8 4.8 2.1 4.8 4.8-2.2 4.8-4.8 4.8z" />
        </svg>
      );
    case 'fastapi':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="60" fill="#05998B" />
          <path fill="#FFFFFF" d="M69 16L32 72h30l-7 40 37-56H62l7-40z" />
        </svg>
      );
    case 'nextjs':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="64" fill="#000000" />
          <path fill="#FFFFFF" d="M98.5 102.3L48.2 38H39v52h8.3V50.7l46 58.7c1.8-2.2 3.6-4.6 5.2-7.1z" />
          <path fill="#FFFFFF" d="M81 38h8.5v32H81z" />
        </svg>
      );
    case 'postgresql':
    case 'postgres':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#336791" d="M64 8c-30.9 0-56 25.1-56 56 0 24.8 16.1 45.8 38.4 53.1 3.5 1.1 9.4 1.4 13.6 1.4 4.5 0 10.4-.4 14.1-1.6C97.1 109.2 112 88.6 112 64c0-30.9-21.5-56-48-56zm-1.8 15.2c16 0 27.5 12.3 27.5 28.5 0 12.5-7.5 22.3-17.7 26.2 3.9 6.2 9.2 11.4 15.5 15.2-1.9 1.1-4.7 1.9-7.2 2.3-6.8-4.2-12.7-10.1-17-17-4.1 6.8-9.8 12.5-16.5 16.7-2.6-.4-5.3-1.2-7.3-2.3 6.3-3.8 11.6-9 15.5-15.1-10.2-3.9-17.7-13.7-17.7-26 0-16.3 11.4-28.5 27.4-28.5h3.6z" />
        </svg>
      );
    case 'mongodb':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#13AA52" d="M63.8 4C61 5.9 31.5 27.8 31.5 67.9c0 30.2 21.2 47.9 32.3 56.1 11.1-8.2 32.3-25.9 32.3-56.1C96.1 27.8 66.6 5.9 63.8 4zm1.5 106.8v-43.2c0-7.3-1.2-14.4-3-21.2-.2 15.5-3.3 35.8-9.8 47.7 3.5 5.5 8.1 11.8 12.8 16.7zm-2.9-72.3c-.6 2.3-1.2 4.7-1.5 7.1.3-2.4.9-4.8 1.5-7.1z" />
        </svg>
      );
    case 'redis':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#D82C20" d="M64 12L12 38l52 26 52-26L64 12zm52 44.5l-52 26-52-26V74l52 26 52-26V56.5zm0 30.5l-52 26-52-26v17.5l52 26 52-26V87z" />
        </svg>
      );
    case 'docker':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#2496ED" d="M120.7 54.8c-2.4-1.8-8-2.6-13.6-.9-1.3-4.8-4.4-8.8-8.7-11.3l-2.4-1.4-1.6 2.2c-4.3 6.1-5.6 13.9-3.7 21.2-3.1 1.7-8.1 2.8-13.8 3-1.1-1.1-2.4-2.1-3.9-2.9-2.1-1.2-4.5-1.8-6.9-1.8H9.3c-2.3 0-4.3 1.7-4.6 4-2.4 17.6 2.6 34.9 14.1 48.7 11.9 14.2 29.5 22.4 48.2 22.4 39.5 0 69.4-28.5 70.8-67.4 0-1.2-.2-2.5-.5-3.7 4.7-2.6 7.4-6.4 7.4-10.2 0-.8-.1-1.5-.4-2.2l-3.6-1.4zM47.2 47.9h12.5v12.5H47.2V47.9zm0-16.7h12.5v12.5H47.2V31.2zm-16.7 16.7H43v12.5H30.5V47.9zm0-16.7H43v12.5H30.5V31.2zm33.4 16.7h12.5v12.5H63.9V47.9zm0-16.7h12.5v12.5H63.9V31.2zm16.7 16.7h12.5v12.5H80.6V47.9zm-66.8 0h12.5v12.5H13.8V47.9z" />
        </svg>
      );
    case 'openai':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#10A37F" d="M117.8 53.6a31.4 31.4 0 0 0-2.8-26.6 32 32 0 0 0-33.8-15.1 31.8 31.8 0 0 0-23.7-10.5 32 32 0 0 0-30.5 22.2 31.8 31.8 0 0 0-20.9 15.2 32 32 0 0 0 3.3 36.9 31.4 31.4 0 0 0 2.8 26.6 32 32 0 0 0 33.8 15.1 31.8 31.8 0 0 0 23.7 10.5 32 32 0 0 0 30.5-22.2 31.8 31.8 0 0 0 20.9-15.2 32 32 0 0 0-3.3-36.9zm-43.2 60.8c-2.3 0-4.5-.4-6.6-1.2L44.8 99.4a3.8 3.8 0 0 1-1.9-3.3V67.8l9.7 5.6v23.4l19.5 11.2c5.9 3.4 13.4 1.4 16.8-4.5 3.4-5.9 1.4-13.4-4.5-16.8l-1.9-1.1 5.6-9.7 1.9 1.1c11.3 6.5 15.1 20.9 8.6 32.2-4.9 8.5-14 13.7-24 13.7zm-47.4-23a19.7 19.7 0 0 1-2.4-6.3c-2.8-12.7 5.2-25.2 17.9-28l2.1-.5 2.8 9.3-2.1.5c-6.6 1.5-10.8 8.1-9.3 14.7 1.5 6.6 8.1 10.8 14.7 9.3l2.2-.5v11.3l-2.2.5c-7.9 1.7-16.2-.2-23.7-10.3zm-7.6-43c2.3 0 4.5.4 6.6 1.2l23.2 13.4a3.8 3.8 0 0 1 1.9 3.3v28.3l-9.7-5.6V62.4L42.1 51.2c-5.9-3.4-13.4-1.4-16.8 4.5-3.4 5.9-1.4 13.4 4.5 16.8l1.9 1.1-5.6 9.7-1.9-1.1c-11.3-6.5-15.1-20.9-8.6-32.2 4.9-8.5 14-13.7 24-13.7zm71.8 13.8l-23.2-13.4a3.8 3.8 0 0 1-1.9-3.3V17.6l9.7 5.6v23.4l19.5 11.2c5.9 3.4 13.4 1.4 16.8-4.5 3.4-5.9 1.4-13.4-4.5-16.8l-1.9-1.1 5.6-9.7 1.9 1.1c11.3 6.5 15.1 20.9 8.6 32.2-4.9 8.5-14 13.7-24 13.7-2.3 0-4.5-.4-6.6-1.2zm14-17.7l-2.2.5v-11.3l2.2-.5c7.9-1.7 16.2.2 23.7 10.3 5.4 7.3 6.9 16.8 4.1 25.5a19.7 19.7 0 0 1-2.4 6.3c-2.8 12.7-15.3 20.7-28 17.9l-2.1-.5 2.8-9.3 2.1.5c6.6 1.5 13.2-2.7 14.7-9.3 1.5-6.6-2.7-13.2-9.3-14.7l-2.1-.5zM53.1 70.3l10.9-6.3 10.9 6.3v12.6l-10.9 6.3-10.9-6.3V70.3z" />
        </svg>
      );
    case 'claude':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="64" fill="#D97706" />
          <path fill="#FFF" d="M64 26l6 26 26 6-26 6-6 26-6-26-26-6 26-6 6-26zm25 45l4 17 17 4-17 4-4 17-4-17-17-4 17-4 4-17zm-50 0l4 17 17 4-17 4-4 17-4-17-17-4 17-4 4-17z" />
        </svg>
      );
    case 'gemini':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#1A73E8" d="M64 8C64 39 39 64 8 64c31 0 56 25 56 56 0-31 25-56 56-56-31 0-56-25-56-56z" />
        </svg>
      );
    case 'langchain':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="56" fill="#1C3C3C" />
          <path fill="#10B981" d="M48 48a16 16 0 100 32h12v-8H48a8 8 0 010-16h12v-8H48zm32-8H68v8h12a8 8 0 010 16H68v8h12a16 16 0 000-32zM44 60h40v8H44z" />
        </svg>
      );
    case 'llamaindex':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <rect width="128" height="128" rx="24" fill="#111827" />
          <path fill="#A855F7" d="M44 32h16v40h24v16H44V32z" />
          <circle cx="84" cy="44" r="10" fill="#EC4899" />
        </svg>
      );
    case 'rag':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <rect width="128" height="128" rx="24" fill="#F3F4F6" />
          <path fill="#2563EB" d="M36 28h38l26 26v46a8 8 0 01-8 8H36a8 8 0 01-8-8V36a8 8 0 018-8zm34 6v22h22L70 34zm-22 38h48v6H48v-6zm0 14h48v6H48v-6z" />
        </svg>
      );
    case 'nodejs':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#339933" d="M64 12l48 27.7v55.4L64 122.8 16 95.1V39.7L64 12zm0 18.5L28.8 49.3v36.9L64 107.1l35.2-20.9V49.3L64 30.5z" />
        </svg>
      );
    case 'react':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <ellipse cx="64" cy="64" rx="48" ry="18" fill="none" stroke="#00D8FF" strokeWidth="7" />
          <ellipse cx="64" cy="64" rx="48" ry="18" fill="none" stroke="#00D8FF" strokeWidth="7" transform="rotate(60 64 64)" />
          <ellipse cx="64" cy="64" rx="48" ry="18" fill="none" stroke="#00D8FF" strokeWidth="7" transform="rotate(120 64 64)" />
          <circle cx="64" cy="64" r="8" fill="#00D8FF" />
        </svg>
      );
    case 'typescript':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <rect width="128" height="128" rx="16" fill="#3178C6" />
          <path fill="#FFF" d="M38 48h32v12H58v40H46V60H38V48zm36 28c3 4 8 7 15 7 5 0 9-2 9-6 0-11-25-6-25-24 0-9 8-16 20-16 8 0 14 3 18 7l-6 10c-3-3-7-5-12-5-4 0-8 2-8 5 0 10 25 5 25 24 0 10-8 17-21 17-9 0-17-3-22-9l7-10z" />
        </svg>
      );
    case 'tailwind':
    case 'tailwindcss':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#06B6D4" d="M32 40c6.7-13.3 16.7-20 30-20 20 0 25 15 35 15s15-10 15-10-6.7 13.3-16.7 20C75.3 45 70.3 30 60.3 30S45.3 40 32 40zm-16 40c6.7-13.3 16.7-20 30-20 20 0 25 15 35 15s15-10 15-10-6.7 13.3-16.7 20C59.3 85 54.3 70 44.3 70S29.3 80 16 80z" />
        </svg>
      );
    case 'html':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#E44D26" d="M16 12l10 100 38 12 38-12 10-100H16z" />
          <path fill="#F16529" d="M64 22v91.5l29-9.2 8-79.3H64z" />
          <path fill="#FFF" d="M64 42H44l2 18h18v-18zm0 28H46l1 15 17 5v-17l-1-.3v-2.7z" />
        </svg>
      );
    case 'css':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#1572B6" d="M16 12l10 100 38 12 38-12 10-100H16z" />
          <path fill="#33A9DC" d="M64 22v91.5l29-9.2 8-79.3H64z" />
          <path fill="#FFF" d="M64 42H44l2 18h18v-18zm0 28H46l1 15 17 5v-17l-1-.3v-2.7z" />
        </svg>
      );
    case 'supabase':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#3ECF8E" d="M68 8L20 72h40l-8 48 56-72H68l8-40z" />
        </svg>
      );
    case 'convex':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="56" fill="none" stroke="#FF5722" strokeWidth="12" strokeDasharray="260 40" />
        </svg>
      );
    case 'cloudflare':
    case 'cloudflarer2':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#F38020" d="M98 52c-2.4-14.7-15-26-30.2-26-11.8 0-22.1 6.8-27.2 16.8-2.8-1.7-6.1-2.8-9.6-2.8-10.5 0-19 8.5-19 19 0 1.2.1 2.3.3 3.4C19 63.8 12 73.1 12 84c0 13.3 10.7 24 24 24h68c13.3 0 24-10.7 24-24 0-11.8-8.5-21.7-19.8-23.7-.1-2.8-.8-5.6-2.2-8.3z" />
        </svg>
      );
    case 'firebase':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#FFA000" d="M24 94L42 16l18 34L24 94z" />
          <path fill="#F57C00" d="M74 42L60 16 24 94l50-52z" />
          <path fill="#FFCA28" d="M104 94L84 34l-20 44 40 16z" />
          <path fill="#FFA000" d="M24 94l40 22 40-22-40-16-40 16z" />
        </svg>
      );
    case 'nginx':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="60" fill="#009639" />
          <path fill="#FFF" d="M42 34v60l22-34v34h12V34L54 68V34H42z" />
        </svg>
      );
    case 'vercel':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#000000" d="M64 16L120 112H8L64 16z" />
        </svg>
      );
    case 'digitalocean':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#0080FF" d="M64 16c26.5 0 48 21.5 48 48 0 20.3-12.6 37.7-30.5 44.6V88.8C91.4 83.2 98 72.8 98 64c0-18.8-15.2-34-34-34-18.8 0-34 15.2-34 34 0 8.8 6.6 19.2 16.5 24.8v19.8C28.6 101.7 16 84.3 16 64c0-26.5 21.5-48 48-48zm-8 72h16v16H56V88zm-16 0h12v12H40V88zm0-16h12v12H40V72z" />
        </svg>
      );
    case 'ubuntu':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="60" fill="#E95420" />
          <circle cx="64" cy="64" r="32" fill="none" stroke="#FFF" strokeWidth="8" />
          <circle cx="28" cy="64" r="9" fill="#FFF" />
          <circle cx="82" cy="33" r="9" fill="#FFF" />
          <circle cx="82" cy="95" r="9" fill="#FFF" />
        </svg>
      );
    case 'github':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M64 4C30.9 4 4 30.9 4 64c0 26.5 17.2 49 41 56.9 3 .6 4.1-1.3 4.1-2.9v-10.2c-16.7 3.6-20.2-8.1-20.2-8.1-2.7-6.9-6.7-8.7-6.7-8.7-5.5-3.7.4-3.7.4-3.7 6 .4 9.2 6.2 9.2 6.2 5.4 9.2 14.1 6.5 17.5 5 0.5-3.9 2.1-6.5 3.8-8-13.3-1.5-27.3-6.7-27.3-29.7 0-6.6 2.3-11.9 6.2-16.1-.6-1.5-2.7-7.6.6-15.9 0 0 5-1.6 16.5 6.1 4.8-1.3 9.9-2 15-2s10.2.7 15 2c11.4-7.7 16.4-6.1 16.4-6.1 3.3 8.3 1.2 14.4.6 15.9 3.9 4.2 6.2 9.5 6.2 16.1 0 23.1-14 28.1-27.4 29.6 2.2 1.9 4.1 5.6 4.1 11.2v16.7c0 1.6 1.1 3.5 4.1 2.9 23.8-7.9 41-30.4 41-56.9 0-33.1-26.9-60-60-60z" />
        </svg>
      );
    case 'postman':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="60" fill="#FF6C37" />
          <path fill="#FFF" d="M84 48c0 2-2 4-5 4H49c-3 0-5-2-5-4s2-4 5-4h30c3 0 5 2 5 4zm-7 14c0 2-2 4-5 4H56c-3 0-5-2-5-4s2-4 5-4h16c3 0 5 2 5 4zm-12 14c0 2-2 4-5 4h-4c-3 0-5-2-5-4s2-4 5-4h4c3 0 5 2 5 4z" />
        </svg>
      );
    case 'figma':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#F24E1E" d="M40 16h24v32H40a16 16 0 010-32z" />
          <path fill="#FF7262" d="M64 16h24a16 16 0 010 32H64V16z" />
          <path fill="#1ABCFE" d="M88 48a16 16 0 01-16 16H64V48h24z" />
          <path fill="#0ACF83" d="M40 80a16 16 0 0116-16h8v32H40a16 16 0 010-16z" />
          <path fill="#A259FF" d="M40 48h24v32H40a16 16 0 010-32z" />
        </svg>
      );
    case 'resend':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <rect width="128" height="128" rx="24" fill="#000000" />
          <text x="64" y="84" fill="#FFFFFF" fontSize="64" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">R</text>
        </svg>
      );
    case 'vscode':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <path fill="#007ACC" d="M98 12l22 10v84l-22 10L52 74l-22 18-18-8 30-20-30-20 18-8 22 18 46-42z" />
        </svg>
      );
    case 'notion':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 128 128">
          <rect width="128" height="128" rx="20" fill="#000000" />
          <text x="64" y="88" fill="#FFFFFF" fontSize="72" fontWeight="bold" textAnchor="middle" fontFamily="serif">N</text>
        </svg>
      );
    default:
      return (
        <div className={`flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs ${className}`}>
          {name.slice(0, 2).toUpperCase()}
        </div>
      );
  }
};
