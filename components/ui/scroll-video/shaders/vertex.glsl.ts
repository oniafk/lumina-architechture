const vertexShader = /* glsl */ `
uniform vec2 u_domXY;
uniform vec2 u_domWH;
uniform vec2 u_resolution;
uniform vec2 u_scrollOffset;
uniform float u_scrollProgress;
uniform float u_scrollTravel;

varying vec2 vUv;
varying float vMorphT;

void main() {
  vUv = uv;

  // position.xy is in [-0.5, 0.5] range for a 1x1 PlaneGeometry
  // Map to [0, 1]: (0,0)=top-left, (1,1)=bottom-right
  vec2 localPos = vec2(position.x + 0.5, 0.5 - position.y);

  // --- Morph: frame 6 → 48 (wider range for smoother sweep) ---
  float frame = u_scrollProgress * 119.0;
  float morphT = clamp((frame - 6.0) / (48.0 - 6.0), 0.0, 1.0);

  // Diagonal delay: 0 at bottom-right UV(1,0), 1 at top-left UV(0,1)
  // sin(progress - delay) principle — each vertex delays its transition
  float delay = ((1.0 - uv.x) + uv.y) * 0.5;

  // Phase: (morphT * 2.0 - delay) sweeps from BR to TL
  // morphT * 2.0 ensures wave completes for ALL vertices by morphT=1
  // Clamp to [0, PI] — one half-cycle of cos gives monotonic 0→1
  float phase = clamp((morphT * 2.0 - delay) * 3.14159265, 0.0, 3.14159265);

  // Cumulative cos wave: (1 - cos(phase)) / 2 = integral of sin pulse
  // Smooth S-curve per vertex: slow start, fast middle, slow end
  float easedT = (1.0 - cos(phase)) * 0.5;

  // Pass per-vertex morph to fragment for mask transition
  vMorphT = easedT;

  // Original pixel position in canvas space
  float scrollTravel = u_scrollProgress * u_scrollTravel;
  vec2 origPixel = u_domXY - u_scrollOffset + localPos * u_domWH + vec2(0.0, scrollTravel);

  // Target: 1.75x size, centered on viewport during morph
  vec2 targetWH = u_domWH * 1.75;
  vec2 targetCenter = u_resolution * 0.5;

  // After last frame (119), lock position to page so it scrolls away
  // with the section instead of sticking to viewport center
  float morphEndProgress = 110.0 / 119.0;
  float postMorphScroll = max(0.0, u_scrollProgress - morphEndProgress) * u_scrollTravel;
  targetCenter.y -= postMorphScroll;

  vec2 targetPixel = targetCenter + (localPos - 0.5) * targetWH;

  // Per-vertex interpolation: wave sweeps from BR to TL
  vec2 pixelPos = mix(origPixel, targetPixel, easedT);

  // Pixel → NDC
  vec2 ndcPos = vec2(
    (pixelPos.x / u_resolution.x) * 2.0 - 1.0,
    1.0 - (pixelPos.y / u_resolution.y) * 2.0
  );

  gl_Position = vec4(ndcPos, 0.0, 1.0);
}
`;

export default vertexShader;
