// How I Build — the conduits between pipeline nodes.
//
// Two things happen here. The tube is CLIPPED at vU > vDraw, so scrolling literally
// extrudes each conduit out of its source node; and what survives is drawn as a
// travelling dash train, `fract(vU * cycles - uTime)`, which always runs from the
// source node toward the destination because uv.x is authored that way.
//
// The dash pitch is derived from the tube's own arc length, so a long conduit and a
// short one carry dashes of the same physical size rather than the same count.
//
// FRAGMENT_PRELUDE is prepended in Conduit.tsx.

#include <common>
#include <fog_pars_fragment>

uniform float uTime;
/** 0 freezes the dash train — low tier and reduced motion */
uniform float uFlow;
uniform float uSpeed;
/** dashes per world unit */
uniform float uPitch;
uniform float uFade;
uniform vec3 uIdle;
uniform vec3 uLive;

varying float vU;
varying float vSpan;
varying float vDraw;
varying float vActive;
varying float vPhaseSeed;
varying float vFacing;

void main() {
  // The conduit does not exist past its draw-on head.
  if (vU > vDraw) discard;

  float cycles = max(vSpan * uPitch, 1.0);
  float phase = vU * cycles - uTime * uSpeed * uFlow + vPhaseSeed;
  float w = max(fwidth(phase), 1e-4);
  // 58% duty cycle, anti-aliased against the screen-space rate of the phase itself.
  float on = 1.0 - smoothstep(0.58 - w, 0.58 + w, fract(phase));

  float heat = clamp(vActive, 0.0, 1.0);
  vec3 col = mix(uIdle, uLive, heat);
  col = mix(col, vec3(1.0), clamp(vActive - 1.0, 0.0, 1.0) * 0.7);

  // The leading edge glows while the conduit is mid-draw, never once it is complete.
  float drawing = step(0.004, vDraw) * (1.0 - step(0.996, vDraw));
  float head = 1.0 - smoothstep(0.0, 0.05, vDraw - vU);
  col = mix(col, vec3(1.0), head * drawing * 0.6);

  // Gap segments stay faintly present so the pipe silhouette still reads.
  float alpha = (0.10 + 0.90 * on) * mix(0.62, 1.0, vFacing) * uFade;
  alpha = max(alpha, head * drawing * 0.85);

  gl_FragColor = vec4(col, alpha);

  #include <fog_fragment>
}
