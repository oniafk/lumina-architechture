export const metadata = {
  title: "Gallery | Lumina Architech",
  description: "Explore our portfolio of high-end architectural projects.",
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-black text-white pt-24 px-6 md:px-12 lg:px-24">
      <h1 className="text-4xl md:text-6xl font-light mb-8">Selected Works</h1>
      <p className="max-w-2xl text-lg text-neutral-400">
        A curated selection of our most iconic architectural and interior design projects.
      </p>
    </main>
  );
}
