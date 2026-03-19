import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

// --- Constants ---
const TOTAL_FRAMES = 120;
const FRAME_PATH = "/images/video_section/video_1/frame_";
const IMAGE_WIDTH = 1087;
const IMAGE_HEIGHT = 720;

function getFrameSrc(index: number): string {
  const num = String(index + 1).padStart(4, "0");
  return `${FRAME_PATH}${num}.webp`;
}

export type ScrollVideoInstance = {
  mesh: THREE.Mesh;
  setTargetProgress: (progress: number) => void;
  update: (dt: number) => void;
  dispose: () => void;
};

/**
 * Factory function that creates the scroll-video mesh with ShaderMaterial,
 * loads all frame textures, and returns control handles.
 *
 * The mesh is a 1x1 PlaneGeometry positioned by the global canvas vertex shader.
 */
export function createScrollVideoMesh(
  geometry: THREE.PlaneGeometry,
  callbacks?: {
    onLoadComplete?: () => void;
    onLoadProgress?: (loaded: number, total: number) => void;
  }
): ScrollVideoInstance {
  const textures: (THREE.Texture | null)[] = new Array(TOTAL_FRAMES).fill(null);
  let targetProgress = 0;
  let currentProgress = 0;
  let prevProgress = 0;
  let disposed = false;

  // --- Material ---
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTexCurrent: { value: null },
      uTexNext: { value: null },
      uBlend: { value: 0.0 },
      uVelocity: { value: 0.0 },
      uProgress: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uImageSize: { value: new THREE.Vector2(IMAGE_WIDTH, IMAGE_HEIGHT) },
      uMask: { value: null },
      // DOM positioning uniforms (set by global canvas)
      u_domXY: { value: new THREE.Vector2(0, 0) },
      u_domWH: { value: new THREE.Vector2(1, 1) },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_scrollOffset: { value: new THREE.Vector2(0, 0) },
      // Scroll-driven progress (0–1), controls position offset and future morph
      u_scrollProgress: { value: 0.0 },
      // How many pixels to travel over the full scroll range
      u_scrollTravel: { value: 0.0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);

  // --- Load mask texture ---
  const loader = new THREE.TextureLoader();
  loader.load("/textures/images-filter/tablet.png", (maskTex) => {
    if (disposed) {
      maskTex.dispose();
      return;
    }
    maskTex.minFilter = THREE.LinearFilter;
    maskTex.magFilter = THREE.LinearFilter;
    maskTex.generateMipmaps = false;
    material.uniforms.uMask.value = maskTex;
  });

  // --- Preload frame textures ---
  let loadedCount = 0;

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    loader.load(getFrameSrc(i), (texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }

      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.colorSpace = THREE.SRGBColorSpace;

      textures[i] = texture;
      loadedCount++;

      callbacks?.onLoadProgress?.(loadedCount, TOTAL_FRAMES);

      if (loadedCount === TOTAL_FRAMES) {
        material.uniforms.uTexCurrent.value = textures[0];
        material.uniforms.uTexNext.value = textures[0];
        callbacks?.onLoadComplete?.();
      }
    });
  }

  return {
    mesh,

    setTargetProgress(progress: number) {
      targetProgress = Math.max(0, Math.min(1, progress));
    },

    update(dt: number) {
      currentProgress = targetProgress;

      // Velocity
      const velocity = currentProgress - prevProgress;
      prevProgress = currentProgress;

      // Frame indices + blend
      const frameFloat = currentProgress * (TOTAL_FRAMES - 1);
      const currentFrame = Math.floor(frameFloat);
      const nextFrame = Math.min(currentFrame + 1, TOTAL_FRAMES - 1);
      const blendFactor = frameFloat - currentFrame;

      const texCurrent = textures[currentFrame];
      const texNext = textures[nextFrame];
      if (texCurrent && texNext) {
        material.uniforms.uTexCurrent.value = texCurrent;
        material.uniforms.uTexNext.value = texNext;
        material.uniforms.uBlend.value = blendFactor;
        material.uniforms.uVelocity.value = Math.min(
          1,
          Math.abs(velocity) * 60
        );
        material.uniforms.uProgress.value = currentProgress;
      }

      // Update uResolution to match the DOM element size for cover UV calculation
      const domWH = material.uniforms.u_domWH.value;
      material.uniforms.uResolution.value.set(domWH.x, domWH.y);

    },

    dispose() {
      disposed = true;
      for (const tex of textures) {
        if (tex) tex.dispose();
      }
      material.dispose();
    },
  };
}
