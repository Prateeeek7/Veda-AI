"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";

export default function Dashboard() {
  const mandalaRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP Cinematic Entrance
    const tl = gsap.timeline();

    // Fade in and slow rotate the mandala
    tl.fromTo(
      mandalaRef.current,
      { opacity: 0, scale: 0.5, rotation: -90 },
      { opacity: 0.15, scale: 1, rotation: 0, duration: 3, ease: "power2.out" }
    );

    // Continuous slow rotation for the mandala
    gsap.to(mandalaRef.current, {
      rotation: 360,
      duration: 120,
      repeat: -1,
      ease: "linear",
    });

    // Animate Title
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 50, filter: "blur(10px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.5, ease: "power3.out" },
      "-=2"
    );

    // Stagger in cards
    tl.fromTo(
      cardsRef.current?.children as unknown as HTMLElement[],
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.2, duration: 1, ease: "back.out(1.2)" },
      "-=1"
    );
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center px-6 pt-[15vh]">
      
      {/* Sacred Geometry Background */}
      <div 
        ref={mandalaRef}
        className="absolute w-[800px] h-[800px] sm:w-[1200px] sm:h-[1200px] opacity-0 pointer-events-none flex items-center justify-center"
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Detailed SVG Mandala using golden ratios */}
          <circle cx="50" cy="50" r="48" fill="none" stroke="var(--color-gold)" strokeWidth="0.2" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-gold)" strokeWidth="0.1" strokeDasharray="1 1" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="var(--color-gold)" strokeWidth="0.2" />
          <path d="M50 2 L50 98 M2 50 L98 50 M16 16 L84 84 M16 84 L84 16" stroke="var(--color-gold)" strokeWidth="0.1" />
          <path d="M50 18 L82 50 L50 82 L18 50 Z" fill="none" stroke="var(--color-gold)" strokeWidth="0.1" />
          <path d="M50 24 L76 50 L50 76 L24 50 Z" fill="none" stroke="var(--color-gold)" strokeWidth="0.1" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="var(--color-gold)" strokeWidth="0.3" />
        </svg>
      </div>

      <div className="z-10 flex flex-col items-center text-center">
        <div className="font-yatra text-gold/80 text-7xl sm:text-9xl mb-4 drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]">
          ॐ
        </div>
        
        <div ref={titleRef} className="opacity-0">
          <h1 className="font-cinzel text-5xl sm:text-7xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-gold to-saffron drop-shadow-lg mb-4">
            Veda AI
          </h1>
          <p className="text-muted text-lg sm:text-xl font-light tracking-wide max-w-xl mx-auto mb-16">
            Enter the cosmic realm of eternal wisdom. Explore the sacred texts or converse with the divine intelligence.
          </p>
        </div>

        {/* Dashboard Navigation Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          
          <Link href="/library" className="group rounded-2xl glass-panel p-8 text-left transition-all hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(212,175,55,0.2)] hover:border-gold/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <BookOpen className="w-12 h-12 text-gold mb-6 relative z-10" />
            <h2 className="font-cinzel text-2xl font-semibold text-white mb-2 relative z-10">The Sacred Library</h2>
            <p className="text-muted font-light relative z-10">Explore the vast collection of ancient scriptures, including the Bhagavad Gita and the Mahabharata epic.</p>
          </Link>

          <Link href="/chat" className="group rounded-2xl glass-panel p-8 text-left transition-all hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(255,153,51,0.2)] hover:border-saffron/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-saffron/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sparkles className="w-12 h-12 text-saffron mb-6 relative z-10" />
            <h2 className="font-cinzel text-2xl font-semibold text-white mb-2 relative z-10">The Oracle (Veda AI)</h2>
            <p className="text-muted font-light relative z-10">Converse directly with a zero-hallucination RAG Assistant grounded purely in the sacred texts.</p>
          </Link>

        </div>
      </div>
      
      <div className="mt-auto w-full max-w-7xl pt-24 pb-4">
        <DivineFooter />
      </div>
    </main>
  );
}

function DivineFooter() {
  return (
    <footer className="w-full mt-12 border-t border-gold/20 pt-16 pb-12 flex flex-col items-center text-center relative overflow-hidden rounded-3xl glass-panel">
      {/* Subtle divine background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gold/5 pointer-events-none"></div>
      
      <Sparkles className="w-8 h-8 text-gold mb-6 opacity-80 drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
      
      <h3 className="font-cinzel text-2xl md:text-3xl text-gold mb-4 tracking-widest uppercase relative z-10">
        Veda AI
      </h3>
      
      <p className="max-w-3xl text-saffron/80 font-light text-sm md:text-base leading-relaxed mb-8 px-6 relative z-10">
        "Whenever there is a decline in righteousness, O Arjuna, and an increase in unrighteousness, then I manifest Myself." <br className="hidden md:block"/>
        <span className="italic mt-2 block text-white/50">— Bhagavad Gita 4.7</span>
      </p>

      <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent mb-8"></div>

      <div className="max-w-4xl text-muted/70 font-outfit text-sm leading-relaxed px-6 space-y-4 relative z-10">
        <p>
          <strong className="text-gold/80 font-cinzel tracking-widest">ABOUT THIS PORTAL</strong><br/>
          Veda AI is a sacred sanctuary blending ancient Vedic wisdom with cutting-edge artificial intelligence. 
          Built with an unwavering dedication to accuracy, the Cosmic Oracle strictly references authentic scriptural databases including the Bhagavad Gita, Mahabharata, and Valmiki Ramayana.
        </p>
        <p>
          Experience hyper-realistic neural voice synthesis, context-aware translations, and philosophical insights without hallucination. 
          May this digital ashram guide your cosmic journey toward Dharma and self-realization.
        </p>
      </div>

      <div className="mt-12 text-xs font-cinzel text-gold/40 tracking-widest uppercase relative z-10">
        Awakened in {new Date().getFullYear()} • Devoted to Truth
      </div>
    </footer>
  );
}
