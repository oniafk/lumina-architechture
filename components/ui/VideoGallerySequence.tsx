"use client";

import { useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useCanvasItem } from "@/hooks/useCanvasItem";
import {
  createScrollVideoMesh,
  type ScrollVideoInstance,
} from "./scroll-video";

export default function VideoGallerySequence({
  trackerStyle,
  trackerClassName = "",
}: {
  trackerStyle?: React.CSSProperties;
  trackerClassName?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const debugRef = useRef({ progress: 0, scrollRange: 0, hasInstance: false, hasEl: false, sectionH: 0 });
  const debugElRef = useRef<HTMLDivElement>(null);

  const setup = useCallback(
    (geometry: Parameters<Parameters<typeof useCanvasItem>[1]>[0]) => {
      const instance = createScrollVideoMesh(geometry, {
        onLoadComplete: () => setLoaded(true),
      });

      let sectionEl: HTMLElement | null = null;

      return {
        mesh: instance.mesh,
        update: (dt: number) => {
          // Lazy lookup
          if (!sectionEl) {
            const tracker = document.querySelector("[data-video-tracker]");
            sectionEl = tracker?.closest("section") ?? null;
          }

          if (sectionEl) {
            const rect = sectionEl.getBoundingClientRect();
            const scrollRange = rect.height - window.innerHeight;

            if (scrollRange > 0) {
              const scrolled = -rect.top;
              // Raw progress (unclamped) — lets the vertex shader track scroll
              // past the section so the mesh scrolls away instead of sticking
              const rawProgress = Math.max(0, scrolled / scrollRange);
              // Clamped progress for frame textures (0–1 range only)
              const progress = Math.min(rawProgress, 1);
              instance.setTargetProgress(progress);

              // Set shader uniforms for scroll-driven movement
              const mat = instance.mesh.material as THREE.ShaderMaterial;
              mat.uniforms.u_scrollProgress.value = rawProgress;
              mat.uniforms.u_scrollTravel.value = scrollRange;

              debugRef.current = {
                progress,
                scrollRange,
                hasInstance: true,
                hasEl: true,
                sectionH: rect.height,
              };
            }
          }

          instance.update(dt);

          if (debugElRef.current) {
            const d = debugRef.current;
            debugElRef.current.textContent =
              `progress: ${d.progress.toFixed(4)}\n` +
              `scrollRange: ${d.scrollRange.toFixed(0)}\n` +
              `sectionH: ${d.sectionH.toFixed(0)}\n` +
              `hasInstance: ${d.hasInstance}\n` +
              `hasEl: ${d.hasEl}\n` +
              `frame: ${Math.floor(d.progress * 119)}`;
          }
        },
        dispose: () => {
          instance.dispose();
        },
      };
    },
    []
  );

  const canvasRef = useCanvasItem("scroll-video", setup);

  return (
    <>
      <div
        ref={canvasRef}
        data-video-tracker
        className={`${trackerClassName} transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={trackerStyle}
      />
      {/* Debug overlay — remove after fixing */}
      <div
        ref={debugElRef}
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          background: "rgba(0,0,0,0.85)",
          color: "#0f0",
          padding: "12px 16px",
          borderRadius: 8,
          fontSize: 12,
          fontFamily: "monospace",
          zIndex: 9999,
          pointerEvents: "none",
          lineHeight: 1.6,
          whiteSpace: "pre",
        }}
      />
      {!loaded && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}
