import DebugClient from "./DebugClient";

export const metadata = {
  title: "Debug | Customizer | Lumina Architech",
  description: "Debug view for the house customizer with Tweakpane GUI.",
};

export default function DebugPage() {
  return (
    <main className="h-screen w-screen bg-neutral-900 overflow-hidden relative text-white">
      <DebugClient />

      {/* UI Overlay */}
      <div className="absolute z-10 top-0 left-0 p-8 w-full flex justify-between items-start pointer-events-none">
        <h1 className="text-2xl font-light tracking-wide pointer-events-auto">
          House Customizer <span className="text-xs text-neutral-500 ml-2 uppercase tracking-widest">Debug</span>
        </h1>
        <a href="/customizer" className="text-sm uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors pointer-events-auto">
          Exit Debug
        </a>
      </div>
    </main>
  );
}
