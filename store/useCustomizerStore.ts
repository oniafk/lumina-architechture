import { create } from "zustand";

type TextureMap = Record<string, string>; // sectionId → textureId

type RepeatMap = Record<string, [number, number]>; // sectionId → [x, y]

type ColorMap = Record<string, string | null>; // sectionId → hex color or null (no tint)

type CustomizerState = {
  activeSection: string;
  textures: TextureMap;
  repeats: RepeatMap;
  colors: ColorMap;
  setActiveSection: (id: string) => void;
  setTexture: (sectionId: string, textureId: string) => void;
  setColor: (sectionId: string, color: string | null) => void;
};

export const DEFAULT_TEXTURES: TextureMap = {
  "exterior-walls": "painted-plaster-wall",
  "doors": "fine-grained-wood",
  "floor": "concrete-floor-worn",
  "ceiling": "fine-grained-wood",
  "wood-elements": "fine-grained-wood",
  "brick-walls": "brick-wall-13",
  "outside_bricks": "mixed-brick-wall",
  "windows-frames": "metal-frame",
  "building-frames": "metal-frame",
};

export const DEFAULT_REPEATS: RepeatMap = {
  "exterior-walls": [2, 2],
  "doors": [2, 2],
  "floor": [2, 2],
  "ceiling": [2, 2],
  "wood-elements": [2, 2],
  "brick-walls": [2, 2],
  "outside_bricks": [20, 20],
  "windows-frames": [2, 2],
  "building-frames": [2, 2],
};

// Preset color swatches available for tinting textures
export const COLOR_SWATCHES = [
  { hex: "#FFFFFF", label: "White" },
  { hex: "#EFEFEF", label: "Off White" },
  { hex: "#D4D4D4", label: "Light Grey" },
  { hex: "#8E8E8E", label: "Grey" },
  { hex: "#3D4045", label: "Dark Grey" },
  { hex: "#5C5346", label: "Brown" },
  { hex: "#3B4C56", label: "Slate" },
  { hex: "#8B7355", label: "Tan" },
  { hex: "#C4A882", label: "Sand" },
] as const;

export const useCustomizerStore = create<CustomizerState>((set) => ({
  activeSection: "exterior-walls",
  textures: { ...DEFAULT_TEXTURES },
  repeats: { ...DEFAULT_REPEATS },
  colors: {},
  setActiveSection: (id) => set({ activeSection: id }),
  setTexture: (sectionId, textureId) =>
    set((state) => ({
      textures: { ...state.textures, [sectionId]: textureId },
    })),
  setColor: (sectionId, color) =>
    set((state) => ({
      colors: { ...state.colors, [sectionId]: color },
    })),
}));
