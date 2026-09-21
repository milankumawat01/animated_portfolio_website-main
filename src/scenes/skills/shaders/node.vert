// Skills graph nodes. One shader, two builds:
//   default  — instanced icosahedron, the sphere body of a node
//   SPRITE   — instanced billboarded quad carrying a cell of the logo atlas
//
// Scale lives here rather than in the instance matrix so the hover highlight can be
// animated by touching one float per node instead of rewriting 42 matrices a frame.

#include <common>
#include <fog_pars_vertex>

attribute float aRadius;
attribute float aHighlight;
attribute vec3 aColor;

uniform float uGrow;

varying vec3 vColor;
varying float vHighlight;

#ifdef SPRITE
attribute vec2 aUvOffset;
uniform float uCell;
uniform float uSpriteScale;
uniform float uPush;
varying vec2 vUv;
#else
varying vec3 vNormalV;
#endif

void main() {
  vColor = aColor;
  vHighlight = aHighlight;

  float s = aRadius * (1.0 + uGrow * aHighlight);

#ifdef SPRITE
  vUv = aUvOffset + uv * uCell;
  // Billboard: take the instance origin into view space, then offset in screen axes.
  vec4 center = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vec4 mvPosition = center + vec4(position.xy * s * uSpriteScale, s * uPush, 0.0);
#else
  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position * s, 1.0);
  vNormalV = normalize(normalMatrix * normal);
#endif

  gl_Position = projectionMatrix * mvPosition;

  #include <fog_vertex>
}
