"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useCampaignStream } from "@/src/hooks/useCampaignStream";
import { use } from "react";

export default function AgentRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { logs, isCompleted, error, activeAgentId } = useCampaignStream(id);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Auto-scroll to the bottom whenever a new log arrives
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth"
        });
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-zinc-50 font-outfit text-zinc-900 overflow-hidden">
      {/* --- HEADER --- */}
      <div className="flex h-16 items-center justify-between px-8 bg-white border-b border-zinc-100 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-lg shadow-zinc-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <h1 className="font-playfair text-xl font-bold italic">Agent Assembly Line</h1>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 px-2 py-1 rounded-md">ID: {id || 'CAM-001'}</span>
        </div>
        
        <Link 
          href={`/campaign/${id}/review`}
          className={`flex items-center gap-2 px-6 py-2 rounded-full border border-zinc-200 transition-all text-[12px] font-bold ${
            isCompleted 
                ? "bg-zinc-900 border-zinc-900 text-white shadow-xl shadow-zinc-200" 
                : "bg-white text-zinc-400 pointer-events-none opacity-50"
          }`}
        >
          {isCompleted ? "View Drafts →" : "Collaborating..."}
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden p-8 gap-8">
        {/* --- LEFT: AGENT STATUS GRID --- */}
        <div className="w-80 flex flex-col gap-6">
          <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2 px-1">Active Personas</h2>
          
          {[
            { id: "researcher", name: "Lead Research", role: "Analytical Brain", icon: "🧠" },
            { id: "copywriter", name: "Creative Copy", role: "Content Engine", icon: "🎨" },
            { id: "editor", name: "Editor-in-Chief", role: "QA Gatekeeper", icon: "⚖️" },
          ].map((agent, i) => {
            const isActive = activeAgentId === agent.id;
            const isDone = logs.some(l => l.agent_id === agent.id && l.status === 'completed');
            
            return (
              <div 
                key={i} 
                className={`relative p-6 rounded-[2.5rem] border bg-white shadow-sm transition-all duration-500 ${isActive ? 'ring-4 ring-blue-50 border-blue-200 -translate-y-1' : 'border-zinc-100 opacity-60 font-medium'}`}
              >
                {isActive && (
                  <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg animate-bounce">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </div>
                )}
                {isDone && !isActive && (
                  <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-3">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-colors ${isActive ? 'bg-blue-50' : 'bg-zinc-50'}`}>
                    {agent.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900">{agent.name}</span>
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{agent.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-blue-500 animate-pulse' : isDone ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                   <span className={`text-[11px] font-bold ${isActive ? 'text-blue-500' : isDone ? 'text-emerald-500' : 'text-zinc-400'}`}>
                       {isActive ? "Thinking..." : isDone ? "Completed" : "Idle"}
                   </span>
                </div>
              </div>
            );
          })}

          <div className={`mt-auto p-6 rounded-[2.5rem] shadow-2xl transition-all duration-500 ${error ? 'bg-red-950 ring-4 ring-red-500/20' : 'bg-zinc-950'}`}>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Production Status</h4>
              <p className="font-playfair text-sm italic leading-relaxed text-zinc-300">
                {error ? "System halted due to external quota failure. Retrying with alternative model..." : `Campaign Round: ${logs.reduce((max, l) => Math.max(max, (l as any).loop_count || 0), 0) + 1}`}
              </p>
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

          <div ref={scrollRef} className="flex-1 p-10 space-y-10 overflow-y-auto custom-scrollbar scroll-smooth">
            {/* System Start */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.3em] bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100">Assembly Line Started</span>
            </div>

            {/* Error Message if any */}
            {error && (
                 <div className="p-6 rounded-3xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in zoom-in-95 duration-300">
                    ⚠️ {error}
                 </div>
            )}

            {/* Dynamic Logs */}
            {logs.map((log, i) => (
                <div key={i} className={`flex gap-6 max-w-2xl animate-in slide-in-from-bottom-5 fade-in duration-500`}>
                   <div className="h-10 w-10 shrink-0 rounded-2xl bg-zinc-50 flex items-center justify-center text-xl shadow-inner">
                      {log.agent_id === 'researcher' ? '🧠' : log.agent_id === 'copywriter' ? '🎨' : '⚖️'}
                   </div>
                   <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-zinc-900">{log.agent_name}</span>
                        <span className="text-[10px] font-medium text-zinc-300 tracking-tighter uppercase whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`p-6 rounded-3xl rounded-tl-sm text-sm leading-relaxed border shadow-sm transition-all hover:scale-[1.01] ${
                          log.agent_id === 'researcher' ? 'bg-zinc-50 border-zinc-100 text-zinc-600' : 
                          log.agent_id === 'copywriter' ? 'bg-blue-500 text-white border-blue-400' : 
                          'bg-emerald-50 border-emerald-100 text-emerald-700'
                      }`}>
                        {log.message}
                      </div>
                   </div>
                </div>
            ))}

            {!isCompleted && !error && (
                <div className="flex flex-col items-center justify-center space-y-4 opacity-40 py-10">
                   <div className="h-12 w-12 rounded-[1.5rem] bg-zinc-100 flex items-center justify-center animate-pulse">
                      <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                   </div>
                   <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.3em] font-medium">Listening for specialized agents...</p>
                </div>
            )}
            
            {/* Final Completion State */}
            {isCompleted && (
                 <div className="flex flex-col items-center pt-4 scale-up-fade">
                    <div className="px-6 py-2 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest border border-emerald-200">
                      Phase Complete &bull; Fact-Sheet Finalized
                    </div>
                </div>
            )}
          </div>

          <div className="p-8 border-t border-zinc-50 bg-white/80 backdrop-blur-md">
             <div className="flex items-center justify-between gap-4">
                 <div className={`flex-1 px-6 py-4 rounded-3xl border text-[13px] font-medium transition-all ${
                    isCompleted ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : error ? 'bg-red-50 border-red-100 text-red-600' : 'bg-zinc-50 border-zinc-100 text-zinc-400 italic'
                }`}>
                   {isCompleted ? "All agents finished." : error ? "Assembly line halted." : "Agents are collaborating in silence..."}
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
