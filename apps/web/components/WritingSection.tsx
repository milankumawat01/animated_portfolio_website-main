import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Handwriting } from './ui/Handwriting';
import { ScrollButtons } from './ui/ScrollButtons';
import type { PostDoc, SiteSettingsDoc } from '@/lib/convex';
import { formatLegacyDate } from '@/lib/convex';

interface WritingSectionProps {
  posts: PostDoc[];
  settings: SiteSettingsDoc | null;
}

export const WritingSection: React.FC<WritingSectionProps> = ({ posts, settings }) => {
  const quoteWriting = settings?.quotes?.writing ?? '';

  return (
    <section id="writing" className="defer-render py-20 sm:py-28 lg:py-32 bg-bg-soft relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-7 md:px-10 lg:px-12 xl:px-16 space-y-12">
        {/* Top Header & Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-xl space-y-3.5">
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-label uppercase">
              <span className="w-6 h-[2px] bg-blue rounded-full inline-block" />
              <span className="text-blue">07</span>
              <span className="text-text-muted">WRITING &amp; INSIGHTS</span>
            </div>

            {/* Exact Title from reference */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-black tracking-heading leading-[1.12] pt-1 pb-1 text-text-primary">
              Things I&apos;m building,<br />learning and <span className="text-blue">thinking about.</span>
            </h2>

            {/* Subtitle */}
            <p className="text-base sm:text-lg max-w-2xl leading-[1.6] text-text-secondary">
              A collection of my technical notes, project learnings, experiments and ideas around AI, backend systems and product development.
            </p>
          </div>

          {/* Center-Top Doodle */}
          <div className="hidden lg:flex justify-center pb-2">
            <Handwriting
              text={"Better\nIdeas\nThrough\nWriting."}
              color="slate"
              size="md"
              rotation="-3"
              underline
            />
          </div>

          {/* Right Column with note, view all articles and controls */}
          <div className="flex flex-col items-start lg:items-end space-y-4 lg:self-end">
            <p className="text-xs sm:text-[13px] text-text-secondary max-w-xs text-left lg:text-right leading-relaxed">
              Writing helps me think clearly, learn deeper and share what I build along the way.
            </p>

            <div className="flex items-center gap-3">
              <Link
                href="/blog"
                className="px-4 py-2 rounded-full bg-blue-50 text-blue hover:bg-blue-100 transition-colors text-xs font-bold flex items-center gap-1.5"
              >
                <span>View all articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-2 pl-2">
                <ScrollButtons targetId="writing-row" prevLabel="Scroll articles left" nextLabel="Scroll articles right" />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Article Cards Grid */}
        <div
          id="writing-row"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar"
        >
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bg-surface-elevated rounded-2xl border border-border overflow-hidden shadow-soft hover:shadow-card hover:border-blue/30 transition-all duration-300 flex flex-col justify-between group snap-start"
            >
              {/* Image */}
              <div className="relative w-full h-44 bg-surface-well overflow-hidden border-b border-border/60">
                {post.imageUrl && (
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill sizes="(max-width: 639px) 85vw, (max-width: 1023px) 45vw, 360px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {/* Category + Date */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue">
                      {post.tags?.[0] ?? ''}
                    </span>
                    <span className="font-medium text-text-muted">
                      {post.publishedAt ? formatLegacyDate(post.publishedAt) : ''}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-text-primary leading-snug group-hover:text-blue transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                {/* Read Article Link */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-blue group-hover:text-blue-dark transition-colors">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Quote matching reference */}
        <div className="pt-8 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl font-serif text-blue select-none leading-none -mt-1">
              &ldquo;
            </span>
            <div className="w-[1px] h-6 bg-border hidden sm:block" />
            <p className="text-sm sm:text-base font-medium italic text-text-primary">
              {quoteWriting}
            </p>
          </div>

          <p className="text-xs font-bold text-text-muted">
            — Milan Kumawat
          </p>
        </div>
      </div>
    </section>
  );
};
