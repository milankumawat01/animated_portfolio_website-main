// How I Build — the blueprint floor.
//
// One plane, one draw call, two triangles, no texture. `aaGrid` comes from
// FRAGMENT_PRELUDE (prepended in BlueprintGrid.tsx) and is the derivative-based
// grid the design system already standardised on.
//
// THE MOIRÉ PROBLEM. A thresholded `fract` grid on a floor seen at a grazing angle
// packs many cells into one pixel; anti-aliasing alone does not save it, it just
// turns the aliasing into a solid wash. So each layer is faded out once its cell
// size drops below a couple of pixels — `fwidth` tells us exactly when — and the
// major lines, which are five times coarser, survive longer and carry the far
// field on their own. Past that a radial fade takes the plane to nothing so its
// edge is never a visible seam.

#include <common>
#include <fog_pars_fragment>

uniform vec3 uMinorColor;
uniform vec3 uMajorColor;
uniform float uMinorFreq;
uniform float uMajorFreq;
uniform float uMinorAlpha;
uniform float uMajorAlpha;
uniform float uFadeNear;
uniform float uFadeFar;
uniform float uFade;

/** plane-local coordinates in world units, centred on the plane */
varying vec2 vGrid;

/**
 * One grid layer, anti-aliased and then retired once it can no longer be resolved.
 * Returns 0..1 coverage.
 */
float gridLayer(vec2 p, float frequency, float thickness) {
  // aaGrid puts its lines on half-cells; shift by half a cell so the drawing's
  // lines land on whole world units and the datum lines sit exactly on the axes.
  float line = aaGrid(p + 0.5 / frequency, frequency, thickness);
  vec2 w = fwidth(p * frequency);
  float density = max(w.x, w.y);
  return line * (1.0 - smoothstep(0.22, 0.75, density));
}

void main() {
  float minorLine = gridLayer(vGrid, uMinorFreq, 1.0);
  float majorLine = gridLayer(vGrid, uMajorFreq, 1.15);

  // The two axes through the origin are the drawing's datum lines.
  vec2 axisW = fwidth(vGrid) * 1.6;
  float axis = max(
    1.0 - smoothstep(0.0, axisW.x, abs(vGrid.x)),
    1.0 - smoothstep(0.0, axisW.y, abs(vGrid.y))
  );
  axis *= 1.0 - smoothstep(0.22, 0.75, max(axisW.x, axisW.y));

  float alpha = minorLine * uMinorAlpha;
  vec3 col = uMinorColor;

  // Major lines win where they overlap a minor one.
  float major = max(majorLine, axis * 0.85);
  col = mix(col, uMajorColor, major);
  alpha = max(alpha, major * uMajorAlpha);

  alpha *= 1.0 - smoothstep(uFadeNear, uFadeFar, length(vGrid));
  alpha *= uFade;

  if (alpha < 0.002) discard;

  gl_FragColor = vec4(col, alpha);

  #include <fog_fragment>
}
