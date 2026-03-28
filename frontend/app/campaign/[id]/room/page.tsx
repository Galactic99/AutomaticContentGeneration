import React from "react";
import Link from "next/link";

export default async function AgentRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaignId = id || 'CAM-001';

  return (
    <div className="flex flex-col h-full bg-zinc-50 font-outfit text-zinc-900">
      {/* --- HEADER --- */}
      <div className="flex h-16 items-center justify-between px-8 bg-white border-b border-zinc-100 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-lg shadow-zinc-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <h1 className="font-playfair text-xl font-bold italic">Agent Assembly Line</h1>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 px-2 py-1 rounded-md">ID: {campaignId}</span>
        </div>
        
        <Link 
          href={`/campaign/${campaignId}/review`}
          className="px-6 py-2 rounded-full border border-zinc-200 bg-white text-[12px] font-bold text-zinc-600 transition-all hover:border-zinc-300 hover:shadow-sm"
        >
          View Drafts &rarr;
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden p-8 gap-8">
        {/* --- LEFT: AGENT STATUS GRID --- */}
        <div className="w-80 flex flex-col gap-6">
          <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2 px-1">Active Personas</h2>
          
          {[
            { name: "Lead Research", role: "Analytical Brain", status: "Completed", icon: "🧠", active: false },
            { name: "Creative Copy", role: "Content Engine", status: "Thinking...", icon: "🎨", active: true },
            { name: "Editor-in-Chief", role: "QA Gatekeeper", status: "Idle", icon: "⚖️", active: false },
          ].map((agent, i) => (
            <div 
              key={i} 
              className={`relative p-6 rounded-[2.5rem] border bg-white shadow-sm transition-all duration-500 ${agent.active ? 'ring-4 ring-blue-50 border-blue-200 -translate-y-1' : 'border-zinc-100 opacity-60'}`}
            >
              {agent.active && (
                <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg animate-bounce">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
              )}
              <div className="flex items-center gap-4 mb-3">
                <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-2xl shadow-inner uppercase tracking-tighter">
                  {agent.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-900">{agent.name}</span>
                  <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{agent.role}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <span className={`h-1.5 w-1.5 rounded-full ${agent.active ? 'bg-blue-500 animate-pulse' : 'bg-zinc-300'}`} />
                 <span className={`text-[11px] font-bold ${agent.active ? 'text-blue-500' : 'text-zinc-400'}`}>{agent.status}</span>
              </div>
            </div>
          ))}

          <div className="mt-auto p-6 rounded-[2.5rem] bg-zinc-950 text-white shadow-2xl">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Campaign Goal</h4>
              <p className="font-playfair text-sm italic leading-relaxed text-zinc-300">"Transforming Q3 technical specs into human-first marketing copy."</p>
          </div>
        </div>

        {/* --- RIGHT: LIVE CHAT FEED --- */}
        <div className="flex-1 flex flex-col bg-white rounded-[3.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden relative">
          <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
            <h3 className="font-playfair text-2xl font-bold text-zinc-900 italic">Live Collaboration</h3>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
               <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               Realtime Stream
            </div>
          </div>

          <div className="flex-1 p-10 space-y-10 overflow-y-auto custom-scrollbar">
            {/* System Start */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.3em] bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100">Assembly Line Started</span>
            </div>

            {/* Log 1: Research */}
            {/* <div className="flex gap-6 max-w-2xl">
               <div className="h-10 w-10 shrink-0 rounded-2xl bg-zinc-50 flex items-center justify-center text-xl shadow-inner">🧠</div>
               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-zinc-900">Lead Researcher</span>
                    <span className="text-[10px] font-medium text-zinc-300 tracking-tighter uppercase">12:04 PM</span>
                  </div>
                  <div className="p-6 rounded-3xl rounded-tl-sm bg-zinc-50 border border-zinc-100 text-sm leading-relaxed text-zinc-600 shadow-sm transition-all hover:scale-[1.01]">
                    Raw source document parsed. I've extracted **3 core value propositions** and mapped out the technical architecture of the new API. Creating the Fact-Sheet now.
                  </div>
               </div>
            </div> */}

            {/* Log 2: Copywriter */}
            {/* <div className="flex gap-6 max-w-2xl">
               <div className="h-10 w-10 shrink-0 rounded-2xl bg-zinc-50 flex items-center justify-center text-xl shadow-inner">🎨</div>
               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-zinc-900">Creative Copy</span>
                    <span className="text-[10px] font-medium text-zinc-300 tracking-tighter uppercase">Just now</span>
                  </div>
                  <div className="p-6 rounded-3xl rounded-tl-sm bg-blue-500 text-white text-sm leading-relaxed shadow-xl shadow-blue-200 transition-all hover:scale-[1.01]">
                    Fact-Sheet received. Initiating the "Professional/Trustworthy" tone module for the blog draft and "Engagement-Optimized" mode for the social thread. Standby.
                  </div>
               </div>
            </div> */}

            <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
               <div className="h-12 w-12 rounded-[1.5rem] bg-zinc-100 flex items-center justify-center animate-pulse">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
               </div>
               <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Listening for specialized agents...</p>
            </div>

            {/* Typing Indicator */}
            <div className="flex gap-6">
               <div className="h-10 w-10 shrink-0 rounded-2xl bg-zinc-50 flex items-center justify-center text-xl shadow-inner grayscale opacity-50 relative overflow-hidden">
                  🎨
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
               </div>
               <div className="flex items-center gap-1.5 p-6 rounded-3xl bg-zinc-50 border border-zinc-100">
                  <span className="h-1.5 w-1.5 bg-zinc-300 rounded-full animate-bounce"></span>
                  <span className="h-1.5 w-1.5 bg-zinc-300 rounded-full animate-bounce delay-150"></span>
                  <span className="h-1.5 w-1.5 bg-zinc-300 rounded-full animate-bounce delay-300"></span>
               </div>
            </div>
          </div>

          <div className="p-8 border-t border-zinc-50 bg-white/80 backdrop-blur-md">
             <div className="flex items-center justify-between gap-4">
                <div className="flex-1 px-6 py-4 rounded-3xl bg-zinc-50 border border-zinc-100 text-[13px] font-medium text-zinc-400 italic">
                   Agents are collaborating...
                </div>
                <button className="h-14 w-14 rounded-3xl bg-zinc-900 text-white flex items-center justify-center shadow-xl shadow-zinc-200 transition-all hover:-translate-y-1">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
