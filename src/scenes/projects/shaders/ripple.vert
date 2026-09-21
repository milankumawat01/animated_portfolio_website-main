/**
 * Ripple displacement for the project screenshot plane behind each glass slab.
 *
 * This is a CHUNK, not a standalone program. `Slab.tsx` injects it into
 * MeshStandardMaterial's vertex shader through `onBeforeCompile` — going through the
 * built-in material rather than a raw ShaderMaterial is what keeps the plane fogged,
 * tone-mapped and colour-managed like everything else in the scene.
 *
 * Injected after `#include <common>`, which is also where `VERTEX_PRELUDE` (and so
 * `snoise()`) is prepended — VERTEX_PRELUDE, never SHADER_PRELUDE/FRAGMENT_PRELUDE:
 * those carry `fwidth`, which does not exist in a vertex stage and fails to link
 * silently. The body is applied to `transformed` right after
 * `#include <begin_vertex>`.
 *
 *   uTime   seconds, accumulated in Slab's useFrame
 *   uAmp    |scrollState.velocity|, damped, 0 when reduced motion or low tier
 *   uScale  peak displacement in world units at uAmp = 1
 */

uniform float uTime;
uniform float uAmp;
uniform float uScale;

vec3 rippleDisplace(vec3 p, vec2 uvIn) {
  vec2 c = uvIn - 0.5;

  // Hold the rim still so the image never tears away from the slab edge.
  float falloff = 1.0 - smoothstep(0.08, 0.62, length(c * vec2(1.0, 1.55)));

  float wave =
    sin(c.x * 12.0 - uTime * 3.6) * 0.55 +
    sin(c.y * 15.5 + uTime * 2.3) * 0.45;

  float grain = snoise(vec3(uvIn * 3.4, uTime * 0.7));

  float d = (wave * 0.66 + grain * 0.34) * falloff * uAmp * uScale;

  return p + vec3(0.0, 0.0, d);
}
