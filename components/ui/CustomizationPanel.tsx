"use client";

import { useMemo, useRef, useCallback } from "react";
import { Check } from "lucide-react";
import { CUSTOMIZABLE_SECTIONS } from "@/components/3d/config/sections";
import { ALL_ENTRIES } from "@/components/3d/TextureManager";
import { useCustomizerStore, COLOR_SWATCHES } from "@/store/useCustomizerStore";

/** Converts vertical mouse wheel into horizontal scroll on a container */
function useHorizontalScroll() {
  const ref = useRef<HTMLDivElement>(null);

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    // Only hijack vertical scroll when there's horizontal overflow
    if (ref.current.scrollWidth > ref.current.clientWidth) {
      e.preventDefault();
      ref.current.scrollLeft += e.deltaY;
    }
  }, []);

  return { ref, onWheel };
}

export default function CustomizationPanel() {
  const activeSection = useCustomizerStore((s) => s.activeSection);
  const textures = useCustomizerStore((s) => s.textures);
  const colors = useCustomizerStore((s) => s.colors);
  const setActiveSection = useCustomizerStore((s) => s.setActiveSection);
  const setTexture = useCustomizerStore((s) => s.setTexture);
  const setColor = useCustomizerStore((s) => s.setColor);

  const tabsScroll = useHorizontalScroll();

  const currentSection = CUSTOMIZABLE_SECTIONS.find(
    (s) => s.id === activeSection,
  );

  const availableTextures = useMemo(() => {
    if (!currentSection?.allowedCategories) return [];
    return ALL_ENTRIES.filter((entry) =>
      currentSection.allowedCategories!.includes(entry.category as any),
    );
  }, [currentSection]);

  const activeTextureId = textures[activeSection];
  const activeColor = colors[activeSection] ?? null;

  return (
    <div className="flex h-full w-[320px] flex-col bg-neutral-900/90 backdrop-blur-md border-l border-white/10">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 shrink-0">
        <h2 className="text-lg font-semibold text-white">
          {currentSection?.label ?? "Customize"}
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Select material and finish
        </p>
      </div>

      {/* Section Tabs — horizontal scroll with mouse wheel, no scrollbar */}
      <div className="px-5 pb-4 shrink-0">
        <div
          ref={tabsScroll.ref}
          onWheel={tabsScroll.onWheel}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
        >
          {CUSTOMIZABLE_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-white text-neutral-900"
                  : "bg-white/10 text-neutral-300 hover:bg-white/20"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Texture Cards + Color Swatches */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <h3 className="text-sm font-medium text-neutral-300 mb-3">
          Material
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {availableTextures.map((entry) => {
            const isActive = activeTextureId === entry.id;
            return (
              <div key={entry.id} className="flex flex-col gap-2">
                {/* Texture card */}
                <button
                  onClick={() => setTexture(activeSection, entry.id)}
                  className={`relative rounded-xl overflow-hidden transition-all text-left ${
                    isActive
                      ? "ring-2 ring-white scale-[1.02]"
                      : "ring-1 ring-white/10 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="aspect-square w-full">
                    <img
                      src={entry.maps.color}
                      alt={entry.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2 bg-white text-neutral-900 rounded-full p-0.5">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                  <div className="px-2 py-2">
                    <p className="text-xs font-medium text-white truncate">
                      {entry.label}
                    </p>
                    <p className="text-[10px] text-neutral-400 capitalize">
                      {entry.category}
                    </p>
                  </div>
                </button>

                {/* Color swatches — only shown when this texture is active */}
                {isActive && (
                  <div className="flex gap-1.5 flex-wrap px-0.5">
                    {COLOR_SWATCHES.map((swatch) => {
                      const isColorActive = activeColor === swatch.hex;
                      return (
                        <button
                          key={swatch.hex}
                          title={swatch.label}
                          onClick={() =>
                            setColor(
                              activeSection,
                              isColorActive ? null : swatch.hex,
                            )
                          }
                          className={`w-5 h-5 rounded-full transition-all ${
                            isColorActive
                              ? "border-2 border-white scale-110"
                              : "border border-white/30 hover:border-white/80"
                          }`}
                          style={{ backgroundColor: swatch.hex }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
