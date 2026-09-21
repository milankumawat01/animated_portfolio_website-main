/**
 * The caustic pool under each slab.
 *
 * A two-octave F2-F1 voronoi ridge — the cell borders are the bright filaments, which
 * is what a real caustic web looks like from below a sheet of glass. Masked to a soft
 * ellipse so the plane's own edge never shows.
 *
 * DEVIATION from the scene bible, which asks for additive at 30%: Projects is a light
 * station (#F5F8FC), and additive light on a near-white page clamps straight to white
 * — the pools were invisible. So the pool composites normally instead: a soft
 * blue-grey shadow disc that grounds the slab, with the bright filaments drawn inside
 * it. Same one material, same one instanced draw call, and it now reads.
 *
 * `vSeed` is the per-instance seed, so the four pools do not animate in lockstep.
 *
 * Prepended with COMMON from `@/lib/shader`.
 */

uniform float uTime;
uniform float uOpacity;
uniform vec3 uColor;
uniform vec3 uShadow;

varying vec2 vUv;
varying float vSeed;

vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}

/** F2 - F1. Zero on a cell border, rising toward a cell centre. */
float voronoiRidge(vec2 p, float t) {
  vec2 n = floor(p);
  vec2 f = fract(p);

  float d1 = 8.0;
  float d2 = 8.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash22(n + g);
      o = 0.5 + 0.5 * sin(t + 6.2831853 * o);
      float d = length(g + o - f);
      if (d < d1) {
        d2 = d1;
        d1 = d;
      } else if (d < d2) {
        d2 = d;
      }
    }
  }

  return d2 - d1;
}

void main() {
  vec2 c = vUv - 0.5;

  float edge = 1.0 - smoothstep(0.16, 0.5, length(c * vec2(1.0, 1.35)));
  if (edge <= 0.002) discard;

  float t = uTime * 0.55 + vSeed * 7.3;

  float a = voronoiRidge(vUv * 6.0 + vec2(vSeed * 3.1, 0.0), t);
  float b = voronoiRidge(vUv * 11.5 - vec2(0.0, vSeed * 2.4), t * 1.37);

  float web =
    pow(1.0 - clamp(a, 0.0, 1.0), 7.0) * 0.8 +
    pow(1.0 - clamp(b, 0.0, 1.0), 12.0) * 0.5;

  float pool = edge * edge;
  float filaments = clamp(web, 0.0, 1.0) * pool;

  vec3 col = mix(uShadow, uColor, smoothstep(0.08, 0.7, filaments));
  // uOpacity stays the scene bible's 0.3 knob; the weights below spend it.
  float alpha = (pool * 0.95 + filaments * 1.3) * uOpacity;

  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
