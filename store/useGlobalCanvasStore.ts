import { create } from "zustand";
import type * as THREE from "three";

export type CanvasItem = {
  id: string;
  element: HTMLElement;
  mesh: THREE.Mesh;
  width: number;
  height: number;
  x: number;
  y: number;
  update?: (dt: number) => void;
  dispose?: () => void;
};

type GlobalCanvasState = {
  items: Map<string, CanvasItem>;
  registerItem: (item: CanvasItem) => void;
  unregisterItem: (id: string) => void;
};

export const useGlobalCanvasStore = create<GlobalCanvasState>((set, get) => ({
  items: new Map(),
  registerItem: (item) =>
    set((state) => {
      const next = new Map(state.items);
      next.set(item.id, item);
      return { items: next };
    }),
  unregisterItem: (id) =>
    set((state) => {
      const next = new Map(state.items);
      const item = next.get(id);
      if (item) {
        item.dispose?.();
        next.delete(id);
      }
      return { items: next };
    }),
}));
