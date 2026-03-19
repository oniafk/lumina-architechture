"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGlobalCanvasStore } from "@/store/useGlobalCanvasStore";

const PADDING_RATIO = 0.25;

export default function GlobalWebGLCanvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapperEl = wrapperRef.current;
    if (!wrapperEl) return;
    const wrapper = wrapperEl;

    console.log("[GlobalCanvas] initializing...");

    // --- Create canvas programmatically ---
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    wrapper.appendChild(canvas);

    // --- Three.js setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

    const dpr = Math.min(window.devicePixelRatio, 2);
    const resolution = new THREE.Vector2(1, 1);
    const scrollOffset = new THREE.Vector2(0, 0);

    // --- State ---
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let padding = viewportHeight * PADDING_RATIO;
    let prevScrollY = window.scrollY;
    let strength = 0;
    let time = performance.now() / 1000;
    let disposed = false;

    // Track meshes currently in the scene: id → mesh reference
    const sceneMeshes = new Map<string, THREE.Mesh>();

    // --- Sizing ---
    function onResize() {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      padding = viewportHeight * PADDING_RATIO;

      const canvasHeight = viewportHeight * (1 + PADDING_RATIO * 2);

      resolution.set(viewportWidth, canvasHeight);

      renderer.setSize(viewportWidth * dpr, canvasHeight * dpr, false);
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${canvasHeight}px`;

      // Keep wrapper covering the full document
      const docHeight = document.documentElement.scrollHeight;
      wrapper.style.height = `${docHeight}px`;
    }

    function initMesh(item: { mesh: THREE.Mesh }, id: string) {
      scene.add(item.mesh);
      sceneMeshes.set(id, item.mesh);

      // Share the same Vector2 instances so updates propagate automatically
      const mat = item.mesh.material as THREE.ShaderMaterial;
      if (mat.uniforms) {
        if (mat.uniforms.u_resolution) {
          mat.uniforms.u_resolution.value = resolution;
        }
        if (mat.uniforms.u_scrollOffset) {
          mat.uniforms.u_scrollOffset.value = scrollOffset;
        }
      }

      console.log(`[GlobalCanvas] added mesh "${id}" to scene`);
    }

    // --- Animation loop ---
    function animate() {
      if (disposed) return;
      requestAnimationFrame(animate);

      const scrollY = window.scrollY;
      const scrollDelta = scrollY - prevScrollY;

      // Time
      const newTime = performance.now() / 1000;
      const dt = newTime - time;
      time = newTime;

      // Scroll strength
      const targetStrength = (Math.abs(scrollDelta) * 10) / viewportHeight;
      strength *= Math.exp(-dt * 10);
      strength += Math.min(targetStrength, 5);

      // Update shared uniforms
      scrollOffset.set(0, scrollY - padding);

      // Position canvas to follow scroll
      canvas.style.transform = `translate(0px, ${scrollY - padding}px)`;

      // Sync items from store → scene
      const items = useGlobalCanvasStore.getState().items;

      // Add new meshes / swap changed meshes
      items.forEach((item, id) => {
        const existing = sceneMeshes.get(id);
        if (!existing) {
          // New item
          initMesh(item, id);
        } else if (existing !== item.mesh) {
          // Item re-registered with a new mesh (e.g. strict mode remount)
          scene.remove(existing);
          initMesh(item, id);
        }
      });

      // Remove stale meshes no longer in the store
      for (const [id, mesh] of sceneMeshes) {
        if (!items.has(id)) {
          scene.remove(mesh);
          sceneMeshes.delete(id);
          console.log(`[GlobalCanvas] removed mesh "${id}" from scene`);
        }
      }

      // Update each item
      const canvasTop = scrollOffset.y;
      const canvasBottom = canvasTop + resolution.y;

      items.forEach((item) => {
        const rect = item.element.getBoundingClientRect();
        item.width = rect.width;
        item.height = rect.height;
        item.x = rect.left + window.scrollX;
        item.y = rect.top + scrollY;

        const mat = item.mesh.material as THREE.ShaderMaterial;
        if (mat.uniforms.u_domXY) {
          mat.uniforms.u_domXY.value.set(item.x, item.y);
        }
        if (mat.uniforms.u_domWH) {
          mat.uniforms.u_domWH.value.set(item.width, item.height);
        }

        // Visibility culling — check if the mesh has shader-driven movement
        // (u_scrollTravel > 0), if so skip culling since the shader moves it
        const mat2 = item.mesh.material as THREE.ShaderMaterial;
        const hasShaderMovement = mat2.uniforms?.u_scrollTravel?.value > 0;

        if (hasShaderMovement) {
          item.mesh.visible = true;
        } else {
          item.mesh.visible =
            item.y < canvasBottom && item.y + item.height > canvasTop;
        }

        if (item.mesh.visible) {
          item.update?.(dt);
        }
      });

      renderer.render(scene, camera);
      prevScrollY = scrollY;
    }

    // --- Event listeners ---
    window.addEventListener("resize", onResize);

    const resizeObserver = new ResizeObserver(() => {
      if (!disposed) {
        const docHeight = document.documentElement.scrollHeight;
        wrapper.style.height = `${docHeight}px`;
      }
    });
    resizeObserver.observe(document.body);

    renderer.setClearColor(0x000000, 0);

    onResize();
    animate();

    console.log("[GlobalCanvas] started. Canvas:", canvas.style.width, "x", canvas.style.height);

    return () => {
      console.log("[GlobalCanvas] disposing...");
      disposed = true;
      window.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
      renderer.dispose();
      if (wrapper.contains(canvas)) {
        wrapper.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      data-global-canvas
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 30,
      }}
    />
  );
}
