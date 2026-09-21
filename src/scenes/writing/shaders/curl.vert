// 07 — WRITING · the paper curl.
//
// The difference between paper and cloth is CURVATURE COUNT. Cloth carries several
// wavelengths across its width and they travel; a sheet of paper carries exactly
// one, it barely moves, and the sheet's stiffness means the bend is almost constant
// along the fold line. So: one shallow cosine hump across X, whose curvature
// breathes and whose axis slides a little, modulated along Y by ONE octave of
// very-low-frequency noise, plus a single lifted corner. Nothing here has a
// wavelength shorter than the sheet itself. That is the whole trick.
//
// Amplitude is deliberately small — peak displacement is under 8% of the sheet
// width. Anything larger and the silhouette starts to ripple.
//
// VERTEX_PRELUDE is prepended in Sheet.tsx: it carries `snoise` and is
// derivative-free, which matters because anything calling `fwidth` in a vertex
// stage fails to link silently and the sheet simply never draws.
//
// `USE_INSTANCING` is defined by three.js itself whenever the material is bound to
// an InstancedMesh, so one source serves both the four featured sheets (uniforms)
// and the blank field (instance attributes).

#include <common>
#include <fog_pars_vertex>

uniform float uTime;
/** 0 = perfectly flat (low tier, reduced motion), 1 = full curl. */
uniform float uCurl;
/** the sheet's untransformed size in object units — needed for the normal. */
uniform vec2 uSize;
/** single-sheet phase + seed; ignored when instanced. */
uniform float uPhase;
uniform float uSeed;

#ifdef USE_INSTANCING
attribute float aPhase;
attribute float aSeed;
attribute float aAmp;
#endif

varying vec2 vUv;
varying vec3 vNormalView;
varying vec3 vViewDir;
varying float vSeed;

/**
 * Out-of-plane displacement, in object units. Called four times per vertex (once
 * for the position and three times for the finite-difference normal), so it is
 * kept to one noise lookup.
 */
float paperZ(vec2 quv, float phase, float seed, float amp) {
  float x = quv.x - 0.5;
  float y = quv.y - 0.5;
  float t = uTime * 0.42 + phase;

  // The fold. cos over +/-1.3 rad is well under a full period, so the sheet is a
  // shallow dome with a single line of curvature. The slide moves the crest across
  // the sheet instead of pumping it in place, which is what a page in still air does.
  float slide = 0.40 * sin(t * 0.61);
  float arc = cos(x * 2.6 + slide) - 0.74;

  // Stiffness varies along the fold line, so the top of the sheet is bent a little
  // more than the bottom. One octave, wavelength longer than the sheet.
  float ny = snoise(vec3(y * 1.25, seed * 4.7, t * 0.30));
  arc *= 1.0 + 0.55 * ny;

  // One corner lifts. This is the single strongest "it is paper" cue.
  float corner = x * y * 3.1 * sin(t * 0.47 + phase * 1.7);

  return (arc * 0.34 + corner * 0.055) * amp;
}

void main() {
  float phase = uPhase;
  float seed = uSeed;
  float amp = uCurl;

#ifdef USE_INSTANCING
  phase = aPhase;
  seed = aSeed;
  amp = uCurl * aAmp;
#endif

  vUv = uv;
  vSeed = seed;

  // Analytic-enough normal: two forward differences of the displacement field,
  // scaled back into object units by the sheet's size.
  float e = 0.035;
  float z0 = paperZ(uv, phase, seed, amp);
  float zx = paperZ(uv + vec2(e, 0.0), phase, seed, amp);
  float zy = paperZ(uv + vec2(0.0, e), phase, seed, amp);

  vec3 displaced = position + vec3(0.0, 0.0, z0);
  vec3 tx = vec3(uSize.x * e, 0.0, zx - z0);
  vec3 ty = vec3(0.0, uSize.y * e, zy - z0);
  vec3 nrm = normalize(cross(tx, ty));

#ifdef USE_INSTANCING
  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(displaced, 1.0);
  // Instance scale is uniform by construction, so the rotation block is enough.
  vNormalView = normalize(normalMatrix * (mat3(instanceMatrix) * nrm));
#else
  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  vNormalView = normalize(normalMatrix * nrm);
#endif

  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;

  #include <fog_vertex>
}
