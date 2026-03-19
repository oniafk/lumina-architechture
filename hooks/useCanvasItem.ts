"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  useGlobalCanvasStore,
  type CanvasItem,
} from "@/store/useGlobalCanvasStore";

type SetupResult = {
  update?: (dt: number) => void;
  dispose?: () => void;
};

type SetupFn = (
  geometry: THREE.PlaneGeometry,
  sharedUniforms: {
    u_resolution: { value: THREE.Vector2 };
    u_scrollOffset: { value: THREE.Vector2 };
    u_time: { value: number };
    u_strength: { value: number };
  }
) => {
  mesh: THREE.Mesh;
} & SetupResult;

/**
 * Hook for DOM sections to register themselves with the global WebGL canvas.
 *
 * Usage:
 * ```tsx
 * const ref = useCanvasItem("my-effect", (geometry) => {
 *   const material = new THREE.ShaderMaterial({ ... });
 *   const mesh = new THREE.Mesh(geometry, material);
 *   return {
 *     mesh,
 *     update(dt) { ... },
 *     dispose() { material.dispose(); },
 *   };
 * });
 * return <div ref={ref} />;
 * ```
 */
export function useCanvasItem(id: string, setupFn: SetupFn) {
  const elementRef = useRef<HTMLDivElement>(null);
  const setupFnRef = useRef(setupFn);
  setupFnRef.current = setupFn;

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const geometry = new THREE.PlaneGeometry(1, 1, 128, 128);

    // Placeholder shared uniforms — GlobalWebGLCanvas will overwrite these
    // when the mesh is added to the scene
    const placeholderShared = {
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_scrollOffset: { value: new THREE.Vector2(0, 0) },
      u_time: { value: 0 },
      u_strength: { value: 0 },
    };

    const result = setupFnRef.current(geometry, placeholderShared);

    const item: CanvasItem = {
      id,
      element: el,
      mesh: result.mesh,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      update: result.update,
      dispose: () => {
        result.dispose?.();
        geometry.dispose();
      },
    };

    result.mesh.frustumCulled = false;

    console.log(`[useCanvasItem] registering "${id}"`, {
      element: el.tagName,
      rect: el.getBoundingClientRect(),
    });

    useGlobalCanvasStore.getState().registerItem(item);

    return () => {
      console.log(`[useCanvasItem] unregistering "${id}"`);
      useGlobalCanvasStore.getState().unregisterItem(id);
    };
  }, [id]);

  return elementRef;
}
