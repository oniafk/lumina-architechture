import * as THREE from "three/webgpu";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { TextureManager, populateSections, getSection, ALL_ENTRIES } from "./TextureManager";
import { Pane } from "tweakpane";
import "./style.css";

const PI = Math.PI;


const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("App container not found");
}

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
const renderer = new THREE.WebGPURenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);
await renderer.init();

//* HDRI environment
const hdrLoader = new HDRLoader();
hdrLoader.load("/HDRI/lonely_road_afternoon_puresky_1k.hdr", (hdrTexture) => {
  hdrTexture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = hdrTexture;
  scene.background = hdrTexture;
});

//* texture manager
const texLoader = new THREE.TextureLoader();
const textureManager = new TextureManager(texLoader);

//* controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Limit vertical angle to prevent camera going below the ground
controls.maxPolarAngle = Math.PI / 2 - 0.05; // Slightly less than 90 degrees

// Limit zoom to prevent going inside the model
controls.minDistance = 3;
controls.maxDistance = 8;

// Disable panning to prevent dragging the orbit center into the geometry
controls.enablePan = false;

//* floor - planeGeometry
const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
const floorMesh = new THREE.Mesh(floorGeometry, floorMat);
floorMesh.rotation.x = -PI / 2;
floorMesh.position.set(0, -0.5, 0);
scene.add(floorMesh);

// Apply terrain texture, then add alpha map on top
const floorAlphaTexture = texLoader.load("/textures/floor/alpha.jpg");
floorAlphaTexture.flipY = false;
textureManager.applyTexture([floorMesh], "rocky-terrain-02", [10, 10]).then(() => {
  const mat = floorMesh.material as THREE.MeshStandardMaterial;
  mat.alphaMap = floorAlphaTexture;
  mat.transparent = true;
  mat.needsUpdate = true;
});

//* materials (special-case)
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

//* starting textures per section
function applyStartingTextures(): void {
  // Textured sections — load async, model shows default white until ready
  textureManager.applyTexture(
    getSection("exterior-walls")!.meshes,
    "painted-plaster-wall",
    [2, 2],
  );
  textureManager.applyTexture(
    getSection("doors")!.meshes,
    "fine-grained-wood",
    [2, 2],
  );
  textureManager.applyTexture(
    getSection("floor")!.meshes,
    "concrete-floor-worn",
    [2, 2],
  );
  textureManager.applyTexture(
    getSection("ceiling")!.meshes,
    "fine-grained-wood",
    [2, 2],
  );
  textureManager.applyTexture(
    getSection("wood-elements")!.meshes,
    "fine-grained-wood",
    [2, 2],
  );
  textureManager.applyTexture(
    getSection("brick-walls")!.meshes,
    "brick-wall-13",
    [2, 2],
  );
  textureManager.applyTexture(
    getSection("outside_bricks")!.meshes,
    "mixed-brick-wall",
    [20, 20], // Increase these numbers to make the texture repeat more (appear smaller!)
  );
  textureManager.applyTexture(
    getSection("windows-frames")!.meshes,
    "metal-frame",
    [2, 2],
  )
  textureManager.applyTexture(
    getSection("building-frames")!.meshes,
    "metal-frame",
    [2, 2],
  )

  textureManager.applyTexture(
    getSection("terrain-floor")!.meshes,
    "rocky-terrain-02",
    [10, 10],
  );

  // Windows get glass, not a texture
  const windowSection = getSection("windows");
  if (windowSection) {
    for (const mesh of windowSection.meshes) {
      mesh.material = glassMaterial;
    }
  }
}

//* model
const modelLoader = new GLTFLoader();
modelLoader.load(
  "/models/house_construction.glb",
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.25, 0.25, 0.25);
    model.position.set(0, -0.5, 1);
    scene.add(model);

    console.log(model)

    // Fill every section's meshes[] from the loaded model
    populateSections(model);

    // Apply starting appearance
    applyStartingTextures();

    // Start background prefetch of all other textures so they are instant in the UI
    textureManager.preloadRemainingTextures();

    // Setup Testing UI
    setupTestingGUI();
  },
  undefined,
  (error) => {
    console.error("Failed to load model", error);
  },
);

function setupTestingGUI() {
  const pane = new Pane({ title: "Texture Testing" });

  const concreteOptions: Record<string, string> = {};
  ALL_ENTRIES.filter(e => e.category === "concrete").forEach(entry => { concreteOptions[entry.label] = entry.id; });

  const brickOptions: Record<string, string> = {};
  ALL_ENTRIES.filter(e => e.category === "bricks").forEach(entry => { brickOptions[entry.label] = entry.id; });

  const woodOptions: Record<string, string> = {};
  ALL_ENTRIES.filter(e => e.category === "wood").forEach(entry => { woodOptions[entry.label] = entry.id; });

  const doorOptions: Record<string, string> = {};
  ALL_ENTRIES.filter(e => e.category === "wood" || e.category === "metal").forEach(entry => { doorOptions[entry.label] = entry.id; });

  // State object to hold the current selected textures
  const PARAMS = {
    exteriorWalls: "painted-plaster-wall",
    floor: "concrete-floor-worn",
    doors: "fine-grained-wood",
    brickWalls: "brick-wall-13",
    outsideBricks: "mixed-brick-wall",
    woodElements: "fine-grained-wood"
  };

  const houseFolder = (pane as any).addFolder({ title: "House Sections" });

  houseFolder.addBinding(PARAMS, "exteriorWalls", {
    options: concreteOptions,
    label: "Exterior Walls"
  }).on("change", (ev: { value: string }) => {
    textureManager.applyTexture(getSection("exterior-walls")!.meshes, ev.value, [20, 20]);
  });

  houseFolder.addBinding(PARAMS, "floor", {
    options: concreteOptions, // Or a mix if you like, keeping it simple
    label: "Floor"
  }).on("change", (ev: { value: string }) => {
    textureManager.applyTexture(getSection("floor")!.meshes, ev.value, [2, 2]);
  });

  houseFolder.addBinding(PARAMS, "doors", {
    options: doorOptions,
    label: "Doors"
  }).on("change", (ev: { value: string }) => {
    textureManager.applyTexture(getSection("doors")!.meshes, ev.value, [2, 2]);
  });

  houseFolder.addBinding(PARAMS, "woodElements", {
    options: woodOptions,
    label: "Wood Elements"
  }).on("change", (ev: { value: string }) => {
    textureManager.applyTexture(getSection("wood-elements")!.meshes, ev.value, [2, 2]);
  });

  houseFolder.addBinding(PARAMS, "brickWalls", {
    options: brickOptions,
    label: "Inside Bricks"
  }).on("change", (ev: { value: string }) => {
    textureManager.applyTexture(getSection("brick-walls")!.meshes, ev.value, [8, 8]);
  });

  houseFolder.addBinding(PARAMS, "outsideBricks", {
    options: brickOptions,
    label: "Outside Bricks"
  }).on("change", (ev: { value: string }) => {
    textureManager.applyTexture(getSection("outside_bricks")!.meshes, ev.value, [20, 20]);
  });
}

//* camera debug panel
const cameraPane = new Pane({ title: "Camera Debug", expanded: true });

const CAM_PARAMS = {
  posX: camera.position.x,
  posY: camera.position.y,
  posZ: camera.position.z,
  targetX: controls.target.x,
  targetY: controls.target.y,
  targetZ: controls.target.z,
  distance: camera.position.distanceTo(controls.target),
  distX: Math.abs(camera.position.x - controls.target.x),
  distY: Math.abs(camera.position.y - controls.target.y),
  distZ: Math.abs(camera.position.z - controls.target.z),
};

const posFolder = cameraPane.addFolder({ title: "Camera Position" });
const bPosX = posFolder.addBinding(CAM_PARAMS, "posX", { readonly: true, label: "X" });
const bPosY = posFolder.addBinding(CAM_PARAMS, "posY", { readonly: true, label: "Y" });
const bPosZ = posFolder.addBinding(CAM_PARAMS, "posZ", { readonly: true, label: "Z" });

const targetFolder = cameraPane.addFolder({ title: "Look-At Target" });
const bTgtX = targetFolder.addBinding(CAM_PARAMS, "targetX", { readonly: true, label: "X" });
const bTgtY = targetFolder.addBinding(CAM_PARAMS, "targetY", { readonly: true, label: "Y" });
const bTgtZ = targetFolder.addBinding(CAM_PARAMS, "targetZ", { readonly: true, label: "Z" });

const distFolder = cameraPane.addFolder({ title: "Distances" });
const bDist = distFolder.addBinding(CAM_PARAMS, "distance", { readonly: true, label: "Total" });
const bDistX = distFolder.addBinding(CAM_PARAMS, "distX", { readonly: true, label: "dX" });
const bDistY = distFolder.addBinding(CAM_PARAMS, "distY", { readonly: true, label: "dY" });
const bDistZ = distFolder.addBinding(CAM_PARAMS, "distZ", { readonly: true, label: "dZ" });

const cameraBindings = [bPosX, bPosY, bPosZ, bTgtX, bTgtY, bTgtZ, bDist, bDistX, bDistY, bDistZ];

function updateCameraDebug() {
  CAM_PARAMS.posX = +camera.position.x.toFixed(3);
  CAM_PARAMS.posY = +camera.position.y.toFixed(3);
  CAM_PARAMS.posZ = +camera.position.z.toFixed(3);
  CAM_PARAMS.targetX = +controls.target.x.toFixed(3);
  CAM_PARAMS.targetY = +controls.target.y.toFixed(3);
  CAM_PARAMS.targetZ = +controls.target.z.toFixed(3);
  CAM_PARAMS.distance = +camera.position.distanceTo(controls.target).toFixed(3);
  CAM_PARAMS.distX = +Math.abs(camera.position.x - controls.target.x).toFixed(3);
  CAM_PARAMS.distY = +Math.abs(camera.position.y - controls.target.y).toFixed(3);
  CAM_PARAMS.distZ = +Math.abs(camera.position.z - controls.target.z).toFixed(3);
  for (const b of cameraBindings) b.refresh();
}

//* lights
const light = new THREE.DirectionalLight(0xffffff, 5);
light.position.set(3, 3, 3);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambient);

const clock = new THREE.Clock();

//* resize function
const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

window.addEventListener("resize", onResize);

//* animation
const animate = () => {
  clock.getElapsedTime();
  controls.update();
  updateCameraDebug();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

// Export for future UI wiring
export { textureManager, getSection };
