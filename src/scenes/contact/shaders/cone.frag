/**
 * THE LAMP CONE — 08 Contact's whole mood, in forty-eight triangles.
 *
 * Prepend `FRAGMENT_PRELUDE` (this file calls `snoise`, and the prelude is the only
 * place it lives). Never `VERTEX_PRELUDE`-only and never in a vertex stage.
 *
 * The geometry is an open `CylinderGeometry(rTip, rBase, h)` translated so the tip
 * sits at the group origin and the cone hangs downward. `uv.y` is therefore 0 at
 * the wide end on the floor and 1 at the tip inside the lamp.
 *
 * Four things stack to make a cylinder read as a volume of lit air:
 *
 *   1. The end fades — out at the tip so there is no hard ring where the shell
 *      meets the lamp, out at the floor so the shaft lands rather than stopping.
 *      These belong in the vertex stage and are here instead; see the long note in
 *      LampCone.tsx for why (written there they came back as a constant zero and
 *      the entire cone vanished).
 *   2. A density ramp down the shaft — light thins as it spreads.
 *   3. A rim term. Looking through a cylinder you see more air where the surface
 *      turns away from you, so the SILHOUETTE is the bright part, not the centre.
 *      Without this it looks like a painted cone.
 *   4. Motes, so the volume reads as air rather than glass.
 *
 * Additive, `depthWrite: false`, double-sided, fog off.
 */

/** Fraction of the shaft's length spent fading out at each end. Never animated. */
const float TIP_FADE = 0.22;
const float FLOOR_FADE = 0.5;

uniform vec3  uColor;
uniform vec3  uCore;
uniform float uOpacity;
uniform float uTime;
uniform float uDust;

varying vec2 vUv;
varying vec3 vNrm;
varying vec3 vView;

float ramp(float x) {
  float t = clamp(x, 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

void main() {
  float h = clamp(vUv.y, 0.0, 1.0);

  float fade = ramp((1.0 - h) / TIP_FADE) * ramp(h / FLOOR_FADE);

  /* Bright under the lamp, thinning toward the floor. */
  float density = mix(0.20, 1.0, pow(h, 1.2));

  /* The silhouette carries the volume. `lit` — not `active`, which is reserved in
     GLSL ES 1.00 and fails to link with a truncated, context-free error. */
  float facing = abs(dot(normalize(vNrm), normalize(vView)));
  float lit = mix(0.18, 1.0, pow(1.0 - facing, 2.0));

  /* Slow motes drifting down the shaft. Skipped entirely when uDust is 0. */
  float dust = 1.0;
  if (uDust > 0.0) {
    float n = snoise(vec3(vUv.x * 8.0, vUv.y * 3.0 - uTime * 0.045, uTime * 0.028));
    dust = 1.0 + uDust * n * 0.5;
  }

  float a = fade * density * lit * dust * uOpacity;
  if (a <= 0.0025) discard;

  /* Warmer and paler toward the bulb, cooler amber where it spreads. */
  vec3 col = mix(uColor, uCore, pow(h, 2.2) * 0.7);

  gl_FragColor = vec4(col, a);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
