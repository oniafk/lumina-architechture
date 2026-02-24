import * as THREE from "three/webgpu";
import { TEXTURE_LIBRARY, type TextureEntry } from "./config/textures";
import { SECTIONS, type Section } from "./config/sections";

export const ALL_ENTRIES: TextureEntry[] = [
  ...TEXTURE_LIBRARY.bricks,
  ...TEXTURE_LIBRARY.concrete,
  ...TEXTURE_LIBRARY.wood,
  ...TEXTURE_LIBRARY.aerial,
];

export class TextureManager {
  private loader: THREE.TextureLoader;

  private textureCache: Map<string, Promise<THREE.Texture>> = new Map();

  constructor(loader: THREE.TextureLoader) {
    this.loader = loader;
  }

  private loadMap(url: string): Promise<THREE.Texture> {
    if (this.textureCache.has(url)) {
      return this.textureCache.get(url)!.then((tex) => tex.clone());
    }

    const loadPromise = new Promise<THREE.Texture>((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          // Fix NPOT (Non-Power-Of-Two) textures, which FORCE ClampToEdge on some WebGL/WebGPU backends
          if (texture.image) {
            const img = texture.image;
            const w = img.width;
            const h = img.height;
            const isPOT = (THREE.MathUtils.isPowerOfTwo(w) && THREE.MathUtils.isPowerOfTwo(h));
            
            if (!isPOT && typeof document !== "undefined") {
              const canvas = document.createElement("canvas");
              canvas.width = THREE.MathUtils.floorPowerOfTwo(w);
              canvas.height = THREE.MathUtils.floorPowerOfTwo(h);
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                // @ts-ignore: Three.js dynamically supports canvas for texture.image
                texture.image = canvas;
              }
            }
          }
          resolve(texture);
        },
        undefined,
        (err) => {
          console.error(`Failed to load texture: ${url}`, err);
          this.textureCache.delete(url);
          reject(err);
        },
      );
    });

    this.textureCache.set(url, loadPromise);
    return loadPromise.then((tex) => tex.clone());
  }

  findEntry(textureId: string): TextureEntry | undefined {
    return ALL_ENTRIES.find((e) => e.id === textureId);
  }

  async createMaterial(
    textureId: string,
    repeat: [number, number] = [1, 1],
  ): Promise<THREE.MeshStandardMaterial> {
    const entry = this.findEntry(textureId);
    if (!entry) throw new Error(`Texture "${textureId}" not found`);

    const colorMap = await this.loadMap(entry.maps.color);
    const normalMap = entry.maps.normal ? await this.loadMap(entry.maps.normal) : null;
    const armMap = entry.maps.arm ? await this.loadMap(entry.maps.arm) : null;
    const roughnessMap = entry.maps.roughness ? await this.loadMap(entry.maps.roughness) : null;
    const metalnessMap = entry.maps.metalness ? await this.loadMap(entry.maps.metalness) : null;
    const aoMap = entry.maps.ao ? await this.loadMap(entry.maps.ao) : null;
    const displacementMap = entry.maps.displacement ? await this.loadMap(entry.maps.displacement) : null;

    colorMap.colorSpace = THREE.SRGBColorSpace;
    if (normalMap) normalMap.colorSpace = THREE.LinearSRGBColorSpace;
    if (armMap) armMap.colorSpace = THREE.LinearSRGBColorSpace;

    const allTextures = [colorMap, normalMap, armMap, roughnessMap, metalnessMap, aoMap, displacementMap];
    for (const tex of allTextures) {
      if (!tex) continue;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;

      // Scale slightly inwards (e.g., 0.999) and offset to avoid hitting the exact bleeding bounds
      tex.repeat.set(repeat[0] * 0.999, repeat[1] * 0.999);
      tex.offset.set(0.005, 0.005);

      tex.flipY = false;
      tex.needsUpdate = true;
    }

    const matParams: THREE.MeshStandardMaterialParameters = {
      map: colorMap,
      roughness: 1,
      metalness: 1,
    };

    if (normalMap) matParams.normalMap = normalMap;
    if (displacementMap) {
      matParams.displacementMap = displacementMap;
      matParams.displacementScale = 0.05;
    }

    if (armMap) {
      // ARM packed texture: R = AO, G = Roughness, B = Metalness
      matParams.aoMap = armMap;
      matParams.roughnessMap = armMap;
      matParams.metalnessMap = armMap;
    } else {
      // Individual maps
      if (roughnessMap) matParams.roughnessMap = roughnessMap;
      if (metalnessMap) matParams.metalnessMap = metalnessMap;
      if (aoMap) matParams.aoMap = aoMap;
    }

    return new THREE.MeshStandardMaterial(matParams);
  }

  async applyTexture(
    meshes: THREE.Mesh[],
    textureId: string,
    repeat: [number, number] = [1, 1],
  ): Promise<void> {
    if (!meshes || meshes.length === 0) {
      console.warn(`applyTexture("${textureId}"): skipped, no meshes provided`);
      return;
    }
    try {
      const mat = await this.createMaterial(textureId, repeat);
      for (const mesh of meshes) {
        mesh.material = mat;
      }
     
    } catch (err) {
      console.error(`Failed to apply texture "${textureId}":`, err);
    }
  }

  /**
   * Silently load all remaining textures into the cache without applying them.
   * Useful to call during main app idle time.
   */
  async preloadRemainingTextures(delayMs: number = 2000): Promise<void> {
    // Wait slightly to ensure initial scene render is smooth
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    console.log("TextureManager: Starting background prefetch...");
    const promises: Promise<any>[] = [];

    for (const entry of ALL_ENTRIES) {
      if (entry.maps.color) promises.push(this.loadMap(entry.maps.color).catch(() => {}));
      if (entry.maps.normal) promises.push(this.loadMap(entry.maps.normal).catch(() => {}));
      if (entry.maps.arm) promises.push(this.loadMap(entry.maps.arm).catch(() => {}));
      if (entry.maps.roughness) promises.push(this.loadMap(entry.maps.roughness).catch(() => {}));
      if (entry.maps.metalness) promises.push(this.loadMap(entry.maps.metalness).catch(() => {}));
      if (entry.maps.ao) promises.push(this.loadMap(entry.maps.ao).catch(() => {}));
      if (entry.maps.displacement) promises.push(this.loadMap(entry.maps.displacement).catch(() => {}));
    }

    try {
      await Promise.all(promises);
      console.log("TextureManager: Background prefetch complete.");
    } catch (err) {
      console.error("TextureManager: Error during prefetch", err);
    }
  }

  applyColor(meshes: THREE.Mesh[], color: number | string): void {
    const mat = new THREE.MeshStandardMaterial({ color });
    for (const mesh of meshes) {
      mesh.material = mat;
    }
  }
}

/** Resolve an object name from the GLB to an array of meshes.
 *  If the name points to a Mesh, returns [mesh].
 *  If it points to a Group/Object3D, traverses and returns all child meshes. */
export function collectMeshes(
  model: THREE.Object3D,
  name: string,
): THREE.Mesh[] {
  const obj = model.getObjectByName(name);
  if (!obj) {
    console.warn(`collectMeshes: "${name}" not found in model`);
    return [];
  }
  if (obj instanceof THREE.Mesh) return [obj];
  const meshes: THREE.Mesh[] = [];
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) meshes.push(child);
  });
  return meshes;
}

/** Walk every section and fill its `meshes` array from the loaded model. */
export function populateSections(model: THREE.Object3D): void {
  for (const section of SECTIONS) {
    section.meshes = [];
    for (const name of section.objects) {
      section.meshes.push(...collectMeshes(model, name));
    }
  }
}

/** Shortcut to grab a section by id. */
export function getSection(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}
