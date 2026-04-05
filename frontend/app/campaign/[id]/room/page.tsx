"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useCampaignStream, AgentPhase } from "@/src/hooks/useCampaignStream";
import { use } from "react";

export default function AgentRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { logs, isCompleted, error, activeAgentId, agentPhases, lastAgentMessage } = useCampaignStream(id);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on new logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const agents = [
    { id: "researcher" as const, name: "Lead Researcher", role: "Analytical Brain", icon: "🧠" },
    { id: "copywriter" as const, name: "Creative Copywriter", role: "Content Engine", icon: "🎨" },
    { id: "editor" as const, name: "Editor-in-Chief", role: "QA Gatekeeper", icon: "⚖️" },
  ];

  function getPhaseLabel(phase: AgentPhase, agentId: string): string {
    switch (phase) {
      case "thinking": 
        if (agentId === "researcher") return "Researching";
        if (agentId === "copywriter") return "Ideating";
        if (agentId === "editor") return "Auditing";
        return "Thinking";
      case "typing": return "In Progress";
      case "completed": return "Complete";
      case "idle": return "Idle";
      default: return phase;
    }
  }

  function getPhaseColor(phase: AgentPhase) {
    switch (phase) {
      case "thinking": return { dot: "bg-amber-400 animate-pulse", text: "text-amber-600", ring: "ring-amber-100 border-amber-200", iconBg: "bg-amber-50", badge: "bg-amber-500" };
      case "typing": return { dot: "bg-blue-500 animate-pulse", text: "text-blue-600", ring: "ring-blue-100 border-blue-200", iconBg: "bg-blue-50", badge: "bg-blue-500" };
      case "completed": return { dot: "bg-emerald-500", text: "text-emerald-600", ring: "border-emerald-100", iconBg: "bg-emerald-50", badge: "bg-emerald-500" };
      case "idle": return { dot: "bg-zinc-300", text: "text-zinc-400", ring: "border-zinc-100", iconBg: "bg-zinc-50", badge: "bg-zinc-300" };
    }
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50 font-outfit text-zinc-900 overflow-hidden">
      {/* Blink cursor animation */}
      <style jsx global>{`
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .typing-cursor::after {
          content: '▊';
          animation: blink-cursor 0.8s step-end infinite;
          color: currentColor;
          opacity: 0.6;
        }
      `}</style>

      {/* --- HEADER --- */}
      <div className="flex h-16 items-center justify-between px-8 bg-white border-b border-zinc-100 shadow-sm z-10 shrink-0">
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

      {/* --- MAIN CONTENT (flex-1 with min-h-0 for proper scroll containment) --- */}
      <div className="flex flex-1 min-h-0 p-6 gap-6">
        {/* --- LEFT: AGENT STATUS GRID --- */}
        <div className="w-72 flex flex-col gap-4 shrink-0 overflow-y-auto overflow-x-hidden custom-scrollbar pb-4 pr-1">
          <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1 px-1">Active Personas</h2>
          
          {agents.map((agent) => {
            const phase = agentPhases[agent.id];
            const isActive = activeAgentId === agent.id;
            const colors = getPhaseColor(phase);
            
            return (
              <div 
                key={agent.id} 
                className={`relative p-5 rounded-[2rem] border bg-white shadow-sm transition-all duration-500 ${
                  isActive 
                    ? `ring-4 ${colors.ring} -translate-y-0.5 shadow-lg` 
                    : phase === "completed" 
                      ? `${colors.ring} opacity-80` 
                      : 'border-zinc-100 opacity-50'
                }`}
              >
                {/* Status badge */}
                {phase !== "idle" && (
                  <div className={`absolute top-3 right-3 h-6 w-6 rounded-full ${colors.badge} flex items-center justify-center text-white shadow-md transition-all duration-300 ${isActive ? 'animate-bounce' : ''}`}>
                    {phase === "completed" ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    ) : phase === "thinking" ? (
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    ) : (
                      <span className="text-[10px]">✍️</span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-2">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl shadow-inner transition-colors duration-300 ${colors.iconBg}`}>
                    {agent.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-zinc-900">{agent.name}</span>
                    <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-wider">{agent.role}</span>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full transition-colors duration-300 ${colors.dot}`} />
                    <span className={`text-[11px] font-bold transition-colors duration-300 ${colors.text}`}>
                      {phase === "idle" && activeAgentId ? "Waiting..." : getPhaseLabel(phase, agent.id)}
                    </span>
                  </div>
                  <p className={`text-[10px] line-clamp-1 italic px-0.5 transition-all ${isActive ? 'text-zinc-600 font-medium' : 'text-zinc-400'}`}>
                    {lastAgentMessage[agent.id]}
                  </p>
                </div>

                {/* Activity progress bar */}
                {(phase === "typing" || phase === "thinking") && isActive && (
                  <div className="mt-2.5 h-1 w-full rounded-full bg-zinc-100 overflow-hidden">
                    <div className={`h-full rounded-full ${phase === "typing" ? "bg-blue-400" : "bg-amber-400"} transition-all duration-700`}
                      style={{ width: phase === "typing" ? "75%" : "33%", animation: "pulse 1.5s ease-in-out infinite" }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Pipeline Flow Indicator */}
          <div className={`mt-auto p-5 rounded-[2rem] shadow-2xl transition-all duration-500 ${error ? 'bg-red-950 ring-4 ring-red-500/20' : 'bg-zinc-950'}`}>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Pipeline Flow</h4>
            <div className="flex items-center gap-2 mb-3">
              {agents.map((agent, i) => {
                const phase = agentPhases[agent.id];
                const phaseColor = phase === "completed" ? "bg-emerald-500" : (phase === "thinking" || phase === "typing") ? "bg-blue-500 animate-pulse" : "bg-zinc-700";
                return (
                  <React.Fragment key={agent.id}>
                    <div className={`h-3 w-3 rounded-full ${phaseColor} transition-all duration-500`} title={agent.name} />
                    {i < agents.length - 1 && (
                      <div className={`flex-1 h-0.5 ${phase === "completed" ? "bg-emerald-500" : "bg-zinc-800"} transition-all duration-500`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <p className="font-playfair text-sm italic leading-relaxed text-zinc-300">
              {error 
                ? "System halted." 
                : isCompleted 
                  ? "All phases complete." 
                  : activeAgentId 
                    ? `Active: ${agents.find(a => a.id === activeAgentId)?.name}` 
                    : "Initializing..."}
            </p>
          </div>
        </div>

        {/* --- RIGHT: LIVE CHAT FEED (ChatGPT-style fixed scroll area) --- */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden">
          {/* Chat Header */}
          <div className="px-8 py-5 border-b border-zinc-100 flex items-center justify-between shrink-0">
            <h3 className="font-playfair text-xl font-bold text-zinc-900 italic">Live Collaboration</h3>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              isCompleted ? 'bg-emerald-50 text-emerald-600' : error ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
            }`}>
               <span className={`h-1.5 w-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : error ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`} />
               {isCompleted ? "Complete" : error ? "Error" : "Streaming"}
            </div>
          </div>

          {/* Chat Messages — this is the ONLY scrollable area (h-0 flex-1 forces containment) */}
          <div ref={scrollRef} className="h-0 flex-1 px-8 py-6 space-y-6 overflow-y-auto custom-scrollbar">
            {/* System Start */}
            <div className="flex flex-col items-center py-2">
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.3em] bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100">Assembly Line Started</span>
            </div>

            {/* Error */}
            {error && (
              <div className="p-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                ⚠️ {error}
              </div>
            )}

            {/* Dynamic Logs */}
            {logs.map((log, i) => {
              const isTyping = log.status === "typing";
              const isThinking = log.status === "thinking";
              const isActiveLog = isTyping || isThinking;
              return (
                <div key={i} className="flex gap-4 max-w-[85%] animate-in slide-in-from-bottom-2 fade-in duration-200">
                  <div className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center text-lg shadow-inner transition-colors ${
                    isActiveLog ? 'bg-blue-50' : log.agent_id === 'system' ? 'bg-zinc-800 text-white' : 'bg-zinc-50'
                  }`}>
                    {log.agent_id === 'researcher' ? '🧠' : log.agent_id === 'copywriter' ? '🎨' : log.agent_id === 'system' ? '⚙️' : '⚖️'}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-zinc-900">{log.agent_name}</span>
                    {isActiveLog ? (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse ${
                          isTyping ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50'
                        }`}>
                          {isTyping ? "Generating" : "Thinking"}
                        </span>
                      ) : (
                        <span>
                          
                        </span>
                      )}
                      <span className="text-[10px] font-medium text-zinc-300 ml-auto whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <div className={`px-4 py-3 rounded-2xl rounded-tl-sm text-[13px] leading-relaxed border shadow-sm whitespace-pre-wrap break-words transition-all duration-300 ${
                      isActiveLog ? 'ring-2 ring-offset-2 ring-blue-100' : ''
                    } ${
                      log.agent_id === 'system' ? 'bg-zinc-100 border-zinc-200 text-zinc-500 font-medium font-mono text-[11px]' :
                      log.agent_id === 'researcher' ? 'bg-zinc-50 border-zinc-200 text-zinc-700' : 
                      log.agent_id === 'copywriter' ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-100/50' : 
                      log.message.includes('REJECT') ? 'bg-red-50 border-red-200 text-red-800' :
                      'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}>
                      <span className={isTyping ? 'typing-cursor' : ''}>{log.message}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Waiting indicator */}
            {!isCompleted && !error && (
              <div className="flex flex-col items-center py-4 opacity-40">
                <div className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center animate-pulse mb-2">
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                </div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                  {activeAgentId ? `${agents.find(a => a.id === activeAgentId)?.name} is working...` : "Listening for agents..."}
                </p>
              </div>
            )}
            
            {/* Final Completion */}
            {isCompleted && (
              <div className="flex flex-col items-center py-4">
                <div className="px-5 py-2 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest border border-emerald-200">
                  Pipeline Complete &bull; All Drafts Ready
                </div>
              </div>
            )}
          </div>

          {/* Bottom status bar */}
          <div className="px-6 py-4 border-t border-zinc-100 bg-white shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className={`flex-1 px-5 py-3 rounded-2xl border text-[12px] font-medium transition-all ${
                isCompleted ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : error ? 'bg-red-50 border-red-100 text-red-600' : 'bg-zinc-50 border-zinc-100 text-zinc-400 italic'
              }`}>
                {isCompleted ? "All agents finished. Review your drafts." : error ? "Assembly line halted." : activeAgentId ? `${agents.find(a => a.id === activeAgentId)?.name} is actively working...` : "Agents are initializing..."}
              </div>
              <Link 
                href={`/campaign/${id}/review`}
                className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-all hover:-translate-y-0.5 ${
                  isCompleted ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-white opacity-40 pointer-events-none'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
