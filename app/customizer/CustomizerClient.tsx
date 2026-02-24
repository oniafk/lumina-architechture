"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { SlidersHorizontal, X } from "lucide-react";
import CustomizationPanel from "@/components/ui/CustomizationPanel";

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

  return (
    <div className="absolute inset-0 z-0">
      {/* 3D Canvas — always fills the full viewport */}
      <div className="absolute inset-0">
        <HouseCanvas />
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
    </div>
  );
}
