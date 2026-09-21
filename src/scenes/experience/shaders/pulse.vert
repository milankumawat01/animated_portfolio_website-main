// 04 EXPERIENCE — the helix of light.
//
// One vertex shader for both passes of the tube: the thin solid core and the wide
// additive sheath that gives bloom something to grab. The only thing it computes is
// the view-space normal, which the fragment stage turns into a fake cylindrical
// key so the station needs no lights of its own.
//
// Prepend VERTEX_PRELUDE, never FRAGMENT_PRELUDE: the latter carries `aaLine` and
// `aaGrid`, both of which call `fwidth`, which does not exist in a GLSL ES 1.0
// vertex stage. The program then fails to link SILENTLY and nothing draws.

#include <common>
#include <fog_pars_vertex>

varying vec2 vTubeUv;
varying vec3 vNormalV;

void main() {
  // TubeGeometry lays uv.x along the path (0 at the foot, 1 at the crown) and
  // uv.y around the cross-section. Everything downstream is driven by uv.x.
  vTubeUv = uv;
  vNormalV = normalize(normalMatrix * normal);

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  #include <fog_vertex>
}
