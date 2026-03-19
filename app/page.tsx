import Link from "next/link";
import { Play } from "lucide-react";
import PhilosophyVideo from "@/components/ui/PhilosophyVideo";
import GlobalCanvasLoader from "@/components/canvas/GlobalCanvasLoader";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA_cXrTjMdel4qpCgkPP7DpSTy4Wx12xV_M9rDZTv0LVrWAwprZknVbQeFobAYLUoLBI2xA8kYBlQFRwO1Viyw6iqiKTSytaUt4VvelCgHV8yte_jGjHr4eRNH-R2iIqOGXh0kYgHQd1LF74gd54IkSstM0RLvfsvPOqLsApc7e-v9p6lQ740BUXbJOzL2YPHMs38L6z3rtbpiALxQhWjhNxJlzuT08h8Ik5W99JiiIr9Th9Ol7v7xAReSo2Q3oCw7goDRa_2b--45A";

export default function Home() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-gray-100 font-display relative">
      {/* Global WebGL Canvas */}
      <GlobalCanvasLoader />

      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-10 bg-noise mix-blend-overlay" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference text-white">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tighter uppercase group"
        >
          Lumina
          <span className="text-primary group-hover:text-white transition-colors duration-300">
            .
          </span>
        </Link>
        <button className="flex items-center gap-3 group">
          <span className="text-xs uppercase tracking-[0.2em] font-medium hidden sm:block group-hover:text-primary transition-colors duration-300">
            Menu
          </span>
          <div className="space-y-1.5 w-8">
            <div className="h-[1px] w-full bg-white group-hover:bg-primary transition-colors duration-300" />
            <div className="h-[1px] w-2/3 ml-auto bg-white group-hover:w-full group-hover:bg-primary transition-all duration-300" />
          </div>
        </button>
      </nav>

      {/* Hero */}
      <header className="relative w-full h-screen flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 z-0 bg-void">
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={heroImage}
              alt="Cinematic minimalist architecture"
              className="w-full h-full object-cover opacity-60 grayscale contrast-125 scale-110 origin-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/30 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-full border border-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-500">
                <Play className="text-white w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[90%] mx-auto h-full flex flex-col justify-end pb-24">
          <div className="flex flex-col md:flex-row items-end justify-between gap-12 border-t border-white/10 pt-12">
            <div className="max-w-4xl">
              <p className="text-primary text-xs uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Live Project
              </p>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.85] tracking-tight text-white mix-blend-exclusion">
                Architecture <br />
                <span className="text-outline font-light italic ml-12">
                  as dialogue.
                </span>
              </h1>
            </div>
            <div className="hidden md:flex flex-col items-end gap-2 text-right">
              <span className="text-xs text-gray-400 uppercase tracking-widest block mb-2">
                Current Location
              </span>
              <span className="text-2xl text-white font-light">Kyoto, JP</span>
              <span className="text-xs text-primary font-mono">
                35.0116° N, 135.7681° E
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-gray-500">
            Explore
          </span>
          <div className="w-[1px] h-12 bg-gray-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-primary animate-scroll-down" />
          </div>
        </div>
      </header>

      {/* Philosophy + Scroll Video + Precision */}
      <PhilosophyVideo />

      {/* Footer */}
      <footer className="bg-black text-white pt-32 pb-12 px-6 md:px-12 lg:px-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col justify-between min-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h5 className="text-primary text-xs uppercase tracking-[0.2em] mb-12 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Start a Project
              </h5>
              <a
                className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight hover:text-primary transition-colors duration-500 block mb-6 break-all leading-[0.8]"
                href="mailto:hello@lumina.arch"
              >
                hello@
                <br />
                lumina.arch
              </a>
              <div className="mt-16">
                <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">
                  HQ
                </p>
                <p className="text-xl font-light text-white">
                  1400 Void Ave
                  <br />
                  New York, NY 10001
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between md:items-end">
              <nav className="flex flex-col gap-6 text-right mb-16">
                <Link
                  href="/gallery"
                  className="text-2xl font-light text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Work
                </Link>
                <Link
                  href="/about"
                  className="text-2xl font-light text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Studio
                </Link>
                <Link
                  href="/contact"
                  className="text-2xl font-light text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Contact
                </Link>
                <Link
                  href="/customizer"
                  className="text-2xl font-light text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Customizer
                </Link>
              </nav>
              <div className="flex gap-8">
                <a
                  href="#"
                  className="text-gray-500 hover:text-primary transition-colors duration-300 uppercase text-xs tracking-widest"
                >
                  Instagram
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-primary transition-colors duration-300 uppercase text-xs tracking-widest"
                >
                  LinkedIn
                </a>
                <a
                  href="#"
                  className="text-gray-500 hover:text-primary transition-colors duration-300 uppercase text-xs tracking-widest"
                >
                  Behance
                </a>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-32 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 uppercase tracking-[0.2em] gap-4 border-t border-white/5 pt-8">
            <p>&copy; 2024 Lumina Architecture. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-gray-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gray-400 transition-colors">
                Terms of Use
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
