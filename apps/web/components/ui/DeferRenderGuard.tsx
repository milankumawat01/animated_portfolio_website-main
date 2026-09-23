'use client'
import { useEffect } from 'react'

// `.defer-render` sections use estimated heights until they near the viewport,
// which throws smooth anchor scrolling off by thousands of pixels on mobile.
// The first time the page is asked to jump to a section, render everything for
// real (one layout, on user intent) and let the browser scroll to the target.
export function DeferRenderGuard() {
  useEffect(() => {
    const root = document.documentElement
    const renderAll = () => root.classList.add('render-all')

    // Arrived with a fragment (/#writing from a sub-page): lay out, then re-aim.
    if (window.location.hash.length > 1) {
      renderAll()
      document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView()
    }

    // Capture phase runs before the browser's default fragment scroll.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null
      if (link && link.pathname === window.location.pathname && link.hash.length > 1) renderAll()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
