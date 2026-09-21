'use client'

import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { scenes } from '@/scenes'
import { mountedStations } from './SceneDirector'
import { scrollState } from '@/store/useScroll'
import { useQuality } from '@/store/useQuality'
import { isDebug } from './quality'

/**
 * `?debug=1`. Every later phase self-verifies its budget from this, so the numbers
 * have to be honest — see the note on `StatsCollector` for what that took.
 */

export const frameStats = {
  fps: 0,
  frameMs: 0,
  /** draw calls for the station geometry itself — what the manifest budgets mean */
  drawCalls: 0,
  triangles: 0,
  /** how many render passes ran this frame; 1 with post FX off, more with it on */
  passes: 0,
  programs: 0,
  textures: 0,
  geometries: 0,
}

/**
 * Lives inside the Canvas and samples the renderer. Rendered by `Experience`.
 *
 * Reading `gl.info.render` straight from a useFrame gives the wrong answer as soon as
 * post-processing is on. `info.autoReset` clears the counters at the top of every
 * `render()` call, and EffectComposer's last pass is a single fullscreen triangle — so
 * the numbers you read next frame are that pass, not the scene. The HUD showed
 * "1 draw call / 1 triangle" on every station.
 *
 * So we wrap `gl.render` and snapshot the counters immediately after the call that
 * drew the *root scene*. That is the station's real cost, with or without post,
 * which is what the manifest budgets are about.
 */
export function StatsCollector() {
  const gl = useThree((s) => s.gl)
  const rootScene = useThree((s) => s.scene)
  const acc = useRef({ frames: 0, elapsed: 0, last: performance.now() })
  const captured = useRef({ calls: 0, triangles: 0, passes: 0 })

  useEffect(() => {
    if (isDebug()) {
      // Live counters for the test harness — see the note in useScroll.
      ;(window as unknown as { __frameStats: typeof frameStats }).__frameStats = frameStats
    }
  }, [])

  useEffect(() => {
    const original = gl.render.bind(gl)
    const patched: typeof gl.render = (scene, camera) => {
      original(scene, camera)
      captured.current.passes++
      if (scene === rootScene) {
        captured.current.calls = gl.info.render.calls
        captured.current.triangles = gl.info.render.triangles
      }
    }
    gl.render = patched
    return () => {
      gl.render = original
    }
  }, [gl, rootScene])

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

    // These describe the previous frame — useFrame runs before the render.
    frameStats.drawCalls = captured.current.calls
    frameStats.triangles = captured.current.triangles
    frameStats.passes = captured.current.passes
    captured.current.passes = 0

    const info = gl.info
    frameStats.programs = info.programs?.length ?? 0
    frameStats.textures = info.memory.textures
    frameStats.geometries = info.memory.geometries
    // No renderPriority: a non-zero priority switches R3F to manual rendering and
    // nothing would ever be drawn.
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

  /**
   * Compare against the sum of every MOUNTED station's budget, not just the active
   * one. `mountPadding` keeps a neighbour alive across every boundary, so the
   * renderer's totals are almost never one station's cost alone — judging them
   * against a single budget flagged About as over budget purely because Projects
   * was warming up beside it.
   */
  const mounted = scenes.filter((s) => mountedStations.includes(s.id))
  const budget = (mounted.length ? mounted : station ? [station] : []).reduce(
    (acc, s) => ({
      drawCalls: acc.drawCalls + s.budget.drawCalls,
      triangles: acc.triangles + s.budget.triangles,
    }),
    { drawCalls: 0, triangles: 0 },
  )
  const overDraw = budget.drawCalls > 0 && frameStats.drawCalls > budget.drawCalls
  const overTris = budget.triangles > 0 && frameStats.triangles > budget.triangles
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
        value={`${frameStats.drawCalls} / ${budget.drawCalls}`}
        warn={overDraw}
      />
      <Row
        label="triangles"
        value={`${fmt(frameStats.triangles)} / ${fmt(budget.triangles)}`}
        warn={overTris}
      />
      <Row label="mounted" value={mounted.map((m) => m.id).join('+') || '—'} />
      <Row label="render passes" value={String(frameStats.passes)} />
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
