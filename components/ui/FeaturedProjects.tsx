"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import Link from "next/link";

const projects = [
  {
    title: "Dune House",
    category: "Residential",
    year: "2023",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAIybgMGdrBbjS-nMdk1wpG4BNL8bt8INLpzScDOrkxTFMQrbqksKl4EYfTacLkwhwGtZDMJ9zm2hnk7eMDo1XBxt51Ayui2_86g2nv3NXAeyFoecxHl0Z4iWGFqCN4rG-s3rSTbLsatCRqB73h4lEpU-tfwqHTR1ChuVZEMsuBA4jNQ88vqLmQVvbQJ3k5iiIlX8711fE8-yv6S9bDQsj0QsuI9XC0QFJAIId3GAdl4Mq_gEP0OAesd6WNhCazEUiA-9-NOsyKhTHo",
    alt: "Dune House exterior in desert landscape",
  },
  {
    title: "04 Apartment",
    category: "Interior",
    year: "2024",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2QwHEW7O8j38BkOw8gW1O1XlyrEZOEVCxp88C40J0eruOM7-9iVwBkujy7RMlHZ2FEeQQdUX2KpoQIMgS4p1cs6BJWk0Uq70hgigAJMdsZcudjZfkpNzUrw1oMxRTckbrTwcLxgVwFKqosBxyP4cQWZwCKbM3dWkENn7MouNtCCu8AnKGbUTDXGho10RJnVit7pP8CXkpDr5p61ETWtEkTWgrKf5yq-knDwIlWEsIxJXZ6elh_JksJwCT7AowP6mdXektaqfiltOR",
    alt: "04 Apartment minimalist interior",
  },
  {
    title: "Pavilion N",
    category: "Public Space",
    year: "2022",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBa_fYXupq55HIykAllwZwu19qBo_REnD5M_helH3Ra9h8DtVR0TsnuXs4Ff15sw-R5KX3Ja6yDJn8AGHUcqsGXftyZIjnsAppM9JkgPa_Zw2dcrG8ZoWMBv5FwRh0qFJk5ZKt5eHyDTKKuL6EXMQip-xggY_5GORNE8dM3ZXNgl1FwJxSmzGdvAwoghfRZkhHRVgo4jNM0ioilZANDbNrRZRKb7-gex3G2d71c0ArH_8ee-sUCQIWuhx7VFgHXomPkcyxwaDa1L2tg",
    alt: "Pavilion N wooden structure in nature",
  },
  {
    title: "The Monolith",
    category: "Commercial",
    year: "2024",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDZKCytzyAvFCuXQAtvH665Hwdjzr_4MZPzYd6VxgZXOYOLlxOWILFOY5DXKg3_ecJjbRntf-nY4FXPWEGMCjKj1Ybc4doILE534NxVr1-Ydxq9ItK6RziZYiGf9tSa2wSVTBbumr9V0B9konmDkQF9smvhGivbPZKLNJ1GqzYTLOBCT_6KUyn3hVtwq_mObeyUg0DD9QrXcZwQJWXKyKRZEpCdqqffJrNfv_7aVTzd1OZK40avw9nf7ZN5EycwOEy_j0wvRWgmOJRh",
    alt: "The Monolith concrete structure",
  },
];

export default function FeaturedProjects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const svgCardRef = useRef<HTMLAnchorElement>(null);
  const svgTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const [progress, setProgress] = useState(0);

  const totalItems = projects.length + 1; // +1 for customizer card

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;

      const scrolled = -rect.top;
      const scrollableDistance = sectionHeight - viewportHeight;

      if (scrollableDistance <= 0) return;

      const p = Math.max(0, Math.min(1, scrolled / scrollableDistance));
      setProgress(p);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Calculate how much horizontal overflow the track has
  const [maxTranslate, setMaxTranslate] = useState(0);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const overflow = track.scrollWidth - track.parentElement!.clientWidth;
      setMaxTranslate(Math.max(0, overflow));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const translateX = -progress * maxTranslate;

  // More height = slower horizontal scroll. 300vh for 4 cards + wide customizer card.
  const SCROLL_HEIGHT = "300vh";

  // --- GSAP SVG hover animation ---
  const handleSvgHoverEnter = useCallback(() => {
    const card = svgCardRef.current;
    if (!card) return;

    if (svgTimelineRef.current) {
      svgTimelineRef.current.kill();
    }

    const cubePaths = card.querySelectorAll<SVGPathElement>(".cube-structure > path");
    const configElements = card.querySelector(".config-elements");
    const nodes = card.querySelectorAll(".config-elements circle");
    const configArrow = card.querySelector<SVGPathElement>(".config-elements path");
    const arrowHead = card.querySelector(".config-elements polyline");

    // Prepare stroke-dashoffset for draw-in
    cubePaths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });

    if (configArrow) {
      const arrowLength = configArrow.getTotalLength();
      gsap.set(configArrow, { strokeDasharray: arrowLength, strokeDashoffset: arrowLength });
    }

    gsap.set(nodes, { scale: 0, transformOrigin: "center center" });
    gsap.set(configElements, { opacity: 0 });
    if (arrowHead) gsap.set(arrowHead, { opacity: 0 });

    const tl = gsap.timeline();

    // 1. Draw cube structure paths
    tl.to(cubePaths, {
      strokeDashoffset: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power4.out",
    })
    // 2. Reveal config elements group
    .to(configElements, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    }, "-=0.5")
    // 3. Pop in nodes
    .to(nodes, {
      scale: 1,
      duration: 0.5,
      stagger: 0.1,
      ease: "back.out(1.7)",
    }, "-=0.3")
    // 4. Draw config arrow
    .to(configArrow, {
      strokeDashoffset: 0,
      duration: 0.5,
      ease: "power2.out",
    }, "-=0.4")
    // 5. Reveal arrow head
    .to(arrowHead, {
      opacity: 1,
      duration: 0.2,
    }, "-=0.1")
    // 6. Continuous node pulse
    .to(nodes, {
      scale: 1.4,
      duration: 0.8,
      stagger: 0.15,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    })
    // 7. Continuous arrow rotation
    .to(configArrow, {
      rotation: 360,
      svgOrigin: "50 50",
      duration: 3,
      ease: "linear",
      repeat: -1,
    }, "<")
    .to(arrowHead, {
      rotation: 360,
      svgOrigin: "50 50",
      duration: 3,
      ease: "linear",
      repeat: -1,
    }, "<");

    svgTimelineRef.current = tl;
  }, []);

  const handleSvgHoverLeave = useCallback(() => {
    if (svgTimelineRef.current) {
      svgTimelineRef.current.kill();
      svgTimelineRef.current = null;
    }

    const card = svgCardRef.current;
    if (!card) return;

    gsap.set(
      card.querySelectorAll(".cube-structure path, .config-elements, .config-elements circle, .config-elements path, .config-elements polyline"),
      { clearProps: "all" }
    );
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (svgTimelineRef.current) {
        svgTimelineRef.current.kill();
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-surface border-t border-white/5"
      style={{ height: SCROLL_HEIGHT }}
    >
      {/* Sticky container — pinned to viewport while user scrolls through the tall section */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        {/* Header */}
        <div className="px-6 md:px-12 lg:px-24 mb-12 flex justify-between items-end">
          <div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Featured Projects
            </h3>
            <p className="text-gray-500 text-sm uppercase tracking-widest">
              Scroll to explore
            </p>
          </div>

          {/* Progress indicator */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-xs text-gray-500 font-mono tabular-nums">
              {String(Math.round(progress * totalItems) + 1).padStart(2, "0")} / {String(totalItems).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Horizontal track */}
        <div className="overflow-hidden flex-1 min-h-0">
          <div
            ref={trackRef}
            className="flex gap-8 md:gap-16 pl-6 md:pl-24 pr-6 md:pr-24 h-full items-stretch will-change-transform"
            style={{ transform: `translateX(${translateX}px)` }}
          >
            {projects.map((project) => (
              <article
                key={project.title}
                className="group relative w-[85vw] md:w-[600px] flex-shrink-0 cursor-pointer overflow-hidden bg-void"
              >
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.alt}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                </div>

                <div className="absolute top-6 right-6 z-20">
                  <span className="text-[10px] border border-white/20 px-3 py-1 rounded-full backdrop-blur-md text-white/80 uppercase tracking-widest">
                    {project.year}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-20">
                  <p className="text-primary text-xs uppercase tracking-[0.2em] mb-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    {project.category}
                  </p>
                  <h4 className="text-4xl md:text-5xl text-white font-bold leading-none mb-2">
                    {project.title}
                  </h4>
                  <div className="flex items-center gap-4 mt-6 overflow-hidden h-0 group-hover:h-auto transition-all duration-500">
                    <span className="text-sm text-gray-300 font-light border-b border-white/30 pb-0.5">
                      View Case Study
                    </span>
                    <span className="material-icons text-primary text-sm">
                      arrow_forward
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </article>
            ))}

            {/* Customizer CTA card — double width */}
            <Link
              href="/customizer"
              ref={svgCardRef}
              onMouseEnter={handleSvgHoverEnter}
              onMouseLeave={handleSvgHoverLeave}
              className="group relative w-[85vw] md:w-[1200px] flex-shrink-0 cursor-pointer overflow-hidden bg-void border border-white/10 hover:border-primary/30 transition-colors duration-500 flex items-center justify-center"
            >
              {/* Background glow on hover */}
              <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              {/* SVG icon */}
              <div className="w-48 h-48 md:w-72 md:h-72 transition-transform duration-700 group-hover:scale-110">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                >
                  <defs>
                    <linearGradient id="customizerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d59312" />
                      <stop offset="100%" stopColor="#a67209" />
                    </linearGradient>
                  </defs>

                  <g className="cube-structure" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" />
                    <path d="M50 10 L50 50 M10 30 L50 50 M90 30 L50 50 M50 90 L50 50" opacity="0.5" />
                  </g>

                  <g className="config-elements" stroke="url(#customizerGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="50" cy="50" r="3" fill="#d59312" />
                    <circle cx="90" cy="70" r="3" fill="#d59312" />
                    <circle cx="10" cy="70" r="3" fill="#d59312" />
                    <path d="M75 55 A 25 25 0 0 1 50 75" />
                    <polyline points="53 72 50 75 53 78" />
                  </g>
                </svg>
              </div>

              {/* Text overlay */}
              <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-20">
                <p className="text-primary text-xs uppercase tracking-[0.2em] mb-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  Interactive
                </p>
                <h4 className="text-4xl md:text-5xl text-white font-bold leading-none mb-2">
                  Facade Customizer
                </h4>
                <div className="flex items-center gap-4 mt-6 overflow-hidden h-0 group-hover:h-auto transition-all duration-500">
                  <span className="text-sm text-gray-300 font-light border-b border-white/30 pb-0.5">
                    Try the 3D Configurator
                  </span>
                  <span className="material-icons text-primary text-sm">
                    arrow_forward
                  </span>
                </div>
              </div>

              <div className="absolute inset-0 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </Link>

          </div>
        </div>

        {/* Progress bar at bottom */}
        <div className="w-full h-1 bg-white/5 mt-auto">
          <div
            className="h-full bg-primary transition-[width] duration-100"
            style={{ width: `${Math.max(5, progress * 100)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
