// Hero fog volume — fragment stage. Prepend SIMPLEX_3D for `snoise`.
//
// Drawn on the inside of a large sphere, so `vLocal` is effectively a view
// direction: two octaves of simplex over that direction, scrolling slowly, read as
// drifting cloud rather than as a textured ball.

uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;

varying vec3 vLocal;

void main() {
  vec3 dir = normalize(vLocal);

  float a = snoise(dir * 2.1 + vec3(0.0, uTime * 0.05, uTime * 0.02)) * 0.5 + 0.5;
  float b = snoise(dir * 5.4 - vec3(uTime * 0.035, 0.0, uTime * 0.015)) * 0.5 + 0.5;
  float f = a * 0.68 + b * 0.32;
  f = smoothstep(0.30, 0.94, f);

  // Thin it out overhead and underfoot so the sphere never reads as a sphere.
  f *= 0.30 + 0.70 * (1.0 - abs(dir.y));

  gl_FragColor = vec4(uColor * (0.55 + f * 0.75), f * uOpacity);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
