// Hero monogram particles — fragment stage.
// Prepend COMMON — `roundSprite` lives there, so the sprite needs no texture file.

uniform vec3 uColor;
uniform vec3 uHot;
uniform float uOpacity;

varying float vAlpha;
varying float vSeed;
varying float vFree;

void main() {
  float sprite = roundSprite(gl_PointCoord, 0.85);
  if (sprite <= 0.004) discard;

  // A hot, near-white core inside a coloured halo. This is what gives bloom
  // something above the 0.75 threshold to catch without raising overall exposure.
  float core = pow(sprite, 5.0);
  vec3 col = mix(uColor, uHot, core * 0.58);

  // Per-particle brightness spread, and a cooler tint once a particle is loose.
  col *= 0.72 + vSeed * 0.56;
  col = mix(col, col * vec3(0.78, 0.86, 1.0), vFree * 0.5);

  gl_FragColor = vec4(col, sprite * vAlpha * uOpacity);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
