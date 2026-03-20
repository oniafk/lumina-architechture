import CustomizerClient from "./CustomizerClient";

export const metadata = {
  title: "Customizer | Lumina Architech",
  description: "Customize your future home in 3D.",
};

export default function CustomizerPage() {
  return (
    <main className="h-screen w-screen bg-neutral-900 overflow-hidden relative text-white">
      <CustomizerClient />
    </main>
  );
}
