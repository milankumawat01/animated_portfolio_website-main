import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FolderGit2, PenLine, Mail } from 'lucide-react';
import { RequestedPath } from '@/components/RequestedPath';

// Next.js adds robots noindex to not-found responses itself.
export const metadata: Metadata = {
  title: 'Page not found',
};

const host = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://milankumawat.is-a.dev').host;

const links = [
  { href: '/projects', label: 'Projects', hint: 'Things I have shipped', Icon: FolderGit2 },
  { href: '/blog', label: 'Writing', hint: 'Notes on building', Icon: PenLine },
  { href: '/#contact', label: 'Contact', hint: 'Say hello', Icon: Mail },
];

// Server component with CSS-only motion (nf-rise / nf-blink in globals.css);
// the only client JS is <RequestedPath>.
export default function NotFound() {
  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-surface-feature text-text-on-dark flex items-center">
      {/* Grid + glow backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-3xl px-5 sm:px-8 py-16 text-center">
        {/* Giant 404 */}
        <p
          aria-hidden
          className="nf-rise select-none font-black leading-none tracking-hero text-[clamp(7rem,26vw,15rem)] bg-gradient-to-b from-text-on-dark to-white/10 bg-clip-text text-transparent"
        >
          4<span className="bg-gradient-to-b from-blue to-blue-600/30 bg-clip-text">0</span>4
        </p>

        <h1 className="nf-rise [animation-delay:80ms] mt-2 text-3xl sm:text-5xl font-black tracking-heading text-balance">
          This route was never <span className="text-blue">deployed.</span>
        </h1>
        <p className="nf-rise [animation-delay:140ms] mx-auto mt-4 max-w-md text-sm sm:text-base leading-relaxed text-white/60">
          The page you&apos;re after doesn&apos;t exist or has moved. Here&apos;s what the server had to say:
        </p>

        {/* Terminal readout */}
        <div className="nf-rise [animation-delay:200ms] mx-auto mt-8 max-w-xl overflow-hidden rounded-xl border border-white/10 bg-surface-well/80 text-left shadow-blue-glow backdrop-blur">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
            <span className="ml-3 font-mono-code text-[11px] text-white/40">zsh — {host}</span>
          </div>
          <pre className="font-mono-code whitespace-pre-wrap px-4 py-4 text-xs sm:text-[13px] leading-6 text-white/70">
            <span className="text-blue">~ $</span> curl -I {host}<RequestedPath />{'\n'}
            <span className="text-[#FF6B6B]">HTTP/2 404</span> Not Found{'\n'}
            <span className="text-white/40">x-hint: try one of the routes below</span>{'\n'}
            <span className="text-blue">~ $</span> <span className="nf-blink inline-block h-4 w-2 translate-y-0.5 bg-white/80" />
          </pre>
        </div>

        {/* Actions */}
        <div className="nf-rise [animation-delay:260ms] mt-10 flex flex-col items-center gap-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 rounded-full bg-text-on-dark px-7 py-3.5 text-sm sm:text-base font-bold text-surface-well shadow-lg transition-all duration-200 hover:bg-blue hover:text-text-on-dark active:scale-95"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to home
          </Link>

          <nav aria-label="Popular pages" className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            {links.map(({ href, label, hint, Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-colors duration-200 hover:border-blue-600/60 hover:bg-blue-600/10"
              >
                <Icon className="h-4 w-4 shrink-0 text-blue" />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-xs text-white/50">{hint}</span>
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </main>
  );
}
