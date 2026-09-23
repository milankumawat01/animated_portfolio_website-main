'use client';

import React, { useState } from 'react';
import { Mail, FileText, ArrowRight, Check } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './icons/SocialIcons';
import { useModals } from './modals/ModalProvider';
import type { SiteSettingsDoc } from '@/lib/convex';

type ContactCard = NonNullable<SiteSettingsDoc['contactCards']>[number];

const getContactIcon = (icon: string) => {
  switch (icon) {
    case 'mail':
      return <Mail className="w-5 h-5 text-blue" />;
    case 'linkedin':
      return <LinkedinIcon className="w-5 h-5 text-blue" />;
    case 'github':
      return <GithubIcon className="w-5 h-5 text-blue" />;
    case 'fileText':
      return <FileText className="w-5 h-5 text-blue" />;
    default:
      return <Mail className="w-5 h-5 text-blue" />;
  }
};

// The 2x2 contact card grid: copies the email, opens the resume, or follows a link.
export const ContactCards: React.FC<{ cards: ContactCard[]; email: string }> = ({ cards, email }) => {
  const { openResume } = useModals();
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCardClick = (card: ContactCard) => {
    if (card.id === 'email') {
      navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } else if (card.id === 'resume') {
      openResume();
    } else {
      window.open(card.action, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => handleCardClick(card)}
          className="p-4 sm:p-5 rounded-2xl bg-surface-elevated border border-border shadow-soft hover:shadow-card hover:border-blue/30 transition-all duration-300 flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
              {getContactIcon(card.icon)}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-text-primary group-hover:text-blue transition-colors">
                {card.title}
              </h4>
              <p className="text-xs text-text-secondary font-medium truncate mt-0.5">
                {card.value}
              </p>
              <p className="text-[11px] text-text-muted truncate">
                {card.id === 'email' && copiedEmail ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Copied to clipboard!
                  </span>
                ) : (
                  card.hint
                )}
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted group-hover:text-blue group-hover:bg-blue-50 transition-colors shrink-0 ml-2">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      ))}
    </div>
  );
};
