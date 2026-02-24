"use client";

import dynamic from "next/dynamic";
import CustomizationPanel from "@/components/ui/CustomizationPanel";

const HouseCanvas = dynamic(() => import("@/components/3d/HouseCanvas"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center z-0">
      <p className="text-neutral-500 font-light tracking-widest text-sm uppercase">
        Loading 3D Experience...
      </p>
    </div>
  ),
});

export default function DebugClient() {
  return (
    <div className="absolute inset-0 z-0 flex">
      {/* 3D Canvas with Tweakpane debug GUI on the left */}
      <div className="flex-1 relative">
        <HouseCanvas debug />
      </div>

      {/* Customization panel — right side */}
      <CustomizationPanel />
    </div>
  );
}
