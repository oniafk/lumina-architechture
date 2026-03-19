"use client";

import VideoGallerySequenceLoader from "@/components/ui/VideoGallerySequenceLoader";
import FeaturedProjects from "@/components/ui/FeaturedProjects";

// Extra scroll runway so 120 frames play smoothly
const SCROLL_RUNWAY = 3000;

export default function PhilosophyVideo() {
  return (
    <>
      {/* Philosophy — extended with scroll runway for the video */}
      <section
        data-scroll-section="philosophy"
        className="relative px-6 bg-background-light dark:bg-background-dark"
        style={{ paddingTop: "8rem", paddingBottom: `calc(8rem + ${SCROLL_RUNWAY}px)` }}
      >
        {/* Text content at the top */}
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 md:gap-32 items-start">
            <div className="md:w-1/3">
              <span className="inline-block mb-6 px-3 py-1 rounded-full border border-primary/30 text-primary text-xs uppercase tracking-widest">
                The Philosophy
              </span>
              <h3 className="text-sm font-light text-gray-500 leading-relaxed uppercase tracking-widest mt-4">
                Defining space through the absence of matter.
              </h3>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-4xl md:text-6xl font-light leading-[1.1] text-gray-900 dark:text-white">
                &ldquo;We build for the{" "}
                <span className="text-primary font-serif italic">light</span>.
                In the absence of noise, we find the structure. Every line is a
                decision, every void is a space for living.&rdquo;
              </h2>
              <p className="mt-12 text-xl text-gray-500 font-light leading-relaxed max-w-lg ml-auto">
                Our work exists at the intersection of nature, art, and
                habitation. We believe in slow architecture that stands the test
                of time.
              </p>
            </div>
          </div>
        </div>

        {/* Sticky video tracker — pulled up to overlap the text, sticks during scroll */}
        <VideoGallerySequenceLoader
          trackerStyle={{
            width: "40%",
            height: "50vh",
            marginLeft: "5%",
            marginTop: "-38vh",
          }}
        />
      </section>

      {/* Featured Projects — horizontal scroll gallery */}
      <FeaturedProjects />

      {/* Precision */}
      <section className="py-32 bg-background-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <h3 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.9] text-white">
                Precision in <br />
                <span className="text-outline">every detail.</span>
              </h3>
              <p className="text-gray-400 font-light leading-relaxed max-w-md text-lg">
                Our approach is rooted in the belief that space shapes
                consciousness. We strip away the non-essential to reveal the
                profound, focusing on the interplay of light, material, and
                human experience.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
