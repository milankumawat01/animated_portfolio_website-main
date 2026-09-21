// 04 EXPERIENCE — the ground plane the helix rises from.
//
// Two triangles and no texture. Its whole job is to give the ascent something to
// leave behind: while the camera is low the grid fills the bottom of the frame,
// and it has slid under the lip of the view well before the first year marker.
// That departure is half the reason the climb reads.
//
// THE RADIAL FALLOFF IS COMPUTED HERE, NOT IN THE VERTEX STAGE. A quad has four
// vertices and all four of them are corners, so a per-vertex `length(uv - 0.5)`
// is 0.707 at every one — the falloff interpolated to zero across the whole
// plane and the grid rendered perfectly, and invisibly, for three probe runs.
//
// Prepend FRAGMENT_PRELUDE: `aaGrid` calls `fwidth`, so this can only ever be a
// fragment shader.

#include <common>
#include <fog_pars_fragment>

uniform vec3 uLine;
uniform vec3 uMajor;
uniform float uFade;
uniform float uOpacity;
uniform float uFalloffNear;
uniform float uFalloffFar;

varying vec2 vGrid;

void main() {
  // 1-unit cells with a heavier line every 10, so the plane has a readable scale
  // instead of turning into moire the moment it tilts away.
  float minor = aaGrid(vGrid, 1.0, 1.0);
  float major = aaGrid(vGrid, 0.1, 1.3);

  float falloff = 1.0 - smoothstep(uFalloffNear, uFalloffFar, length(vGrid));

  float ink = max(minor * 0.3, major * 0.7);
  float alpha = ink * falloff * uOpacity * uFade;
  if (alpha < 0.003) discard;

  vec3 col = mix(uLine, uMajor, major);
  gl_FragColor = vec4(col, alpha);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
