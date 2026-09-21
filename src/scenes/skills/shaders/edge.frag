// Skills graph edges. A travelling dash makes energy read as flowing toward the
// hubs; uFlow is 0 at the low tier and under reduced motion, which leaves a clean
// static gradient rather than a frozen dash pattern.

#include <common>
#include <fog_pars_fragment>

uniform float uTime;
uniform float uDim;
uniform float uFade;
uniform float uFlow;
uniform float uSpeed;
uniform float uDensity;

varying vec3 vColor;
varying float vT;
varying float vFlow;
varying float vHighlight;

const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

void main() {
  float dim = uDim * (1.0 - vHighlight) * 0.85;

  // Distance along the edge, marching from the leaf toward the hub.
  float d = fract(vFlow * uDensity - uTime * uSpeed);
  float pulse = smoothstep(0.55, 0.95, d) * (1.0 - smoothstep(0.95, 1.0, d));
  pulse *= uFlow;

  float base = mix(0.34, 0.78, vT);
  float alpha = (base + pulse * 0.55) * uFade * mix(1.0, 0.2, dim);

  vec3 col = vColor + vColor * pulse * 0.7 + vColor * vHighlight * 0.25;
  col = mix(col, vec3(dot(col, LUMA)), dim);

  gl_FragColor = vec4(col, alpha);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
