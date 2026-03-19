const fragmentShader = /* glsl */ `
uniform sampler2D uTexCurrent;
uniform sampler2D uTexNext;
uniform float uBlend;
uniform float uVelocity;
uniform float uProgress;
uniform vec2 uResolution;
uniform vec2 uImageSize;
uniform sampler2D uMask;

varying vec2 vUv;
varying float vMorphT;

// SDF rounded box: negative inside, positive outside
float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + vec2(r);
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// "Contain" — full image visible, letterbox edges (UVs can go outside [0,1])
vec2 containUV(vec2 uv, vec2 resolution, vec2 imageSize) {
  float canvasAspect = resolution.x / resolution.y;
  float imageAspect = imageSize.x / imageSize.y;
  vec2 scale = vec2(1.0);
  if (canvasAspect > imageAspect) {
    scale.x = canvasAspect / imageAspect;
  } else {
    scale.y = imageAspect / canvasAspect;
  }
  return (uv - 0.5) * scale + 0.5;
}

// "Cover" — fill mesh completely, slight crop (UVs always in [0,1])
vec2 coverUV(vec2 uv, vec2 resolution, vec2 imageSize) {
  float canvasAspect = resolution.x / resolution.y;
  float imageAspect = imageSize.x / imageSize.y;
  vec2 scale = vec2(1.0);
  if (canvasAspect > imageAspect) {
    scale.y = imageAspect / canvasAspect;
  } else {
    scale.x = canvasAspect / imageAspect;
  }
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec4 mask = texture2D(uMask, vUv);

  // Tablet mask: blue channel = screen area with rounded corners
  // SDF rounded rect: procedural rounded corners (no bezel/frame)
  // Blend tablet → SDF as morph progresses, keeping rounded corners throughout
  float sdfDist = sdRoundedBox(vUv - 0.5, vec2(0.5), 0.04);
  float sdfMask = 1.0 - smoothstep(-0.005, 0.005, sdfDist);
  float effectiveMask = mix(mask.b, sdfMask, vMorphT);
  if (effectiveMask < 0.5) {
    discard;
  }

  // Blend contain → cover as morph progresses
  // Contain: full image visible (mask hides letterbox edges at initial state)
  // Cover: fills the plane completely (no bleeding after morph dissolves the mask)
  vec2 uvContain = containUV(vUv, uResolution, uImageSize);
  vec2 uvCover = coverUV(vUv, uResolution, uImageSize);
  vec2 uv = mix(uvContain, uvCover, vMorphT);
  vec4 currentColor = texture2D(uTexCurrent, uv);
  vec4 nextColor = texture2D(uTexNext, uv);
  vec4 video = mix(currentColor, nextColor, uBlend);

  gl_FragColor = vec4(video.rgb, 1.0);
}
`;

export default fragmentShader;
