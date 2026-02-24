"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu"; // Important: Must use WebGPU build for nodes/lights
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { Pane } from "tweakpane";
import { TextureManager, populateSections, getSection, ALL_ENTRIES } from "./TextureManager";
import { useCustomizerStore, DEFAULT_REPEATS } from "@/store/useCustomizerStore";

type HouseCanvasProps = {
  debug?: boolean;
};

export default function HouseCanvas({ debug = false }: HouseCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;
    const container = containerRef.current;
    const PI = Math.PI;

    //* scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("white");

    //* camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.set(1, 2, 5);

    //* renderer
    const renderer = new THREE.WebGPURenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    // Explicitly add a CSS class to the canvas so it forces itself to be visible
    renderer.domElement.className = "w-full h-full block";
    container.appendChild(renderer.domElement);
    console.log("Canvas appended to container!", renderer.domElement);

    //* HDRI environment
    // Use RGBELoader instead of HDRLoader as it is the standard for modern three.js
    const rgbeLoader = new HDRLoader();
    // Use a placeholder if the HDRI isn't copied yet
    const hdriPath = "/HDRI/lonely_road_afternoon_puresky_1k.hdr";
    
    rgbeLoader.load(hdriPath, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.background = texture;
    }, undefined, (err) => {
      console.warn("Failed to load HDRI, ignoring (make sure it is in /public/HDRI/)", err);
    });

    //* texture manager
    const texLoader = new THREE.TextureLoader();
    const textureManager = new TextureManager(texLoader);

    //* controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 8;
    controls.enablePan = false;

    //* floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const floorMesh = new THREE.Mesh(floorGeometry, floorMat);
    floorMesh.rotation.x = -PI / 2;
    floorMesh.position.set(0, -0.5, 0);
    scene.add(floorMesh);

    const floorAlphaTexture = texLoader.load("/textures/floor/alpha.jpg");
    floorAlphaTexture.flipY = false;
    textureManager.applyTexture([floorMesh], "rocky-terrain-02", [10, 10]).then(() => {
      const mat = floorMesh.material as THREE.MeshStandardMaterial;
      mat.alphaMap = floorAlphaTexture;
      mat.transparent = true;
      mat.needsUpdate = true;
    });

    //* glass material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.3,
      transmission: 1,
      thickness: 0.5,
      ior: 1.5,
      transparent: true,
      envMap: scene.environment,
    });

    function applyStartingTextures(): void {
      const apply = (sectionId: string, textureId: string, repeat: [number, number]) => {
        const section = getSection(sectionId);
        if (section && section.meshes.length > 0) {
          textureManager.applyTexture(section.meshes, textureId, repeat);
        }
      };

      apply("exterior-walls", "painted-plaster-wall", [2, 2]);
      apply("doors", "fine-grained-wood", [2, 2]);
      apply("floor", "concrete-floor-worn", [2, 2]);
      apply("ceiling", "fine-grained-wood", [2, 2]);
      apply("wood-elements", "fine-grained-wood", [2, 2]);
      apply("brick-walls", "brick-wall-13", [2, 2]);
      apply("outside_bricks", "mixed-brick-wall", [20, 20]);
      apply("windows-frames", "metal-frame", [2, 2]);
      apply("building-frames", "metal-frame", [2, 2]);
      // apply("terrain-floor", "rocky-terrain-02", [10, 10]);

      const windowSection = getSection("windows");
      if (windowSection) {
        for (const mesh of windowSection.meshes) {
          mesh.material = glassMaterial;
        }
      }
    }

    let pane: Pane | null = null;
    let cameraPane: Pane | null = null;
    let storeUnsub: (() => void) | null = null;

    // GUI container — only created in debug mode
    let guiContainer: HTMLDivElement | null = null;
    if (debug) {
      guiContainer = document.createElement("div");
      guiContainer.style.cssText = "position:fixed;top:16px;left:16px;z-index:50;width:240px;display:flex;flex-direction:column;gap:8px;";
      document.body.appendChild(guiContainer);
    }

    //* model
    const modelLoader = new GLTFLoader();
    modelLoader.load(
      "/models/house_construction.glb",
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;
        model.scale.set(0.25, 0.25, 0.25);
        model.position.set(0, -0.5, 1);
        scene.add(model);
        console.log(model);

        populateSections(model);
        applyStartingTextures();
        textureManager.preloadRemainingTextures();
        if (debug) pane = setupTestingGUI(textureManager);

        // Subscribe to store — react to texture and color changes from the UI panel
        storeUnsub = useCustomizerStore.subscribe((state, prevState) => {
          const prevTextures = prevState.textures ?? {};
          const prevColors = prevState.colors ?? {};

          // Texture changes
          for (const sectionId of Object.keys(state.textures)) {
            if (state.textures[sectionId] !== prevTextures[sectionId]) {
              const section = getSection(sectionId);
              if (section && section.meshes.length > 0) {
                const repeat = DEFAULT_REPEATS[sectionId] ?? [2, 2];
                textureManager.applyTexture(section.meshes, state.textures[sectionId], repeat).then(() => {
                  // Re-apply color tint if one is set for this section
                  const color = state.colors?.[sectionId];
                  if (color) {
                    for (const mesh of section.meshes) {
                      const mat = mesh.material as THREE.MeshStandardMaterial;
                      mat.color.set(color);
                      mat.needsUpdate = true;
                    }
                  }
                });
              }
            }
          }

          // Color changes — tint the existing material
          for (const sectionId of Object.keys(state.colors ?? {})) {
            if (state.colors[sectionId] !== prevColors[sectionId]) {
              const section = getSection(sectionId);
              if (section && section.meshes.length > 0) {
                const color = state.colors[sectionId];
                for (const mesh of section.meshes) {
                  const mat = mesh.material as THREE.MeshStandardMaterial;
                  mat.color.set(color ?? "#ffffff");
                  mat.needsUpdate = true;
                }
              }
            }
          }
        });
      },
      undefined,
      (error) => {
        console.error("Failed to load model. Is it inside /public/models/house_construction.glb?", error);
      }
    );

    function setupTestingGUI(tx: TextureManager) {
      const guiPane = new Pane({ title: "Texture Testing", container: guiContainer! });
      
      const concreteOptions: Record<string, string> = {};
      ALL_ENTRIES.filter(e => e.category === "concrete").forEach(entry => { concreteOptions[entry.label] = entry.id; });
      const brickOptions: Record<string, string> = {};
      ALL_ENTRIES.filter(e => e.category === "bricks").forEach(entry => { brickOptions[entry.label] = entry.id; });
      const woodOptions: Record<string, string> = {};
      ALL_ENTRIES.filter(e => e.category === "wood").forEach(entry => { woodOptions[entry.label] = entry.id; });
      const doorOptions: Record<string, string> = {};
      ALL_ENTRIES.filter(e => e.category === "wood" || e.category === "metal").forEach(entry => { doorOptions[entry.label] = entry.id; });

      const PARAMS = {
        exteriorWalls: "painted-plaster-wall",
        floor: "concrete-floor-worn",
        doors: "fine-grained-wood",
        brickWalls: "brick-wall-13",
        outsideBricks: "mixed-brick-wall",
        woodElements: "fine-grained-wood"
      };

      const houseFolder = (guiPane as any).addFolder({ title: "House Sections" });

      const safeApply = (sectionId: string, textureId: string, repeat: [number, number]) => {
        const section = getSection(sectionId);
        if (section && section.meshes.length > 0) {
          tx.applyTexture(section.meshes, textureId, repeat);
        }
      };

      houseFolder.addBinding(PARAMS, "exteriorWalls", { options: concreteOptions, label: "Exterior Walls" }).on("change", (ev: any) => {
        safeApply("exterior-walls", ev.value, [20, 20]);
      });
      houseFolder.addBinding(PARAMS, "floor", { options: concreteOptions, label: "Floor" }).on("change", (ev: any) => {
        safeApply("floor", ev.value, [2, 2]);
      });
      houseFolder.addBinding(PARAMS, "doors", { options: doorOptions, label: "Doors" }).on("change", (ev: any) => {
        safeApply("doors", ev.value, [2, 2]);
      });
      houseFolder.addBinding(PARAMS, "woodElements", { options: woodOptions, label: "Wood Elements" }).on("change", (ev: any) => {
        safeApply("wood-elements", ev.value, [2, 2]);
      });
      houseFolder.addBinding(PARAMS, "brickWalls", { options: brickOptions, label: "Inside Bricks" }).on("change", (ev: any) => {
        safeApply("brick-walls", ev.value, [8, 8]);
      });
      houseFolder.addBinding(PARAMS, "outsideBricks", { options: brickOptions, label: "Outside Bricks" }).on("change", (ev: any) => {
        safeApply("outside_bricks", ev.value, [20, 20]);
      });

      return guiPane;
    }

    let CAM_PARAMS: { posX: number; posY: number; posZ: number } | null = null;
    if (debug) {
      cameraPane = new Pane({ title: "Camera Debug", expanded: true, container: guiContainer! });
      CAM_PARAMS = {
        posX: camera.position.x, posY: camera.position.y, posZ: camera.position.z,
      };
      cameraPane.addBinding(CAM_PARAMS, "posX", { readonly: true });
      cameraPane.addBinding(CAM_PARAMS, "posY", { readonly: true });
      cameraPane.addBinding(CAM_PARAMS, "posZ", { readonly: true });
    }

    //* lights
    const light = new THREE.DirectionalLight(0xffffff, 5);
    light.position.set(3, 3, 3);
    scene.add(light);
    const ambient = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambient);

    console.log(ambient)

    //* resize function
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    //* animation via setAnimationLoop (handles WebGPU frame timing correctly)
    const animate = () => {
      controls.update();

      if (CAM_PARAMS && cameraPane) {
        CAM_PARAMS.posX = +camera.position.x.toFixed(3);
        CAM_PARAMS.posY = +camera.position.y.toFixed(3);
        CAM_PARAMS.posZ = +camera.position.z.toFixed(3);
        cameraPane.refresh();
      }

      renderer.render(scene, camera);
    };

    // WebGPU startup
    const startWebGPU = async () => {
      try {
        await renderer.init();
        if (disposed) return;
        console.log("WebGPU Renderer Initialized");
        renderer.setAnimationLoop(animate);
      } catch (err) {
        console.error("WebGPU Init Error:", err);
      }
    };

    startWebGPU();

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      renderer.setAnimationLoop(null);
      renderer.dispose();

      if (storeUnsub) storeUnsub();
      if (pane) pane.dispose();
      if (cameraPane) cameraPane.dispose();
      if (guiContainer) guiContainer.remove();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full z-0" 
      style={{ display: "block" }}
    />
  );
}
