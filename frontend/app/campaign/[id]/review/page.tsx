"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ReviewPage({ params }: { params: { id: string } }) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [socialPlatform, setSocialPlatform] = useState<"x" | "linkedin" | "instagram">("x");

  return (
    <div className="min-h-full bg-zinc-50 font-outfit p-4 sm:p-10 text-zinc-900 overflow-x-hidden selection:bg-blue-100 transition-all duration-300">
      <div className="max-w-[1700px] mx-auto space-y-12">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pb-8 border-b border-zinc-200">
          <div className="space-y-4">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100/50 w-fit">
               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
               Quality Check Passed
             </div>
             <h1 className="font-playfair text-5xl font-bold tracking-tight text-zinc-900">
               Review <span className="italic text-zinc-400">Drafts</span>
             </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
             {/* --- VIEW MODE TOGGLE --- */}
             <div className="flex p-1 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                <button 
                  onClick={() => setViewMode("desktop")}
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${viewMode === "desktop" ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-900"}`}
                >
                  Desktop
                </button>
                <button 
                  onClick={() => setViewMode("mobile")}
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${viewMode === "mobile" ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-900"}`}
                >
                  Mobile Views
                </button>
             </div>

             <div className="h-8 w-px bg-zinc-200 hidden xl:block" />

             <div className="flex gap-4">
                <Link 
                  href="/dashboard"
                  className="px-8 py-3 rounded-2xl bg-white border border-zinc-200 text-[13px] font-bold text-zinc-500 transition-all hover:border-zinc-300 hover:text-zinc-900 shadow-sm"
                >
                  &larr; Exit
                </Link>
                <button className="px-8 py-3 rounded-2xl bg-blue-600 text-white text-[13px] font-bold transition-all hover:bg-blue-700 shadow-xl shadow-blue-100 active:scale-95">
                  Publish All
                </button>
             </div>
          </div>
        </header>

        {/* --- MAIN DISPLAY AREA (RESPONSIVE GRID) --- */}
        <div className={`grid grid-cols-1 gap-12 transition-all duration-700 ${viewMode === 'desktop' ? 'lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'}`}>
           
           {/* --- ARTICLE / BLOG --- */}
           <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                 <h3 className="font-playfair text-xl font-bold italic">Blog Master</h3>
                 <div className="flex gap-2 text-[10px] font-bold text-zinc-400">
                    <button className="hover:text-blue-600">Edit</button>
                    <span>/</span>
                    <button className="hover:text-emerald-600">Approve</button>
                 </div>
              </div>

              <div className={`bg-white shadow-2xl overflow-hidden flex flex-col transition-all duration-700 ${viewMode === 'mobile' ? 'aspect-[9/19] rounded-[3.5rem] border-[10px] border-zinc-900 mx-auto w-full max-w-[340px]' : 'rounded-[2.5rem] border border-zinc-100 min-h-[650px]'}`}>
                 <div className="h-10 bg-zinc-50 border-b border-zinc-100 flex items-center px-6 gap-1.5 shrink-0">
                    <div className="h-2 w-2 rounded-full bg-zinc-200" />
                    <div className="h-2 w-2 rounded-full bg-zinc-200" />
                 </div>
                 <div className={`flex-1 overflow-y-auto no-scrollbar ${viewMode === 'mobile' ? 'p-6' : 'p-10'}`}>
                    <div className="space-y-6">
                       <h2 className={`font-playfair font-bold text-zinc-900 leading-tight ${viewMode === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>The Autonomous Content Factory</h2>
                       <div className="space-y-4 text-zinc-500 leading-relaxed font-outfit text-sm">
                          <p>Traditional content production is broken. Repurposing a single source of truth manually is no longer viable in the fast-paced economy.</p>
                          <p>By implementing a centralized assembly line, we've replaced the manual bottleneck with simplified AI orchestration.</p>
                       </div>
                    </div>
                 </div>
                 <div className="p-6 bg-zinc-50/50 border-t border-zinc-100 flex gap-3 mt-auto">
                    <button className="flex-1 py-3 bg-zinc-900 text-white rounded-2xl text-[11px] font-bold shadow-lg shadow-zinc-200 transition-all hover:scale-105">Approve</button>
                    <button className="flex-1 py-3 bg-white border border-zinc-200 text-zinc-400 rounded-2xl text-[11px] font-bold transition-all hover:bg-zinc-50">Regenerate</button>
                 </div>
              </div>
           </div>

           {/* --- EMAIL (IMPROVED GMAIL MOCKUP) --- */}
           <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                 <h3 className="font-playfair text-xl font-bold italic">Email Draft</h3>
                 <div className="flex gap-2 text-[10px] font-bold text-zinc-400">
                    <button className="hover:text-blue-600">Edit</button>
                    <span>/</span>
                    <button className="hover:text-emerald-600">Approve</button>
                 </div>
              </div>

              <div className={`bg-[#F6F8FC] shadow-2xl overflow-hidden flex flex-col transition-all duration-700 ${viewMode === 'mobile' ? 'aspect-[9/19] rounded-[3.5rem] border-[10px] border-zinc-900 mx-auto w-full max-w-[340px]' : 'rounded-[2.5rem] border border-zinc-100 min-h-[650px]'}`}>
                 
                 {/* Gmail Top Bar */}
                 <div className="h-10 bg-[#F6F8FC] border-b border-zinc-100 flex items-center px-4 justify-between shrink-0">
                    <div className="flex items-center gap-3">
                       <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                       <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" className="h-3.5" alt="Gmail" />
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-2 w-16 bg-zinc-200 rounded-full" />
                       <div className="h-6 w-6 rounded-full bg-zinc-200" />
                    </div>
                 </div>

                 {/* Gmail Side Panel Simulation */}
                 <div className="flex flex-1 overflow-hidden relative">
                    {/* Inbox View Simulation */}
                    <div className={`flex-1 overflow-y-auto no-scrollbar bg-white shadow-sm ring-1 ring-zinc-200/50 ${viewMode === 'mobile' ? 'm-0 p-4' : 'm-2 p-8 rounded-2xl'}`}>
                       <div className="mb-8 space-y-4">
                          <header className="flex items-center justify-between">
                             <h4 className="text-xl font-medium text-zinc-900 leading-tight">Redefining Digital Assembly</h4>
                             <div className="hidden sm:flex gap-1">
                                <span className="px-2 py-0.5 rounded bg-zinc-100 text-[10px] font-medium text-zinc-500">Inbox</span>
                             </div>
                          </header>

                          <div className="flex items-start justify-between">
                             <div className="flex items-start gap-3">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-[#EA4335] text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">C</div>
                                <div className="flex flex-col">
                                   <div className="flex items-center gap-1.5">
                                      <span className="text-[14px] font-bold text-zinc-900">ContentFactory AI</span>
                                      <span className="text-[11px] text-zinc-400">{"<noreply@contentfactory.ai>"}</span>
                                   </div>
                                   <span className="text-[11px] text-zinc-500">To: you@work.com</span>
                                </div>
                             </div>
                             <span className="text-[10px] text-zinc-400 hidden sm:block">2 hours ago</span>
                          </div>
                       </div>

                       <div className="space-y-6 text-[14px] text-zinc-700 leading-relaxed font-sans max-w-xl">
                          <p>Hi there,</p>
                          <p>Traditional content production is broken. It's too slow, too inconsistent, and frankly, too exhausting for modern marketing teams.</p>
                          <p>That's why we've re-imagined the creative process from the ground up to empower marketing teams everywhere. Our autonomous factory is online now.</p>
                          <p>Best,<br/><span className="font-bold">The Marketing Team</span></p>
                       </div>

                       <div className="mt-12 flex gap-3">
                          <button className="px-6 py-2 rounded-full border border-zinc-200 text-[11px] font-bold text-zinc-500 hover:bg-zinc-50 flex items-center gap-2">
                             <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5"/></svg>
                             Reply
                          </button>
                          <button className="px-6 py-2 rounded-full border border-zinc-200 text-[11px] font-bold text-zinc-500 hover:bg-zinc-50 flex items-center gap-2">
                             <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 14h10m0 0l-4-4m4 4l-4 4"/></svg>
                             Forward
                          </button>
                       </div>
                    </div>
                 </div>

                 <div className="p-6 bg-[#F6F8FC] border-t border-zinc-100 flex gap-3 mt-auto">
                    <button className="flex-1 py-3 bg-zinc-900 text-white rounded-2xl text-[11px] font-bold shadow-lg shadow-zinc-200 transition-all hover:scale-105">Approve</button>
                    <button className="flex-1 py-3 bg-white border border-zinc-200 text-zinc-400 rounded-2xl text-[11px] font-bold transition-all hover:bg-zinc-50">Regenerate</button>
                 </div>
              </div>
           </div>

           {/* --- SOCIAL (HUB) --- */}
           <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                 <h3 className="font-playfair text-xl font-bold italic">Social Stream</h3>
                 <div className="flex gap-2 p-1 bg-white border border-zinc-100 rounded-full shadow-sm">
                    <button onClick={() => setSocialPlatform('x')} className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${socialPlatform === 'x' ? 'bg-zinc-900 text-white' : 'text-zinc-300 hover:text-zinc-900'}`}>X</button>
                    <button onClick={() => setSocialPlatform('linkedin')} className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${socialPlatform === 'linkedin' ? 'bg-[#0077b5] text-white' : 'text-zinc-300 hover:text-zinc-900'}`}>in</button>
                    <button onClick={() => setSocialPlatform('instagram')} className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${socialPlatform === 'instagram' ? 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white' : 'text-zinc-300 hover:text-zinc-900'}`}>IG</button>
                 </div>
              </div>

              <div className={`bg-zinc-900 shadow-2xl overflow-hidden flex flex-col transition-all duration-700 ${viewMode === 'mobile' ? 'aspect-[9/19] rounded-[3.5rem] border-[10px] border-zinc-900 mx-auto w-full max-w-[340px]' : 'rounded-[2.5rem] min-h-[650px]'}`}>
                 <div className="flex-1 bg-white overflow-y-auto no-scrollbar">
                    {socialPlatform === 'x' ? (
                       <div className="animate-in fade-in duration-500">
                          <div className="p-4 border-b border-zinc-100 flex gap-3">
                             <div className="h-10 w-10 rounded-full bg-zinc-900 flex-shrink-0" />
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5"><span className="text-[14px] font-bold truncate">ContentFactory</span><span className="text-[12px] text-zinc-500">@CFactory &bull; 2h</span></div>
                                <p className="text-[14px] leading-normal text-zinc-900 font-sans">The era of manual repurposing is over. Fast, orchestrated, fact-checked campaigns at your fingertips. ⚡️</p>
                             </div>
                          </div>
                       </div>
                    ) : socialPlatform === 'linkedin' ? (
                       <div className="bg-[#f3f2ef] h-full animate-in fade-in duration-500">
                          <div className="bg-white p-4 space-y-3 mb-2">
                             <div className="flex gap-2">
                                <div className="h-10 w-10 rounded bg-[#0077b5] text-white flex items-center justify-center font-bold">CF</div>
                                <div><div className="text-[13px] font-bold">ContentFactory AI</div><div className="text-[11px] text-zinc-500">2h &bull; Public</div></div>
                             </div>
                             <p className="text-[13px] text-zinc-900 font-outfit leading-snug">Consistency is king. Our workflow ensures 100% accuracy across every marketing channel. 🚀</p>
                             <div className="aspect-video bg-zinc-800 flex items-center justify-center"><h4 className="font-playfair text-lg text-white italic">The Assembly Line</h4></div>
                             <div className="flex items-center gap-6 pt-3 text-zinc-500 border-t border-zinc-100 font-bold text-[11px]"><span>Like</span><span>Comment</span><span>Repost</span></div>
                          </div>
                       </div>
                    ) : (
                       <div className="h-full bg-white animate-in fade-in duration-500">
                          <div className="p-3 flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-gradient-to-tr from-orange-400 to-purple-600 p-[1px]"><div className="h-full w-full rounded-full bg-zinc-200" /></div><span className="text-[12px] font-bold">content.factory</span></div>
                          <div className="aspect-square bg-zinc-900 flex flex-col items-center justify-center relative"><div className="absolute inset-0 bg-gradient-to-br from-[#833ab4]/10 to-[#fcb045]/10" /><h4 className="font-playfair text-xl text-white italic">Pure Content.</h4></div>
                          <div className="p-3 text-[12px] space-y-1"><p><span className="font-bold">content.factory</span> The marketing kit that runs itself. ✍️</p></div>
                       </div>
                    )}
                 </div>
                 <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex gap-3 mt-auto">
                    <button className="flex-1 py-3 bg-zinc-900 text-white rounded-2xl text-[11px] font-bold shadow-lg shadow-zinc-200 transition-all hover:scale-105">Approve</button>
                    <button className="flex-1 py-3 bg-white border border-zinc-200 text-zinc-400 rounded-2xl text-[11px] font-bold transition-all hover:bg-zinc-50">Regenerate</button>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
