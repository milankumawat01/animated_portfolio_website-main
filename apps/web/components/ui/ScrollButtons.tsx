'use client'
import React from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

// Prev/next arrows for a horizontally scrolling card row, found by element id.
export function ScrollButtons({
  targetId,
  prevLabel,
  nextLabel,
}: {
  targetId: string
  prevLabel: string
  nextLabel: string
}) {
  const handleScroll = (direction: 'left' | 'right') => {
    const el = document.getElementById(targetId)
    if (!el) return
    const scrollAmount = el.clientWidth * 0.75
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <>
      <button
        onClick={() => handleScroll('left')}
        className="w-10 h-10 rounded-full bg-surface-elevated border border-border hover:bg-bg-soft flex items-center justify-center text-text-primary transition shadow-xs active:scale-95"
        aria-label={prevLabel}
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleScroll('right')}
        className="w-10 h-10 rounded-full bg-blue hover:bg-blue-dark flex items-center justify-center text-text-on-dark transition shadow-sm active:scale-95"
        aria-label={nextLabel}
      >
        <ArrowRight className="w-4 h-4" />
      </button>
    </>
  )
}
