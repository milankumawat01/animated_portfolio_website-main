'use client'

import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { scenes } from '@/scenes'
import { scrollState } from '@/store/useScroll'
import { useQuality } from '@/store/useQuality'
import { isDebug } from './quality'

/**
 * `?debug=1`. Every later phase self-verifies its budget from this, so the numbers
 * have to be honest: they are read straight off `gl.info.render` after the frame.
 */

export const frameStats = {
  fps: 0,
  frameMs: 0,
  drawCalls: 0,
  triangles: 0,
  programs: 0,
  textures: 0,
  geometries: 0,
}

/** Lives inside the Canvas and samples the renderer. Rendered by `Experience`. */
export function StatsCollector() {
  const gl = useThree((s) => s.gl)
  const acc = useRef({ frames: 0, elapsed: 0, last: performance.now() })

  useFrame(() => {
    const now = performance.now()
    const a = acc.current
    a.elapsed += now - a.last
    a.last = now
    a.frames++

    if (a.elapsed >= 250) {
      frameStats.fps = Math.round((a.frames / a.elapsed) * 1000)
      frameStats.frameMs = Math.round((a.elapsed / a.frames) * 100) / 100
      a.frames = 0
      a.elapsed = 0
    }

    const info = gl.info
    frameStats.drawCalls = info.render.calls
    frameStats.triangles = info.render.triangles
    frameStats.programs = info.programs?.length ?? 0
    frameStats.textures = info.memory.textures
    frameStats.geometries = info.memory.geometries
    // No renderPriority: a non-zero priority switches R3F to manual rendering and
    // nothing would ever be drawn. These numbers describe the previous frame.
  })

  return null
}

const fmt = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k` : String(n)

export function DebugHUD() {
  const [on, setOn] = useState(false)
  const [, force] = useState(0)
  const tier = useQuality((s) => s.tier)
  const renderer = useQuality((s) => s.renderer)
  const dpr = useQuality((s) => s.dpr)
  const reducedMotion = useQuality((s) => s.reducedMotion)

  useEffect(() => setOn(isDebug()), [])

  useEffect(() => {
    if (!on) return
    const id = window.setInterval(() => force((n) => n + 1), 200)
    return () => window.clearInterval(id)
  }, [on])

  if (!on) return null

  const station = scenes.find((s) => s.id === scrollState.activeStation)
  const overDraw = station ? frameStats.drawCalls > station.budget.drawCalls : false
  const overTris = station ? frameStats.triangles > station.budget.triangles : false
  const bad = '#FF6B6B'
  const ok = '#8BE9A0'

  const Row = ({
    label,
    value,
    warn = false,
  }: {
    label: string
    value: string
    warn?: boolean
  }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
      <span style={{ opacity: 0.55 }}>{label}</span>
      <span style={{ color: warn ? bad : 'inherit', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  )

  return (
    <div
      aria-hidden
      data-debug-hud=""
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        zIndex: 9999,
        width: 248,
        padding: '10px 12px',
        borderRadius: 10,
        background: 'rgba(5, 8, 14, 0.86)',
        color: '#E8EEF7',
        font: '11px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
        pointerEvents: 'none',
        letterSpacing: '0.01em',
      }}
    >
      <Row
        label="fps"
        value={`${frameStats.fps}  ${frameStats.frameMs}ms`}
        warn={frameStats.fps > 0 && frameStats.fps < 50}
      />
      <Row
        label="draw calls"
        value={`${frameStats.drawCalls} / ${station?.budget.drawCalls ?? '—'}`}
        warn={overDraw}
      />
      <Row
        label="triangles"
        value={`${fmt(frameStats.triangles)} / ${fmt(station?.budget.triangles ?? 0)}`}
        warn={overTris}
      />
      <Row label="programs" value={String(frameStats.programs)} />
      <Row label="textures" value={String(frameStats.textures)} />
      <Row label="geometries" value={String(frameStats.geometries)} />
      <div
        style={{
          height: 1,
          background: 'rgba(255,255,255,0.12)',
          margin: '7px 0',
        }}
      />
      <Row label="station" value={scrollState.activeStation} />
      <Row label="local p" value={scrollState.localProgress.toFixed(3)} />
      <Row label="page p" value={scrollState.progress.toFixed(4)} />
      <Row label="velocity" value={scrollState.velocity.toFixed(3)} />
      <div
        style={{
          height: 1,
          background: 'rgba(255,255,255,0.12)',
          margin: '7px 0',
        }}
      />
      <Row label="tier" value={tier} />
      <Row label="dpr" value={dpr.toFixed(2)} />
      <Row label="reduced motion" value={reducedMotion ? 'yes' : 'no'} />
      <div
        style={{
          marginTop: 6,
          color: overDraw || overTris ? bad : ok,
          fontWeight: 600,
        }}
      >
        {overDraw || overTris ? 'OVER BUDGET' : 'within budget'}
      </div>
      {renderer ? (
        <div style={{ marginTop: 6, opacity: 0.4, fontSize: 10, lineHeight: 1.35 }}>
          {renderer.slice(0, 64)}
        </div>
      ) : null}
    </div>
  )
}
