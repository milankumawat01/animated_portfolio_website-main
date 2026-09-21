// Skills graph edges — one LineSegments for the whole graph.
//
// aT runs 0 at the leaf end to 1 at the hub end, and aFlow carries the distance
// along the edge in world units so the dash pattern has a constant pitch whatever
// the edge length. Both are plain vertex attributes: with two vertices per segment
// the interpolation across the line is exactly what we want.

#include <common>
#include <fog_pars_vertex>

attribute vec3 aColor;
attribute float aT;
attribute float aFlow;
attribute float aHighlight;

varying vec3 vColor;
varying float vT;
varying float vFlow;
varying float vHighlight;

void main() {
  vColor = aColor;
  vT = aT;
  vFlow = aFlow;
  vHighlight = aHighlight;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  #include <fog_vertex>
}
