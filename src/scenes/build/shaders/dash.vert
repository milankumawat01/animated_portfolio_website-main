// How I Build — the conduits between pipeline nodes.
//
// All five tubes live in ONE geometry and ONE draw call. `aConduit` says which tube
// a vertex belongs to, and the per-tube draw-on amount is looked up from `uDraw`
// here rather than in the fragment stage: GLSL ES 1.0 only guarantees dynamic
// indexing of uniform arrays in the vertex shader, and even that is unrolled below
// into five constant-index reads so no driver has to be clever about it.
//
// `uv.x` is TubeGeometry's along-the-tube parameter, 0 at the source node and 1 at
// the destination, which is what makes the dashes flow the right way and what the
// fragment shader clips against.
//
// VERTEX_PRELUDE is prepended in Conduit.tsx. It is derivative-free on purpose —
// anything calling fwidth here fails to link silently and nothing draws.

#include <common>
#include <fog_pars_vertex>

attribute float aConduit;
/** arc length of this conduit in world units — keeps the dash pitch constant */
attribute float aSpan;

uniform float uDraw[5];
uniform float uActive[5];

varying float vU;
varying float vSpan;
varying float vDraw;
varying float vActive;
varying float vPhaseSeed;
varying float vFacing;

void main() {
  vU = uv.x;
  vSpan = aSpan;

  float draw = 0.0;
  float heat = 0.0;
  for (int i = 0; i < 5; i++) {
    if (i == int(aConduit + 0.5)) {
      draw = uDraw[i];
      heat = uActive[i];
    }
  }
  vDraw = draw;
  vActive = heat;
  // A little per-conduit phase offset so the five dash trains do not march in lockstep.
  vPhaseSeed = hash11(aConduit * 7.13 + 1.7);

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize(normalMatrix * normal);
  // Cheap cylindrical shade so a tube reads as a pipe and not a flat ribbon.
  vFacing = abs(dot(n, normalize(-mvPosition.xyz)));

  gl_Position = projectionMatrix * mvPosition;

  #include <fog_vertex>
}
