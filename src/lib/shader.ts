/**
 * GLSL helpers shared by every station.
 *
 * `.glsl` files import as raw strings (see next.config.ts). Compose them with the
 * chunks below rather than pasting a noise implementation into each scene — eight
 * copies of simplex noise is eight copies to keep in sync.
 */

/** Template tag. Identity at runtime; exists so editors syntax-highlight the string. */
export const glsl = (strings: TemplateStringsArray, ...values: unknown[]): string =>
  strings.reduce((acc, s, i) => acc + s + (i < values.length ? String(values[i]) : ''), '')

/** Ashima 3D simplex noise. Returns roughly -1..1. Provides `snoise(vec3)`. */
export const SIMPLEX_3D = glsl`
vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`

/** Divergence-free curl of the simplex field. Requires SIMPLEX_3D. */
export const CURL_NOISE = glsl`
vec3 curlNoise(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);

  float x0 = snoise(p - dx); float x1 = snoise(p + dx);
  float y0 = snoise(p - dy); float y1 = snoise(p + dy);
  float z0 = snoise(p - dz); float z1 = snoise(p + dz);

  vec3 pa = p + vec3(123.4, 55.1, 91.7);
  float ax0 = snoise(pa - dy); float ax1 = snoise(pa + dy);
  float az0 = snoise(pa - dz); float az1 = snoise(pa + dz);

  float cx = (ax1 - ax0) - (z1 - z0);
  float cy = (x1 - x0) - (az1 - az0);
  float cz = (y1 - y0) - (x1 - x0);

  return normalize(vec3(cx, cy, cz) / (2.0 * e) + 1e-6);
}
`

/**
 * Small utilities most stations end up wanting.
 *
 * Safe in BOTH stages — nothing here touches a derivative. `aaLine` used to live in
 * this chunk and it silently broke every vertex shader that included it: `fwidth`
 * does not exist in a GLSL ES 1.0 vertex stage, the program fails to link, and the
 * geometry simply never draws. It is in FRAGMENT_ONLY now.
 */
export const COMMON = glsl`
float hash11(float n){ return fract(sin(n) * 43758.5453123); }
vec2  hash21(float n){ return fract(sin(vec2(n, n + 1.0)) * vec2(43758.5453, 22578.1459)); }
vec3  hash31(float n){ return fract(sin(vec3(n, n + 1.0, n + 2.0)) * vec3(43758.5453, 22578.1459, 19642.3490)); }

float remap(float v, float a, float b, float c, float d){
  return c + (d - c) * clamp((v - a) / max(b - a, 1e-6), 0.0, 1.0);
}

/** Soft round sprite for point clouds. Feed it gl_PointCoord. */
float roundSprite(vec2 uv, float softness){
  float d = length(uv - 0.5) * 2.0;
  return 1.0 - smoothstep(1.0 - softness, 1.0, d);
}
`

/**
 * Helpers that use screen-space derivatives. **Fragment stage only.**
 * Including any of this in a vertex shader fails to link.
 */
export const FRAGMENT_ONLY = glsl`
/** Anti-aliased line, width in pixels, using screen-space derivatives. */
float aaLine(float d, float width){
  float w = fwidth(d) * width;
  return 1.0 - smoothstep(0.0, w, abs(d));
}

/** Anti-aliased procedural grid. 1 on a line, 0 between. */
float aaGrid(vec2 uv, float frequency, float thickness){
  vec2 g = abs(fract(uv * frequency) - 0.5);
  vec2 w = fwidth(uv * frequency) * thickness;
  vec2 l = 1.0 - smoothstep(vec2(0.0), w, g);
  return max(l.x, l.y);
}
`

/**
 * Prepend to a **vertex** shader. Derivative-free, so it always links.
 *
 *   const vert = `${VERTEX_PRELUDE}\n${mySource}`
 */
export const VERTEX_PRELUDE = `${COMMON}\n${SIMPLEX_3D}\n${CURL_NOISE}`

/** Prepend to a **fragment** shader. Everything, including the derivative helpers. */
export const FRAGMENT_PRELUDE = `${VERTEX_PRELUDE}\n${FRAGMENT_ONLY}`

/**
 * @deprecated Ambiguous: the name reads as "safe anywhere" but it carries `fwidth`.
 * Prefer VERTEX_PRELUDE or FRAGMENT_PRELUDE. Aliased to the fragment set so shaders
 * already importing it keep working.
 */
export const SHADER_PRELUDE = FRAGMENT_PRELUDE
