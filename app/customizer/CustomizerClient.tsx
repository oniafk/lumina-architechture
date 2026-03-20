"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { SlidersHorizontal, X } from "lucide-react";
import CustomizationPanel from "@/components/ui/CustomizationPanel";
import {
  useCustomizerStore,
  DEFAULT_TEXTURES,
} from "@/store/useCustomizerStore";

const HouseCanvas = dynamic(() => import("../../components/3d/HouseCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center z-0">
      <p className="text-neutral-500 font-light tracking-widest text-sm uppercase">
        Loading 3D Experience...
      </p>
    </div>
  ),
});

export default function CustomizerClient() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const hasChanges = useCustomizerStore((s) => {
    const texturesChanged = Object.keys(DEFAULT_TEXTURES).some(
      (key) => s.textures[key] !== DEFAULT_TEXTURES[key]
    );
    const colorsChanged = Object.values(s.colors).some((c) => c !== null);
    return texturesChanged || colorsChanged;
  });

  const leave = useCallback(() => {
    setClosing(true);
    setShowConfirm(false);
    setTimeout(() => router.back(), 350);
  }, [router]);

  const handleClose = useCallback(() => {
    if (hasChanges) {
      setShowConfirm(true);
    } else {
      leave();
    }
  }, [hasChanges, leave]);

  return (
    <div
      className="absolute inset-0 z-0 transition-opacity duration-300"
      style={{ opacity: closing ? 0 : 1 }}
    >
      {/* 3D Canvas — always fills the full viewport */}
      <div className="absolute inset-0">
        <HouseCanvas />
      </div>

      {/* Header overlay */}
      <div className="absolute z-20 top-0 left-0 p-8 w-full flex justify-between items-start pointer-events-none">
        <h1 className="text-2xl font-light tracking-wide pointer-events-auto">
          House Customizer
        </h1>
        <button
          onClick={handleClose}
          className="text-sm uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors pointer-events-auto"
        >
          Close
        </button>
      </div>

      {/* Right sidebar + toggle button — both slide together via translateX */}
      <div
        className="absolute top-0 right-0 h-full z-10 flex"
        style={{
          transform: panelOpen ? "translateX(0)" : "translateX(320px)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Toggle button — attached to the left edge of the panel */}
        <button
          onClick={() => setPanelOpen((prev) => !prev)}
          className="self-center -ml-[38px] absolute left-0 z-20 bg-neutral-800/80 backdrop-blur-sm border border-white/10 border-r-0 rounded-l-lg p-2.5 text-white/70 hover:text-white hover:bg-neutral-700/80 transition-colors"
        >
          {panelOpen ? <X size={18} /> : <SlidersHorizontal size={18} />}
        </button>

        <CustomizationPanel />
      </div>

      {/* Unsaved changes confirmation */}
      {showConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/10 rounded-xl p-8 max-w-sm text-center space-y-5">
            <p className="text-lg font-light">
              You have unsaved changes.
            </p>
            <p className="text-sm text-neutral-400">
              Your customizations will be lost if you leave now.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2 text-sm rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
              >
                Stay
              </button>
              <button
                onClick={leave}
                className="px-5 py-2 text-sm rounded-lg bg-white text-neutral-900 hover:bg-neutral-200 transition-colors"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
