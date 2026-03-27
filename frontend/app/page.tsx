"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Check, 
  Play, 
  Menu, 
  X, 
  ChevronRight,
  Send,
  Sparkles,
  BarChart2,
  Users,
  Lock,
  MessageCircle,
  Twitter,
  Youtube,
  Instagram,
  Linkedin
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
          <span className="font-bold text-xl tracking-tight">ContentFactory</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          {['Features', 'Marketplace', 'Resources', 'Pricing'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-sm font-semibold text-zinc-600 px-4">Log in</Link>
          <Link href="/login" className="px-6 py-2.5 rounded-full bg-zinc-900 text-white text-sm font-bold transition-all hover:bg-zinc-800 active:scale-95 shadow-lg shadow-zinc-200">
            Start free trial
          </Link>
          <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-44 pb-24 text-center px-6 sm:px-12 overflow-hidden">
        {/* Soft Background Clouds/Gradients */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-50/50 blur-[100px] rounded-full -z-10" />
        <div className="absolute top-[5%] right-[-5%] w-[35%] h-[35%] bg-orange-50/50 blur-[100px] rounded-full -z-10" />

        <div className="max-w-4xl mx-auto space-y-8 z-10 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="px-4 py-1 rounded-full bg-zinc-100 border border-zinc-200/50 text-[12px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Revolutionizing Content Ops
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-bold tracking-tight text-zinc-900 leading-[1.05]"
          >
            Run your content <br /> factory like a pro
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed"
          >
            Manage technical sources, orchestrate agents, and deliver coordinated campaigns. The all-in-one assembly line for serious creators.
          </motion.p>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
             <Link href="/login" className="px-10 py-4 rounded-xl bg-zinc-900 text-white font-bold shadow-2xl shadow-zinc-300 hover:bg-zinc-800 transition-all flex items-center gap-2">
                Get started free <ArrowRight size={18} />
             </Link>
             <button className="px-10 py-4 rounded-xl bg-white border border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-50 transition-all flex items-center gap-2">
                <Play size={16} fill="currentColor" /> Watch demo
             </button>
          </motion.div>
        </div>

        {/* Main Product Showcase Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-20 max-w-6xl mx-auto p-4 sm:p-8 rounded-[3rem] bg-white shadow-[0_50px_150px_-50px_rgba(0,0,0,0.1)] border border-zinc-100 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1bg-gradient-to-r from-blue-100 via-orange-50 to-emerald-50 opacity-50" />
          <img 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" 
            alt="Dashboard Preview" 
            className="w-full rounded-[2rem] border border-zinc-100 shadow-sm"
          />
        </motion.div>
      </section>

      {/* --- LOGO STRIP (DESATURATED) --- */}
      <div className="py-20 border-y border-zinc-100 overflow-hidden">
        <p className="text-center text-[10px] uppercase font-bold text-zinc-400 tracking-[0.3em] mb-12">Trusted by 5,000+ top engineering teams</p>
        <div className="flex flex-wrap items-center justify-center gap-16 sm:gap-24 px-8 opacity-40 grayscale">
          <span className="font-bold text-2xl tracking-tighter">Vercel</span>
          <span className="font-bold text-2xl tracking-tighter italic">Supabase</span>
          <span className="font-bold text-2xl tracking-tighter">Notion</span>
          <span className="font-bold text-2xl tracking-tighter">Linear</span>
          <span className="font-bold text-2xl tracking-tighter italic">Github</span>
        </div>
      </div>

      {/* --- FEATURE SECTION 1: WORK FROM ANYWHERE --- */}
      <section className="py-32 px-6 sm:px-12 max-w-7xl mx-auto space-y-32">
        <div className="flex flex-col gap-12 text-center md:text-left md:flex-row md:items-center">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900">Work from anywhere, stay in sync</h2>
            <p className="text-lg text-zinc-500 leading-relaxed max-w-xl">
              ContentFactory keeps all your agents and campaigns in one unified canvas. Access your assembly line on desktop or mobile with instantaneous real-time sync.
            </p>
            <div className="flex gap-4">
               <button className="px-6 py-2 rounded-full bg-zinc-900 text-white text-sm font-bold">App Store</button>
               <button className="px-6 py-2 rounded-full border border-zinc-200 text-zinc-600 text-sm font-bold">Play Store</button>
            </div>
          </div>
          <div className="flex-1 relative">
             <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-zinc-100">
                <img 
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=2670" 
                  alt="Mobile Experience" 
                  className="w-full h-full object-cover"
                />
             </div>
          </div>
        </div>

        {/* --- FEATURE SECTION 2: PRO-LEVEL MANAGEMENT (Z-LAYOUT) --- */}
        <div className="grid md:grid-cols-2 gap-24 items-center">
           <div className="order-2 md:order-1 relative">
              <div className="aspect-square bg-blue-100/50 rounded-[4rem] p-12 flex items-center justify-center overflow-hidden">
                 <div className="w-full h-full bg-white rounded-3xl shadow-2xl p-6 space-y-6">
                    <div className="flex items-center justify-between"><div className="w-20 h-4 bg-zinc-50 rounded" /><Check className="text-emerald-500" /></div>
                    <div className="space-y-3">
                       {Array(4).fill(0).map((_, i) => (
                         <div key={i} className="h-12 bg-zinc-50/50 rounded-xl border border-zinc-100 flex items-center px-4 gap-3">
                            <div className="h-6 w-6 rounded bg-zinc-100" />
                            <div className="h-2 flex-1 bg-zinc-100 rounded" />
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
           <div className="order-1 md:order-2 space-y-8">
              <div className="h-1 w-12 bg-indigo-500 rounded-full" />
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Keep every project moving forward</h2>
              <p className="text-lg text-zinc-500 leading-relaxed">
                Automatic status tracking and agent updates ensure everyone knows exactly what's ready for review and what's in the hopper.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 font-bold text-zinc-900 border-b-2 border-zinc-900 pb-1">Learn more <ChevronRight size={16} /></Link>
           </div>
        </div>
      </section>

      {/* --- AGENT FEATURES (GRID) --- */}
      <section className="bg-zinc-50 py-32">
         <div className="px-6 sm:px-12 max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
               <h2 className="text-4xl font-bold tracking-tight">Built for agencies, <br/>powered by AI simplicity</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
               <div className="bg-white p-12 rounded-[3.5rem] shadow-sm ring-1 ring-zinc-200/50 space-y-8">
                  <div className="flex gap-2">
                     {['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'].map(color => (
                        <div key={color} style={{ backgroundColor: color }} className="h-8 w-8 rounded-full border-2 border-white shadow-sm" />
                     ))}
                  </div>
                  <h3 className="text-2xl font-bold">Great for teams and solo entrepreneurs</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">Scale from a one-person shop to a global agency with flexible seats and permission controls built directly into the assembly line.</p>
               </div>
               <div className="bg-white p-12 rounded-[3.5rem] shadow-sm ring-1 ring-zinc-200/50 space-y-8">
                  <div className="grid grid-cols-5 gap-3">
                     {[Lock, Sparkles, BarChart2, MessageCircle, Twitter].map((Icon, i) => (
                        <div key={i} className="h-10 w-10 flex items-center justify-center bg-zinc-50 rounded-xl"><Icon size={20} className="text-zinc-400" /></div>
                     ))}
                  </div>
                  <h3 className="text-2xl font-bold">Integrate with all the platforms you love</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">Connect X, LinkedIn, Instagram, and Gmail directly. Publish scheduled campaigns with a single click after your agents finish their audit.</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- TESTIMONIAL --- */}
      <section className="py-32 bg-white px-6 sm:px-12 text-center">
         <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight italic">
              "ContentFactory is by far the best campaign tool I have ever used."
            </h2>
            <div className="flex flex-col items-center gap-4">
               <div className="h-16 w-16 rounded-full overflow-hidden ring-4 ring-zinc-50">
                  <img src="https://i.pravatar.cc/150?u=4" alt="Testimonial" />
               </div>
               <div>
                  <p className="font-bold">Alex Rivera</p>
                  <p className="text-sm text-zinc-400">Founder @ TechStream</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-32 px-6 sm:px-12 bg-zinc-50">
         <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
               <h2 className="text-4xl font-bold tracking-tight">Simple plans for serious work</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { name: "Free", price: "0", features: ["1 Campaign / mo", "Basic AI Access", "Local Preview", "Community Support"] },
                 { name: "Starter", price: "29", features: ["10 Campaigns / mo", "Custom Personas", "Email Integration", "Priority Support"], popular: true },
                 { name: "Business", price: "99", features: ["Unlimited Campaigns", "Full Agent Tuning", "Advanced SEO", "Dedicated Manager"] }
               ].map((plan, i) => (
                  <div key={i} className={cn(
                    "relative p-10 rounded-[2.5rem] bg-white shadow-sm ring-1 ring-zinc-200 transition-all hover:shadow-xl",
                    plan.popular && "ring-zinc-900 border-zinc-900 shadow-xl scale-105 z-10"
                  )}>
                     {plan.popular && <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest">Most Popular</span>}
                     <h3 className="text-sm font-bold uppercase text-zinc-400 tracking-widest mb-4">{plan.name}</h3>
                     <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-zinc-400 text-sm">/mo</span>
                     </div>
                     <ul className="space-y-4 mb-10 text-sm text-zinc-500">
                        {plan.features.map(f => (
                           <li key={f} className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> {f}</li>
                        ))}
                     </ul>
                     <button className={cn(
                        "w-full py-4 rounded-xl font-bold transition-all active:scale-95",
                        plan.popular ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                     )}>Choose Plan</button>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- BLOG / IDEAS --- */}
      <section className="py-32 px-6 sm:px-12 bg-white">
         <div className="max-w-7xl mx-auto space-y-16">
            <h2 className="text-4xl font-bold tracking-tight text-center">Ideas to level up your campaign game</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-6 group cursor-pointer">
                  <div className="aspect-[16/9] rounded-[2rem] overflow-hidden shadow-lg"><img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2670" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Blog" /></div>
                  <div className="space-y-2">
                     <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Tutorials</span>
                     <h3 className="text-2xl font-bold">How to start a 100% automated agency in 30 days</h3>
                  </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    "Mastering the Agent Prompts",
                    "Scaling Fact-Integrity",
                    "The Future of Technical Writing",
                    "SEO in the Era of AI"
                  ].map((title, i) => (
                    <div key={i} className="aspect-square bg-zinc-50 rounded-3xl p-8 flex flex-col justify-end gap-3 group cursor-pointer">
                       <h4 className="text-lg font-bold group-hover:text-blue-600 transition-colors leading-tight">{title}</h4>
                       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Read Article</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-32 px-6 sm:px-12 bg-blue-50/50">
         <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight">Ready to get started?</h2>
            <Link href="/login" className="inline-block px-12 py-5 rounded-xl bg-zinc-900 text-white font-bold shadow-2xl transition-all hover:-translate-y-1 active:scale-95">Start free trial today</Link>
         </div>
      </section>

      <footer className="py-24 px-6 sm:px-12 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-16">
          <div className="col-span-2 lg:col-span-1 space-y-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-zinc-900 rounded-lg flex items-center justify-center"><Send className="text-white h-4 w-4 transform -rotate-12" /></div>
              <span className="font-bold text-xl tracking-tight">ContentFactory</span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">Built for technical marketers and automation-first agencies worldwide.</p>
            <div className="flex gap-4 text-zinc-400">
               <Twitter size={20} /><Youtube size={20} /><Instagram size={20} /><Linkedin size={20} />
            </div>
          </div>
          <div><h4 className="font-bold text-sm uppercase tracking-widest mb-8">Platform</h4><ul className="space-y-4 text-sm text-zinc-500"><li>Features</li><li>Agents</li><li>Resources</li><li>Security</li></ul></div>
          <div><h4 className="font-bold text-sm uppercase tracking-widest mb-8">Resources</h4><ul className="space-y-4 text-sm text-zinc-500"><li>Blog</li><li>Documentation</li><li>Case Studies</li><li>API</li></ul></div>
          <div><h4 className="font-bold text-sm uppercase tracking-widest mb-8">Company</h4><ul className="space-y-4 text-sm text-zinc-500"><li>About</li><li>Contact</li><li>Privacy</li><li>Legal</li></ul></div>
        </div>
        <div className="max-w-7xl mx-auto pt-24 flex justify-between items-center opacity-30">
          <span className="text-xs font-medium">© 2026 ContentFactory AI</span>
          <span className="text-xs font-medium">Built by creators for creators</span>
        </div>
      </footer>
    </div>
  );
}
