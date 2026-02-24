import * as THREE from "three";

// ─────────────────────────────────────────────────────────────
// TEXTURE CATEGORIES
// ─────────────────────────────────────────────────────────────
// Each category must match a key in TEXTURE_LIBRARY (see config/textures.ts).
//
// HOW TO ADD A NEW CATEGORY (e.g. "tile"):
//   1. Add "tile" to this union type
//   2. In config/textures.ts, add a `tile` array to TEXTURE_LIBRARY with your TextureEntry items
//   3. In the SECTIONS array below, add "tile" to the allowedCategories of any section
//      that should offer tile textures in the UI
// ─────────────────────────────────────────────────────────────
export type TextureCategory = "bricks" | "concrete" | "wood" | "metal";

// ─────────────────────────────────────────────────────────────
// SECTION TYPE
// ─────────────────────────────────────────────────────────────
export type Section = {
  // Unique identifier — used as the key in the Zustand store (e.g. "exterior-walls")
  id: string;

  // Human-readable name — displayed as the tab label in the CustomizationPanel
  label: string;

  // GLB object names from the 3D model file (house_construction.glb).
  // At runtime, populateSections() looks up each name in the loaded model
  // and pushes the matching meshes into the `meshes` array.
  // TIP: To find object names, load the GLB in Blender or log `model` after GLTFLoader loads it.
  objects: string[];

  // Filled automatically at runtime by populateSections() — do NOT set manually
  meshes: THREE.Mesh[];

  // Controls which texture cards appear in the CustomizationPanel for this section.
  //   - ["concrete"]         → only concrete textures are shown
  //   - ["wood", "metal"]    → both wood and metal textures are shown
  //   - omitted / undefined  → section is HIDDEN from the panel (useful for non-texture
  //                            parts like windows that use a glass material instead)
  allowedCategories?: TextureCategory[];
};

// ─────────────────────────────────────────────────────────────
// SECTIONS ARRAY
// ─────────────────────────────────────────────────────────────
// Each entry here represents a part of the house that can be textured independently.
//
// HOW TO ADD A NEW SECTION:
//   1. Add a new object to this array with a unique `id` and the GLB `objects` names
//   2. Set `allowedCategories` to the texture types you want offered in the UI
//   3. In store/useCustomizerStore.ts, add a default texture for the new section in
//      DEFAULT_TEXTURES and DEFAULT_REPEATS
//   4. The CustomizationPanel will automatically pick it up as a new tab
//
// HOW TO HIDE A SECTION FROM THE UI:
//   - Simply omit `allowedCategories` (or set it to undefined).
//     The section still works for the 3D scene, it just won't appear in the panel.
// ─────────────────────────────────────────────────────────────
export const SECTIONS: Section[] = [
  {
    id: "exterior-walls",
    label: "Exterior Walls",
    objects: [
      "mainStructure_1f_back",
      "mainStructure_f1",
      "mainStructure_f1_entrance",
      "mainStructure_f2_right2",
      "Plane003_2",
      "Cube005",
      "Cube004",
    ],
    meshes: [],
    allowedCategories: ["concrete"],
  },
  {
    id: "windows",
    label: "Windows",
    objects: [
      "Plane003_1",
      "Plane006_1"
    ],
    meshes: [],
    // No allowedCategories — windows use glass material, not swappable textures
  },
  {
    id: "windows-frames",
    label: "Windows Frames",
    objects: [
      "Plane003",
      "Plane006",
    ],
    meshes: [],
    allowedCategories: ["metal"],
  },
  {
    id: "building-frames",
    label: "Building Frames",
    objects: [
      "Cube005_1",
      "Cube004_1",
    ],
    meshes: [],
    allowedCategories: ["metal"],
  },
  {
    id: "doors",
    label: "Doors",
    objects: ["wood_door_entrance", "wood_PanelDoor_f1_left", "doorBell"],
    meshes: [],
    allowedCategories: ["wood", "metal"],
  },
  {
    id: "floor",
    label: "Floor",
    objects: ["floor_f1", "ourside_road-stairs"],
    meshes: [],
    allowedCategories: ["concrete"],
  },
 
  {
    id: "wood-elements",
    label: "Wood Elements",
    objects: ["wood_Pannels", "wood_supportColumns"],
    meshes: [],
    allowedCategories: ["wood"],
  },
  {
    id: "brick-walls",
    label: "Brick Panels",
    objects: ["brick_walls"],
    meshes: [],
    allowedCategories: ["bricks"],
  },
  {
    id: "outside_bricks",
    label: "Outside Bricks",
    objects: ["outside_bricks"],
    meshes: [],
    allowedCategories: ["bricks"],
  },
  // {
  //   id: "terrain-floor",
  //   label: "Terrain Floor",
  //   objects: ["terrain_floor"],
  //   meshes: [],
  // },
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

// Pre-filtered list of sections that appear as tabs in the CustomizationPanel.
// A section needs at least one allowedCategory to be "customizable".
// Usage: import { CUSTOMIZABLE_SECTIONS } from "./config/sections"
//        then map over it to render tabs / dropdowns.
export const CUSTOMIZABLE_SECTIONS = SECTIONS.filter(
  (s) => s.allowedCategories && s.allowedCategories.length > 0,
);
