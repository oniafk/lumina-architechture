/**
 * _arm textures pack three PBR maps into one file:
 *   R channel → Ambient Occlusion
 *   G channel → Roughness
 *   B channel → Metalness
 *
 * Three.js MeshStandardMaterial accepts these via:
 *   aoMap, roughnessMap, metalnessMap
 * You must split the channels at load time (or use a custom shader uniform).
 * The TextureManager should handle this.
 */

export type TextureEntry = {
  id: string;
  label: string;
  category: "bricks" | "concrete" | "wood" | "metal";
  maps: {
    color: string;
    normal?: string;
    arm?: string;  // packed AO (R) + Roughness (G) + Metalness (B)
    displacement?: string;
    roughness?: string;
    metalness?: string;
    ao?: string;
  };
};

export type TextureLibrary = {
  bricks: TextureEntry[];
  concrete: TextureEntry[];
  wood: TextureEntry[];
  aerial: TextureEntry[];
};

export const TEXTURE_LIBRARY: TextureLibrary = {
  bricks: [
    {
      id: "brick-wall-13",
      label: "Brick Wall",
      category: "bricks",
      maps: {
        color: "/textures/bricks/brick_wall_13_1k/brick_wall_13_diff_1k.jpg",
        normal: "/textures/bricks/brick_wall_13_1k/brick_wall_13_nor_gl_1k.jpg",
        arm: "/textures/bricks/brick_wall_13_1k/brick_wall_13_arm_1k.jpg",
      },
    },
    {
      id: "medieval-blocks-03",
      label: "Medieval Blocks",
      category: "bricks",
      maps: {
        color:
          "/textures/bricks/medieval_blocks_03_1k/medieval_blocks_03_diff_1k.jpg",
        normal:
          "/textures/bricks/medieval_blocks_03_1k/medieval_blocks_03_nor_gl_1k.jpg",
        arm: "/textures/bricks/medieval_blocks_03_1k/medieval_blocks_03_arm_1k.jpg",
      },
    },
    {
      id: "mixed-brick-wall",
      label: "Mixed Brick Wall",
      category: "bricks",
      maps: {
        color:
          "/textures/bricks/mixed_brick_wall_1k/mixed_brick_wall_diff_1k.jpg",
        normal:
          "/textures/bricks/mixed_brick_wall_1k/mixed_brick_wall_nor_gl_1k.jpg",
        arm: "/textures/bricks/mixed_brick_wall_1k/mixed_brick_wall_arm_1k.jpg",
      },
    },
    {
      id: "rough-block-wall",
      label: "Rough Block Wall",
      category: "bricks",
      maps: {
        color:
          "/textures/bricks/rough_block_wall_1k/rough_block_wall_diff_1k.jpg",
        normal:
          "/textures/bricks/rough_block_wall_1k/rough_block_wall_nor_gl_1k.jpg",
        arm: "/textures/bricks/rough_block_wall_1k/rough_block_wall_arm_1k.jpg",
      },
    },
    {
      id: "sandstone-blocks-05",
      label: "Sandstone Blocks",
      category: "bricks",
      maps: {
        color:
          "/textures/bricks/sandstone_blocks_05_1k/sandstone_blocks_05_diff_1k.jpg",
        normal:
          "/textures/bricks/sandstone_blocks_05_1k/sandstone_blocks_05_nor_gl_1k.jpg",
        arm: "/textures/bricks/sandstone_blocks_05_1k/sandstone_blocks_05_arm_1k.jpg",
      },
    },
    {
      id: "seaworn-sandstone-brick",
      label: "Seaworn Sandstone",
      category: "bricks",
      maps: {
        color:
          "/textures/bricks/seaworn_sandstone_brick_1k/seaworn_sandstone_brick_diff_1k.jpg",
        normal:
          "/textures/bricks/seaworn_sandstone_brick_1k/seaworn_sandstone_brick_nor_gl_1k.jpg",
        arm: "/textures/bricks/seaworn_sandstone_brick_1k/seaworn_sandstone_brick_arm_1k.jpg",
      },
    },
    {
      id: "whitewashed-brick",
      label: "Whitewashed Brick",
      category: "bricks",
      maps: {
        color:
          "/textures/bricks/whitewashed_brick_1k/whitewashed_brick_diff_1k.jpg",
        normal:
          "/textures/bricks/whitewashed_brick_1k/whitewashed_brick_nor_gl_1k.jpg",
        arm: "/textures/bricks/whitewashed_brick_1k/whitewashed_brick_arm_1k.jpg",
      },
    },
  ],

  concrete: [
    {
      id: "concrete-layers",
      label: "Concrete Layers",
      category: "concrete",
      maps: {
        color:
          "/textures/concrete/concrete_layers_1k/concrete_layers_diff_1k.jpg",
        normal:
          "/textures/concrete/concrete_layers_1k/concrete_layers_nor_gl_1k.jpg",
        arm: "/textures/concrete/concrete_layers_1k/concrete_layers_arm_1k.jpg",
      },
    },
    {
      id: "concrete-floor-worn",
      label: "Concrete Floor Worn",
      category: "concrete",
      maps: {
        color:
          "/textures/concrete/concrete_floor_worn_001_1k/concrete_floor_worn_001_diff_1k.jpg",
        normal:
          "/textures/concrete/concrete_floor_worn_001_1k/concrete_floor_worn_001_nor_gl_1k.jpg",
        arm: "/textures/concrete/concrete_floor_worn_001_1k/concrete_floor_worn_001_arm_1k.jpg",
      },
    },
    {
      id: "coral-fort-wall",
      label: "Coral Fort Wall",
      category: "concrete",
      maps: {
        color:
          "/textures/concrete/coral_fort_wall_01_1k/coral_fort_wall_01_diff_1k.jpg",
        normal:
          "/textures/concrete/coral_fort_wall_01_1k/coral_fort_wall_01_nor_gl_1k.jpg",
        arm: "/textures/concrete/coral_fort_wall_01_1k/coral_fort_wall_01_arm_1k.jpg",
      },
    },
    {
      id: "cracked-concrete-wall",
      label: "Cracked Concrete",
      category: "concrete",
      maps: {
        color:
          "/textures/concrete/cracked_concrete_wall_1k/cracked_concrete_wall_diff_1k.jpg",
        normal:
          "/textures/concrete/cracked_concrete_wall_1k/cracked_concrete_wall_nor_gl_1k.jpg",
        arm: "/textures/concrete/cracked_concrete_wall_1k/cracked_concrete_wall_arm_1k.jpg",
      },
    },
    {
      id: "painted-plaster-wall",
      label: "Painted Plaster",
      category: "concrete",
      maps: {
        color:
          "/textures/concrete/painted_plaster_wall_1k/painted_plaster_wall_diff_1k.jpg",
        normal:
          "/textures/concrete/painted_plaster_wall_1k/painted_plaster_wall_nor_gl_1k.jpg",
        arm: "/textures/concrete/painted_plaster_wall_1k/painted_plaster_wall_arm_1k.jpg",
      },
    },
    {
      id: "plastered-stone-wall",
      label: "Plastered Stone",
      category: "concrete",
      maps: {
        color:
          "/textures/concrete/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.jpg",
        normal:
          "/textures/concrete/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.jpg",
        arm: "/textures/concrete/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.jpg",
      },
    },
    {
      id: "plastered-wall-03",
      label: "Plastered Wall",
      category: "concrete",
      maps: {
        color:
          "/textures/concrete/plastered_wall_03_1k/plastered_wall_03_diff_1k.jpg",
        normal:
          "/textures/concrete/plastered_wall_03_1k/plastered_wall_03_nor_gl_1k.jpg",
        arm: "/textures/concrete/plastered_wall_03_1k/plastered_wall_03_arm_1k.jpg",
      },
    },
    {
      id: "scuffed-cement",
      label: "Scuffed Cement",
      category: "concrete",
      maps: {
        color:
          "/textures/concrete/scuffed_cement_1k/scuffed_cement_diff_1k.jpg",
        normal:
          "/textures/concrete/scuffed_cement_1k/scuffed_cement_nor_gl_1k.jpg",
        arm: "/textures/concrete/scuffed_cement_1k/scuffed_cement_arm_1k.jpg",
      },
    },
  ],

  wood: [
    {
      id: "black-painted-planks",
      label: "Black Painted Planks",
      category: "wood",
      maps: {
        color:
          "/textures/wood/black_painted_planks_1k/black_painted_planks_diff_1k.jpg",
        normal:
          "/textures/wood/black_painted_planks_1k/black_painted_planks_nor_gl_1k.jpg",
        arm: "/textures/wood/black_painted_planks_1k/black_painted_planks_arm_1k.jpg",
      },
    },
    {
      id: "fine-grained-wood",
      label: "Fine Grained Wood",
      category: "wood",
      maps: {
        color:
          "/textures/wood/fine_grained_wood_1k/fine_grained_wood_col_1k.jpg",
        normal:
          "/textures/wood/fine_grained_wood_1k/fine_grained_wood_nor_gl_1k.jpg",
        arm: "/textures/wood/fine_grained_wood_1k/fine_grained_wood_arm_1k.jpg",
      },
    },
    {
      id: "laminate-floor",
      label: "Laminate Floor",
      category: "wood",
      maps: {
        color:
          "/textures/wood/laminate_floor_1k/laminate_floor_diff_1k.jpg",
        normal:
          "/textures/wood/laminate_floor_1k/laminate_floor_nor_gl_1k.jpg",
        arm: "/textures/wood/laminate_floor_1k/laminate_floor_arm_1k.jpg",
      },
    },
    {
      id: "wood-peeling-paint-weathered",
      label: "Peeling Paint Weathered",
      category: "wood",
      maps: {
        color:
          "/textures/wood/wood_peeling_paint_weathered_1k/wood_peeling_paint_weathered_diff_1k.jpg",
        normal:
          "/textures/wood/wood_peeling_paint_weathered_1k/wood_peeling_paint_weathered_nor_gl_1k.jpg",
        arm: "/textures/wood/wood_peeling_paint_weathered_1k/wood_peeling_paint_weathered_arm_1k.jpg",
      },
    },
    {
      id: "metal-frame",
      label: "Metal Frame",
      category: "metal",
      maps: {
        color:
          "/textures/metal/Metal03_col.jpg",
        displacement:
          "/textures/metal/Metal03_disp.jpg",
        roughness: "/textures/metal/Metal03_met-Metal03_rgh.png",

      },
    }
  ],

  aerial: [
    {
      id: "rocky-terrain-02",
      label: "Rocky Terrain",
      category: "bricks",
      maps: {
        color:
          "/textures/aerial/rocky_terrain_02_1k/rocky_terrain_02_diff_1k.jpg",
        normal:
          "/textures/aerial/rocky_terrain_02_1k/rocky_terrain_02_nor_gl_1k.jpg",
        arm: "/textures/aerial/rocky_terrain_02_1k/rocky_terrain_02_arm_1k.jpg",
      },
    },
  ],
};
