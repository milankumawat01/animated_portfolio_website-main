// 04 EXPERIENCE — the helix of light, fragment stage.
//
// LIGHT ON A LIGHT PAGE. The obvious build — dim filament, bright charged section,
// white-hot comet — renders exactly backwards against `--surface-page` (#F5F8FC,
// luminance ~0.97 after ACES and sRGB). "Brighter" there means "closer to the
// background", so the part of the tube that had already lit up VANISHED and the
// part that had not yet lit up read as a hard navy wire. Bloom cannot rescue it
// either: the composer's luminance mask is `smoothstep(threshold, threshold+0.3)`
// and a near-white subject sitting 0.01 above a near-white page lands in the same
// bucket whatever the threshold.
//
// So the whole station trades brightness for SATURATION. The filament ahead of the
// climb is a quiet grey-blue; the stretch the light has already travelled is a
// strong azure; the comet head alone is pushed over 1.0 in linear space. On a pale
// page a saturated line reads as energy and a white one reads as nothing.
//
// Three fields, all keyed off `vTubeUv.x` (0 at the foot of the helix, 1 at the
// crown):
//
//   uFill   how far the light has climbed. Scroll-bound, so it survives at `low`
//           and under reduced motion — this is the part that reads as CLIMBING.
//   wake    the charge decays going back down, so the tube behind the climb
//           settles instead of leaving the whole lower helix shouting.
//   uPulse  the comet head, deliberately above uFill so the light LEADS the
//           camera. uPulseOn swaps it for a static bloom at the fill edge.

#include <common>
#include <fog_pars_fragment>

uniform float uFill;
uniform float uPulse;
uniform float uPulseOn;
uniform float uTime;
uniform float uFade;
uniform vec3 uPale;
uniform vec3 uCharged;
uniform vec3 uHot;
uniform vec3 uGlow;

varying vec2 vTubeUv;
varying vec3 vNormalV;

void main() {
  float s = vTubeUv.x;

  // --- the charged length -------------------------------------------------
  float front = 1.0 - smoothstep(uFill - 0.01, uFill + 0.12, s);
  float wake = exp(-max(uFill - s, 0.0) * 2.0);
  float charge = front * mix(0.32, 1.0, wake);

  // --- the travelling comet -----------------------------------------------
  float d = s - uPulse;
  float lead = 1.0 - smoothstep(0.0, 0.008, d);
  float comet = lead * exp(-max(-d, 0.0) * 9.0);
  comet *= 0.78 + 0.22 * sin(s * 150.0 - uTime * 3.4);

  // With uPulseOn at 0 this becomes a fixed bloom sitting on the fill edge: the
  // static gradient the low tier and reduced motion ask for, still scroll-placed.
  float still = exp(-pow((s - uFill) * 11.0, 2.0)) * 0.5;
  float hot = mix(still, comet, uPulseOn);

  // --- fake cylindrical key -----------------------------------------------
  // No scene light touches this material. `facing` is 1 down the middle of the
  // tube and 0 at its silhouette, which is all a filament needs to look round.
  vec3 n = normalize(vNormalV);
  float facing = abs(n.z);

  vec3 body = mix(uPale, uCharged, charge);

  // The comet head is pushed over 1.0 so the high tier's bloom has something to
  // catch. At `low` there is no composer at all, and a white-hot band on a white
  // page is a white page — so when the pulse is off the same field is tinted to
  // the halo cyan, which is the only way the static gradient reads.
  vec3 hotColor = mix(uGlow * 1.7, uHot, uPulseOn);

#ifdef SHEATH
  // The halo. Back-faced and alpha-blended rather than additive: additive light
  // on a near-white page only makes it whiter, which is invisible. A saturated
  // low-alpha wash around the filament is what actually reads as glow here.
  //
  // Fog is applied to the ALPHA. `fog_fragment` mixes toward fogColor, which on a
  // light station is brighter than the halo, so a halo run through it would get
  // stronger with distance instead of fading out.
  float glow = pow(facing, 1.7);
  vec3 col = mix(body, uGlow, min(hot * 1.4, 1.0));
  float alpha = glow * (0.07 + charge * 0.09 + hot * 0.34) * uFade;

  #ifdef USE_FOG
    alpha *= 1.0 - smoothstep(fogNear, fogFar, vFogDepth);
  #endif

  gl_FragColor = vec4(col, alpha);

  #include <colorspace_fragment>
#else
  float key = mix(0.52, 1.0, facing);
  vec3 col = body * key + hotColor * hot * mix(0.7, 1.0, facing);

  gl_FragColor = vec4(col, uFade);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
#endif
}
