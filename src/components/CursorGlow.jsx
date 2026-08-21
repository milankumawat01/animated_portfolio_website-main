import { useEffect, useState } from 'react'

const supportsGlow = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Soft light that trails the pointer. Desktop + fine-pointer devices only. */
export default function CursorGlow() {
  const [enabled] = useState(supportsGlow)
  const [pos, setPos] = useState({ x: -500, y: -500 })

  useEffect(() => {
    if (!enabled) return

    let frame
    const onMove = (e) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setPos({ x: e.clientX, y: e.clientY }))
    }

    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      className="pointer-events-none fixed z-[60] h-[420px] w-[420px] rounded-full opacity-50 mix-blend-screen transition-transform duration-200 ease-out"
      style={{
        left: pos.x - 210,
        top: pos.y - 210,
        background:
          'radial-gradient(circle, rgba(236,72,153,0.16) 0%, rgba(168,85,247,0.08) 40%, transparent 70%)',
      }}
      aria-hidden="true"
    />
  )
}
