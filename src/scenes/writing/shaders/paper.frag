// 07 — WRITING · the paper surface.
//
// THE STATION USES NONE OF ITS THREE LIGHT SLOTS. The key lives here, as a fixed
// direction in view space, for two reasons: a real light would have to be placed
// against a field that follows the camera (so it would have to move every frame
// anyway), and a wrapped diffuse term is a better model of a sheet of paper in a
// bright white room than any lambert a DirectionalLight can give.
//
// Back faces are a genuinely different material, not the front dimmed: a page
// printed on one side has a cooler, flatter, slightly darker reverse. That is what
// makes the curl legible when a sheet turns over — the acceptance criterion this
// shader exists to satisfy.
//
// FRAGMENT_PRELUDE is prepended in Sheet.tsx.

#include <common>
#include <fog_pars_fragment>

#ifdef HAS_MAP
uniform sampler2D uMap;
#endif

/** front paper stock, back paper stock */
uniform vec3 uFront;
uniform vec3 uBack;
/** key direction, VIEW space, normalised on the CPU */
uniform vec3 uKey;
/** ambient floor and key gain */
uniform vec2 uLevels;
/** fibre grain amount */
uniform float uGrain;
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vNormalView;
varying vec3 vViewDir;
varying float vSeed;

void main() {
  vec3 n = normalize(vNormalView);
  bool facing = gl_FrontFacing;
  if (!facing) n = -n;

  vec3 base = uBack;
  if (facing) {
#ifdef HAS_MAP
    base = texture2D(uMap, vUv).rgb;
#else
    base = uFront;
#endif
  }

  // Wrapped diffuse. A hard lambert on a flat white plane reads as plastic; the
  // half-lambert keeps the unlit side of the fold alive the way a bounced room does.
  float wrapped = clamp(0.5 + 0.5 * dot(n, uKey), 0.0, 1.0);
  float lit = mix(uLevels.x, uLevels.y, wrapped * wrapped * (3.0 - 2.0 * wrapped));

  // Paper stock: the last millimetre of the sheet is always a shade darker than
  // the middle, and that hairline is most of what says "object" rather than "quad".
  vec2 edge2 = min(vUv, 1.0 - vUv);
  float edge = smoothstep(0.0, 0.03, min(edge2.x, edge2.y));
  base *= mix(0.78, 1.0, edge);

  // Fibre. Barely there, but a perfectly smooth white plane looks like glass.
  float grain = snoise(vec3(vUv * 96.0, vSeed * 13.0));
  base *= 1.0 + uGrain * grain;

  // Sheen at grazing angles — coated stock catching the room.
  float fres = pow(1.0 - clamp(dot(n, normalize(vViewDir)), 0.0, 1.0), 3.0);

  vec3 col = base * lit + fres * 0.05;
  gl_FragColor = vec4(col, uOpacity);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}
