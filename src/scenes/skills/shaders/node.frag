// Skills graph nodes — see node.vert for the two builds.
//
// Lighting is hand-rolled: a single key direction plus a rim term. The station adds
// no lights of its own, so the whole graph costs three draw calls and nothing else.
//
// uDim is the global "something is hovered" amount. A node in the hovered cluster
// carries vHighlight = 1 and keeps full saturation; everything else falls to 20%.

#include <common>
#include <fog_pars_fragment>

uniform float uDim;
uniform float uFade;

varying vec3 vColor;
varying float vHighlight;

#ifdef SPRITE
uniform sampler2D uAtlas;
varying vec2 vUv;
#else
varying vec3 vNormalV;
#endif

const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
const vec3 KEY = vec3(0.34, 0.70, 0.63);

vec3 desaturate(vec3 c, float amount) {
  return mix(c, vec3(dot(c, LUMA)), amount);
}

void main() {
  // 0 when nothing is hovered, 0.8 for the clusters that are not the hovered one.
  float dim = uDim * (1.0 - vHighlight) * 0.8;

#ifdef SPRITE
  vec4 tex = texture2D(uAtlas, vUv);
  if (tex.a < 0.03) discard;
  vec3 col = desaturate(tex.rgb, dim);
  gl_FragColor = vec4(col, tex.a * uFade * mix(1.0, 0.42, dim));
#else
  vec3 n = normalize(vNormalV);
  float key = clamp(dot(n, normalize(KEY)), -1.0, 1.0) * 0.5 + 0.5;
  float rim = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.5);

  vec3 col = vColor * mix(0.48, 1.12, key);
  col += vColor * rim * 0.32;
  col += vec3(0.04, 0.07, 0.13) * vHighlight;
  col = desaturate(col, dim);

  gl_FragColor = vec4(col, uFade);
#endif

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
