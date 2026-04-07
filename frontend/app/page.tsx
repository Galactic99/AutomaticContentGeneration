"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Check, 
  Send, 
  Menu, 
  X, 
  Sparkles,
  BarChart2,
  Zap,
  FileText,
  Code
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MOCKUP_IMAGES = [
  "/mockup_screen.png",
  "/gmail_mockup.png",
  "/insta_mockup.png"
];

function ScanningMockup() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    setParticles(Array(10).fill(0).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 2
    })));
  }, []);

  return (
    <div className="relative aspect-[16/10] bg-zinc-950 rounded-[3rem] overflow-hidden shadow-2xl p-8 flex items-center justify-center border border-zinc-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1e293b_0%,transparent_50%)] opacity-30" />
      
      {/* --- SCANNED FILE --- */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-44 h-56 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
      >
        <div className="h-2 w-12 bg-blue-500/40 rounded" />
        <div className="space-y-3">
          <div className="h-1.5 w-full bg-zinc-800 rounded" />
          <div className="h-1.5 w-3/4 bg-zinc-800 rounded" />
          <div className="h-1.5 w-full bg-zinc-800 rounded" />
          <div className="h-1.5 w-5/6 bg-zinc-800 rounded" />
        </div>
        
        {/* Scanning Bar Animation */}
        <motion.div 
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.6)] z-20"
        />
      </motion.div>

      {/* --- CONVERSION ARROW --- */}
      <motion.div 
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="mx-8 text-zinc-800"
      >
        <ArrowRight size={32} />
      </motion.div>

      {/* --- JSON OUTPUT --- */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-10 w-56 h-48 bg-blue-950/20 border border-blue-500/20 rounded-2xl p-6 flex flex-col gap-4 shadow-inner"
      >
        <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-blue-500">facts.json</span>
            <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500/30" />
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500/30" />
            </div>
        </div>
        <div className="space-y-3 font-mono text-[9px] text-blue-300">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>{'{'}</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="pl-3">"status": <span className="text-emerald-400">"verified"</span>,</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="pl-3">"grounding": <span className="text-emerald-400">0.99</span></motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>{'}'}</motion.p>
        </div>
      </motion.div>

      {/* Background Particles (Fixed Hydration Issue) */}
      {particles.map((p, i) => (
        <motion.div 
          key={i}
          animate={{ 
            y: [-20, 20], 
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            delay: p.delay 
          }}
          className="absolute h-1 w-1 rounded-full bg-blue-500/20"
          style={{ 
            left: p.left, 
            top: p.top 
          }}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mockupIndex, setMockupIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    
    // Looping animation for deployment mockups
    const timer = setInterval(() => {
      setMockupIndex((prev) => (prev + 1) % MOCKUP_IMAGES.length);
    }, 4000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCF9] font-outfit text-zinc-900 selection:bg-blue-100 overflow-x-hidden">
      
      {/* --- NAVIGATION --- */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex items-center justify-between px-6 sm:px-12",
        isScrolled ? "h-16 bg-white/70 backdrop-blur-xl border-b border-zinc-100 py-2" : "h-24 bg-transparent py-6"
      )}>
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Send className="text-white h-4 w-4 transform -rotate-12" />
          </div>
          <span className="font-bold text-xl tracking-tight italic font-playfair">ContentFactory</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          {['Workflow', 'Agents', 'Docs'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-[11px] uppercase tracking-widest font-bold text-zinc-400 hover:text-zinc-900 transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="px-8 py-3 rounded-2xl bg-zinc-900 text-white text-[13px] font-bold transition-all hover:bg-zinc-800 active:scale-95 shadow-xl shadow-zinc-200">
            Enter Factory →
          </Link>
          <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-6 sm:px-12 overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#eff6ff_0%,transparent_50%)]" />
        
        <div className="max-w-5xl mx-auto space-y-12 z-10 relative">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-6xl sm:text-[9rem] font-bold tracking-tight text-zinc-900 leading-[0.8]"
          >
            Autonomous <br /> <span className="italic text-zinc-300 font-playfair">Content</span> Factory
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl sm:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Orchestrate coordinated campaigns with a multi-agent assembly line. Our platform parses technical documentation, identifies core facts, streams agent thought processes in real time.
          </motion.p>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3, duration: 0.8 }}
             className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12"
          >
             <Link href="/login" className="group px-14 py-6 rounded-[2rem] bg-zinc-900 text-white font-bold shadow-2xl shadow-zinc-200 hover:bg-zinc-800 transition-all flex items-center gap-3 text-lg">
                Enter Workshop <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="workflow" className="py-56 px-6 sm:px-12 max-w-7xl mx-auto space-y-72 bg-[#FDFCF9]">
        
        {/* PILLAR 1: RESEARCH (SVG ANIMATION) */}
        <div className="flex flex-col gap-20 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-12">
             <div className="h-16 w-16 rounded-3xl bg-zinc-900 text-white flex items-center justify-center shadow-2xl">
                <BarChart2 size={32} />
             </div>
             <div className="space-y-8">
                <h2 className="text-5xl sm:text-[5rem] leading-[0.9] font-bold tracking-tight text-zinc-900">Grounded <br/><span className="text-zinc-300 italic font-playfair">Verification</span></h2>
                <p className="text-xl text-zinc-500 leading-relaxed max-w-xl">
                  Process source materials to isolate technical facts. Our Researcher node removes marketing hype, identifies specific details, verifies all data points against original text.
                </p>
             </div>
             <div className="flex flex-wrap gap-x-8 gap-y-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
                <div className="flex items-center gap-2 text-zinc-900">PDF Audit</div>
                <div className="flex items-center gap-2 text-zinc-900">Fact Shield</div>
                <div className="flex items-center gap-2 text-zinc-900">Doc Parsing</div>
             </div>
          </div>
          <div className="flex-1">
             <ScanningMockup />
          </div>
        </div>

        {/* PILLAR 2: OBSERVABILITY (CHATLOG) */}
        <div className="flex flex-col gap-20 lg:flex-row-reverse lg:items-center">
          <div className="flex-1 space-y-12">
             <div className="h-16 w-16 rounded-3xl bg-zinc-900 text-white flex items-center justify-center shadow-2xl lg:ml-auto">
                <Sparkles size={32} />
             </div>
             <div className="space-y-8 lg:text-right">
                <h2 className="text-5xl sm:text-[5rem] leading-[0.9] font-bold tracking-tight text-zinc-900">Watch <br/><span className="text-zinc-300 italic font-playfair">Live</span> Audits</h2>
                <p className="text-xl text-zinc-500 leading-relaxed max-w-xl lg:ml-auto font-light">
                   Total observability for the assembly line. We stream agent thought processes, typing cycles, status changes as they occur via persistent live stream.
                </p>
             </div>
             <div className="flex flex-wrap gap-x-8 gap-y-4 text-xs font-bold uppercase tracking-widest text-zinc-400 lg:justify-end">
                <div className="flex items-center gap-2 text-zinc-900">SSE Feed</div>
                <div className="flex items-center gap-2 text-zinc-900">Token Stream</div>
                <div className="flex items-center gap-2 text-zinc-900">Live Audit</div>
             </div>
          </div>
          <div className="flex-1 text-center">
             <img src="/chatlog.png" alt="Live Audit Feed" className="w-full h-auto rounded-3xl" />
          </div>
        </div>

        {/* PILLAR 3: MULTI-CHANNEL (LOOPING MOCKUPS) */}
        <div className="flex flex-col gap-20 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-12">
             <div className="h-16 w-16 rounded-3xl bg-zinc-900 text-white flex items-center justify-center shadow-2xl">
                <Zap size={32} />
             </div>
             <div className="space-y-8">
                <h2 className="text-5xl sm:text-[5rem] leading-[0.9] font-bold tracking-tight text-zinc-900">Instant <br/><span className="text-zinc-300 italic font-playfair">Production</span></h2>
                <p className="text-xl text-zinc-500 leading-relaxed max-w-xl">
                  Generate blogs, social threads, email outreach from a single fact sheet. Every asset is cross-checked for brand voice, factual consistency, logical coherence.
                </p>
             </div>
             <div className="flex flex-wrap gap-x-8 gap-y-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
                <div className="flex items-center gap-2 text-zinc-900">Blog System</div>
                <div className="flex items-center gap-2 text-zinc-900">Social Engine</div>
                <div className="flex items-center gap-2 text-zinc-900">Cold Outreach</div>
             </div>
          </div>
          <div className="flex-1 px-4 sm:px-0">
             <div className="relative aspect-[3/4] sm:aspect-[4/5] flex items-center justify-center">
                <AnimatePresence mode="wait">
                   <motion.img
                      key={mockupIndex}
                      src={MOCKUP_IMAGES[mockupIndex]}
                      alt="Deployment Preview"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 w-full h-full object-contain rounded-3xl"
                   />
                </AnimatePresence>
             </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-40 px-6 sm:px-12 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
          <div className="space-y-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-zinc-900 rounded-lg flex items-center justify-center"><Send className="text-white h-4 w-4 transform -rotate-12" /></div>
              <span className="font-bold text-xl tracking-tight italic font-playfair">ContentFactory</span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm font-light">Experimental assembly line for Multi-Agent Orchestration, LangGraph, real-time AI Observability. Open for research purposes.</p>
          </div>
          
          <div className="flex flex-wrap gap-20 justify-start md:justify-end">
             <div>
                <h4 className="text-[10px] uppercase font-bold text-zinc-300 tracking-[0.2em] mb-8">Node Tech</h4>
                <ul className="space-y-4 text-[12px] font-bold text-zinc-600">
                   <li><Link href="#" className="hover:text-blue-600 transition-colors">LangGraph</Link></li>
                   <li><Link href="#" className="hover:text-blue-600 transition-colors">FastAPI</Link></li>
                   <li><Link href="#" className="hover:text-blue-600 transition-colors">Next.js</Link></li>
                </ul>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
