// Hero monogram particles — vertex stage.
// Prepend SIMPLEX_3D + CURL_NOISE before compiling. NOT the full SHADER_PRELUDE:
// its `aaLine` calls `fwidth`, and derivatives do not exist in a vertex shader.
//
// `position` carries the FREE position (a normalised cloud), `aTarget` the monogram
// position. The mix between them is per-particle: a left-to-right front plus a
// random offset, so the mark frays apart instead of wiping.

attribute vec3 aTarget;
attribute float aSeed;
attribute float aScale;

uniform float uTime;
uniform float uDissolve;
uniform float uScale;
uniform float uSize;
uniform float uPixelRatio;
/** 0 under reduced motion — freezes the idle drift without freezing the dissolve. */
uniform float uIdle;
uniform float uSpread;

varying float vAlpha;
varying float vSeed;
varying float vFree;

/** Width of the dissolve front. Wider = softer edge. */
const float FRONT = 0.34;
/** How much of the sweep is positional vs. random. Higher = cleaner left-to-right. */
const float SWEEP = 0.62;
/** Per-particle scatter of the threshold. Higher = more fraying. */
const float FRAY = 0.30;

void main() {
  // --- when does THIS particle let go? -------------------------------------
  // aTarget.x spans -0.5..0.5 across the mark, so the M releases before the K.
  // Thresholds are kept >= 0 and the front is run past the last of them, so
  // uDissolve = 0 really is "nothing has moved" and 1 really is "all of it has".
  float sweep = clamp(aTarget.x + 0.5, 0.0, 1.0);
  float threshold = sweep * SWEEP + aSeed * FRAY;
  float front = uDissolve * (SWEEP + FRAY + FRONT);
  float d = smoothstep(0.0, FRONT, front - threshold);

  // --- settled: the monogram, breathing ------------------------------------
  vec3 settled = aTarget * uScale;
  settled += curlNoise(aTarget * 2.6 + vec3(0.0, 0.0, uTime * 0.08))
           * (0.030 * uScale * uIdle);

  // --- free: a curl-noise drift through the surrounding volume --------------
  vec3 base = position * uScale * uSpread;
  vec3 flow = curlNoise(base * 0.075 + vec3(uTime * 0.035, uTime * 0.02, 0.0));
  vec3 free = base + flow * (uScale * (0.20 + aSeed * 0.55) * (0.35 + uIdle * 0.65));
  // Released particles lift and fall away rather than hanging in place.
  free += vec3(0.0, (aSeed - 0.4) * 0.9, (aSeed - 0.5) * 0.6) * uScale * 0.22 * d;

  vec3 pos = mix(settled, free, d);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  // Size attenuation. The clamp keeps a point that drifts past the near plane from
  // ballooning into a screen-filling quad.
  float dist = max(-mv.z, 0.4);
  gl_PointSize = clamp(uSize * aScale * uPixelRatio * (9.0 / dist), 0.55, 42.0);

  vAlpha = mix(1.0, 0.26, d) * (0.45 + aScale * 0.55);
  vSeed = aSeed;
  vFree = d;
}
