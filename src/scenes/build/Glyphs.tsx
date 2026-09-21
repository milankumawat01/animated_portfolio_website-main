'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Color,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  PlaneGeometry,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
} from 'three'
import type { QualityTier } from '@/engine/types'
import { FRAGMENT_PRELUDE, VERTEX_PRELUDE, glsl } from '@/lib/shader'
import { hash11, saturate, smoothstep } from '@/lib/math'
import {
  BRAND,
  NODE_COUNT,
  livePipelineProgress,
  nodeActivation,
  nodeCenter,
  nodeReveal,
} from './NodeFrame'

/**
 * 06 — HOW I BUILD · the orbiting glyphs.
 *
 * Five small marks around each node — 25 quads, ONE InstancedMesh, one draw call,
 * fifty triangles. They exist to keep the diagram from reading as a dead drawing:
 * something is always in motion even when the scroll is parked.
 *
 * The orbit happens entirely in the vertex shader. `instanceMatrix` only ever holds
 * the node's translation; the offset around it is a Rodrigues rotation of a fixed
 * per-instance base vector about a fixed per-instance axis, so the CPU writes no
 * matrices per frame and the whole animation is one `uTime` uniform. The quad is
 * then billboarded in view space, which is the only way a 0.3-unit mark stays
 * legible while the camera dollies 28 units sideways past it.
 *
 * Off entirely at the low tier and under reduced motion — the phase's tier table
 * says so, and a static orbiting particle is worse than no orbiting particle.
 */

const GLYPHS_PER_NODE = 5
const ORBIT_MIN = 2.0
const ORBIT_MAX = 3.1
const GLYPH_SIZE = 0.3

const GLYPH_VERT = glsl`
#include <common>
#include <fog_pars_vertex>

attribute vec3 aBase;
attribute vec3 aAxis;
attribute float aPhase;
attribute float aSpeed;
attribute float aNode;
attribute float aGlyph;
attribute float aSize;

uniform float uTime;
uniform float uReveal[5];
uniform float uActive[5];

varying float vGlyph;
varying float vActive;
varying float vAlpha;
varying vec2 vUv;

vec3 rotateAbout(vec3 v, vec3 axis, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
}

void main() {
  float reveal = 0.0;
  float heat = 0.0;
  for (int i = 0; i < 5; i++) {
    if (i == int(aNode + 0.5)) {
      reveal = uReveal[i];
      heat = uActive[i];
    }
  }

  vGlyph = aGlyph;
  vActive = heat;
  vAlpha = smoothstep(0.55, 1.0, reveal);
  vUv = uv;

  vec3 offset = rotateAbout(aBase, normalize(aAxis), uTime * aSpeed + aPhase);
  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(offset, 1.0);
  // Billboard: the quad is expanded in view space, so it always faces the camera.
  mvPosition.xy += position.xy * aSize * mix(0.4, 1.0, vAlpha);

  gl_Position = projectionMatrix * mvPosition;

  #include <fog_vertex>
}
`

const GLYPH_FRAG = glsl`
#include <common>
#include <fog_pars_fragment>

uniform vec3 uIdle;
uniform vec3 uLive;
uniform float uFade;

varying float vGlyph;
varying float vActive;
varying float vAlpha;
varying vec2 vUv;

/** Five drawn marks, picked per instance. Outlines, so they read as annotation. */
float mark(vec2 p, float id) {
  float d;
  if (id < 0.5) {
    d = abs(length(p) - 0.32);
  } else if (id < 1.5) {
    d = min(
      max(abs(p.x) - 0.03, abs(p.y) - 0.34),
      max(abs(p.y) - 0.03, abs(p.x) - 0.34)
    );
  } else if (id < 2.5) {
    vec2 q = abs(p) - vec2(0.29);
    d = abs(max(q.x, q.y));
  } else if (id < 3.5) {
    d = abs(abs(p.x) + abs(p.y) - 0.34);
  } else {
    d = length(p) - 0.15;
  }
  return 1.0 - smoothstep(0.0, fwidth(d) * 1.8 + 0.012, d);
}

void main() {
  vec2 p = vUv - 0.5;
  float shape = mark(p, vGlyph);
  if (shape < 0.01) discard;

  vec3 col = mix(uIdle, uLive, clamp(vActive, 0.0, 1.0));
  col = mix(col, vec3(1.0), clamp(vActive - 1.0, 0.0, 1.0) * 0.6);

  gl_FragColor = vec4(col, shape * vAlpha * uFade * 0.85);

  #include <fog_fragment>
}
`

const IDLE = new Color('#7A93B5')
const tmpMatrix = new Matrix4()

export interface GlyphsProps {
  quality: QualityTier
  progress: number
}

export function Glyphs({ quality, progress }: GlyphsProps) {
  const count = NODE_COUNT * GLYPHS_PER_NODE

  const built = useMemo(() => {
    const geometry = new PlaneGeometry(1, 1)

    const base = new Float32Array(count * 3)
    const axis = new Float32Array(count * 3)
    const phase = new Float32Array(count)
    const speed = new Float32Array(count)
    const node = new Float32Array(count)
    const glyph = new Float32Array(count)
    const size = new Float32Array(count)

    for (let n = 0; n < NODE_COUNT; n++) {
      for (let g = 0; g < GLYPHS_PER_NODE; g++) {
        const i = n * GLYPHS_PER_NODE + g
        const seed = i * 3.77 + 1.3

        // A tilted orbit axis per glyph, and a base vector made perpendicular to it
        // so the orbit is a clean circle rather than a wobbling ellipse.
        const ax = hash11(seed) * 2 - 1
        const ay = 0.55 + hash11(seed + 11) * 0.8
        const az = hash11(seed + 23) * 2 - 1
        const alen = Math.hypot(ax, ay, az) || 1
        const nx = ax / alen
        const ny = ay / alen
        const nz = az / alen

        // Gram–Schmidt a world-X reference against the axis.
        let bx = 1
        let by = 0
        let bz = 0
        const dot = nx
        bx -= dot * nx
        by -= dot * ny
        bz -= dot * nz
        let blen = Math.hypot(bx, by, bz)
        if (blen < 1e-3) {
          bx = 0
          by = 0
          bz = 1
          blen = 1
        }
        const radius = ORBIT_MIN + hash11(seed + 41) * (ORBIT_MAX - ORBIT_MIN)

        base[i * 3] = (bx / blen) * radius
        base[i * 3 + 1] = (by / blen) * radius
        base[i * 3 + 2] = (bz / blen) * radius
        axis[i * 3] = nx
        axis[i * 3 + 1] = ny
        axis[i * 3 + 2] = nz
        phase[i] = hash11(seed + 59) * Math.PI * 2
        speed[i] = 0.24 + hash11(seed + 71) * 0.3
        node[i] = n
        glyph[i] = g % 5
        size[i] = GLYPH_SIZE * (0.8 + hash11(seed + 83) * 0.5)
      }
    }

    geometry.setAttribute('aBase', new InstancedBufferAttribute(base, 3))
    geometry.setAttribute('aAxis', new InstancedBufferAttribute(axis, 3))
    geometry.setAttribute('aPhase', new InstancedBufferAttribute(phase, 1))
    geometry.setAttribute('aSpeed', new InstancedBufferAttribute(speed, 1))
    geometry.setAttribute('aNode', new InstancedBufferAttribute(node, 1))
    geometry.setAttribute('aGlyph', new InstancedBufferAttribute(glyph, 1))
    geometry.setAttribute('aSize', new InstancedBufferAttribute(size, 1))

    const material = new ShaderMaterial({
      vertexShader: `${VERTEX_PRELUDE}\n${GLYPH_VERT}`,
      fragmentShader: `${FRAGMENT_PRELUDE}\n${GLYPH_FRAG}`,
      uniforms: {
        ...UniformsUtils.clone(UniformsLib.fog),
        uTime: { value: 0 },
        uFade: { value: 0 },
        uIdle: { value: IDLE },
        uLive: { value: BRAND },
        uReveal: { value: new Array<number>(NODE_COUNT).fill(0) },
        uActive: { value: new Array<number>(NODE_COUNT).fill(0) },
      },
      fog: true,
      transparent: true,
      depthWrite: false,
    })

    return { geometry, material }
  }, [count])

  useEffect(
    () => () => {
      built.geometry.dispose()
      built.material.dispose()
    },
    [built],
  )

  const mesh = useRef<InstancedMesh>(null)

  useEffect(() => {
    const m = mesh.current
    if (!m) return
    for (let n = 0; n < NODE_COUNT; n++) {
      const [x, y, z] = nodeCenter(n)
      tmpMatrix.makeTranslation(x, y, z)
      for (let g = 0; g < GLYPHS_PER_NODE; g++) {
        m.setMatrixAt(n * GLYPHS_PER_NODE + g, tmpMatrix)
      }
    }
    m.instanceMatrix.needsUpdate = true
  }, [built])

  const clock = useRef(0)
  const fade = useRef(0)

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1)
    const u = built.material.uniforms
    const p = livePipelineProgress(progress)

    clock.current += dt
    u.uTime.value = clock.current

    const reveal = u.uReveal.value as number[]
    const active = u.uActive.value as number[]
    for (let i = 0; i < NODE_COUNT; i++) {
      reveal[i] = nodeReveal(i, p)
      active[i] = nodeActivation(i, p)
    }

    const target = saturate(smoothstep(0.02, 0.1, p))
    fade.current += (target - fade.current) * (1 - Math.exp(-9 * dt))
    u.uFade.value = fade.current
  })

  if (quality === 'low') return null

  return (
    <instancedMesh
      ref={mesh}
      name="build-glyphs"
      args={[built.geometry, built.material, count]}
      frustumCulled={false}
    />
  )
}
