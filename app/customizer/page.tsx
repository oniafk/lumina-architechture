export const metadata = {
  title: "Customizer | Lumina Architech",
  description: "Customize your future home in 3D.",
};

export default function CustomizerPage() {
  return (
    <main className="h-screen w-screen bg-neutral-900 overflow-hidden relative text-white">
      {/* 3D Canvas will go here */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <p className="text-neutral-500 font-light tracking-widest text-sm uppercase">Loading 3D Experience...</p>
      </div>

      {/* UI Overlay */}
      <div className="absolute z-10 top-0 left-0 p-8 w-full flex justify-between items-start pointer-events-none">
        <h1 className="text-2xl font-light tracking-wide pointer-events-auto">House Customizer</h1>
        <button className="text-sm uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors pointer-events-auto">Close</button>
      </div>
    </main>
  );
}
