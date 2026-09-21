'use client'

import { useEffect } from 'react'
import { useInteraction } from '@/store/useInteraction'
import { profile } from '@/data/profile'

/**
 * The two easter eggs, and only these two. More would be noise.
 *
 *  1. Konami code — sets `easterEgg` for three seconds. The hero's monogram reads it
 *     and pulses the brand ramp wherever you are on the page.
 *  2. A console greeting. Every developer who visits this site will open the console;
 *     it costs nothing to leave them something.
 */

const SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

export function Konami() {
  const setEasterEgg = useInteraction((s) => s.setEasterEgg)

  useEffect(() => {
    let index = 0
    let timer = 0

    const onKey = (e: KeyboardEvent) => {
      const expected = SEQUENCE[index]
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (key === expected) {
        index++
        if (index === SEQUENCE.length) {
          index = 0
          setEasterEgg(true)
          window.clearTimeout(timer)
          timer = window.setTimeout(() => setEasterEgg(false), 3000)
        }
      } else {
        // Allow a wrong key to be the start of a fresh attempt.
        index = key === SEQUENCE[0] ? 1 : 0
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(timer)
      setEasterEgg(false)
    }
  }, [setEasterEgg])

  useEffect(() => {
    // Once per page load, not once per mount.
    const w = window as unknown as { __greeted?: boolean }
    if (w.__greeted) return
    w.__greeted = true

    console.log(
      `%c${profile.name}%c  ${profile.role}\n%c${profile.githubUrl}\n%cBuilt with Next.js, React Three Fiber and one continuous camera path.\nTry ?debug=1 for the stats HUD, or ?q=low to see the degraded tier.`,
      'font-size:20px;font-weight:800;color:#2563EB',
      'font-size:12px;color:#6B7C93',
      'font-size:12px;color:#2563EB',
      'font-size:11px;color:#8B9AAF',
    )
  }, [])

  return null
}
