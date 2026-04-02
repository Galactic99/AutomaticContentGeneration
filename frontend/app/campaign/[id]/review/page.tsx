"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const campaignId = id || 'CAM-001';

  const router = useRouter();
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [socialPlatform, setSocialPlatform] = useState<"x" | "linkedin" | "instagram">("x");
  const [showSource, setShowSource] = useState(false);
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [approvals, setApprovals] = useState<Record<string, string>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!campaignId) return;
    fetch(`http://localhost:8000/api/v1/campaign/${campaignId}/results`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load campaign results");
        return res.json();
      })
      .then(data => {
        setResults(data);
        if (data.approvals) {
          setApprovals(data.approvals);
        }
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [campaignId]);

  const handleDownloadKit = () => {
    if (!results?.drafts) return;
    const kitText = `
--- BLOG DRAFT ---
${results.drafts.blog}

--- SOCIAL MEDIA ---
${results.drafts.linkedin_thread ? (Array.isArray(results.drafts.linkedin_thread) ? results.drafts.linkedin_thread.join('\n\n') : results.drafts.linkedin_thread) : ''}

--- EMAIL ---
Subject: ${results.drafts.email?.subject || ''}
${results.drafts.email?.body || ''}
`;
    const blob = new Blob([kitText.trim()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `campaign_kit_${campaignId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRefine = async () => {
    if (!feedbackText.trim() || isRefining) return;
    setIsRefining(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/campaign/${campaignId}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correction_notes: feedbackText })
      });
      if (!res.ok) throw new Error("Failed to queue refinement");
      router.push(`/campaign/${campaignId}/room`);
    } catch (err) {
      console.error(err);
      alert("Failed to refine. Ensure the backend is running.");
      setIsRefining(false);
    }
  };

  const handleApprove = async (platform: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/campaign/${campaignId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setApprovals(prev => {
          const next = { ...prev };
          if (data.is_approved) {
            next[platform] = new Date().toISOString();
          } else {
            delete next[platform];
          }
          return next;
        });
      }
    } catch (err) {
      console.error('Approval toggle failed:', err);
    }
  };

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
                  onClick={() => setShowSource(!showSource)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${showSource ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-900"}`}
                >
                  Source Context
                </button>
                <div className="w-px bg-zinc-200 mx-1" />
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
                <button 
                  onClick={() => setShowRefineModal(true)}
                  className="px-8 py-3 rounded-2xl bg-white border border-blue-200 text-blue-600 text-[13px] font-bold transition-all hover:border-blue-300 hover:bg-blue-50 shadow-sm active:scale-95 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Refine Drafts
                </button>
                <button 
                  onClick={handleDownloadKit}
                  className="px-8 py-3 rounded-2xl bg-zinc-900 text-white text-[13px] font-bold transition-all hover:bg-zinc-800 shadow-xl shadow-zinc-200 active:scale-95 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Download Kit
                </button>
             </div>
          </div>
        </header>

        {/* --- MAIN DISPLAY AREA (RESPONSIVE GRID) --- */}
        <div className={`flex flex-col xl:flex-row gap-12 transition-all duration-700`}>
           
           {/* --- SOURCE CONTEXT PANEL (Collapsible) --- */}
           {showSource && (
             <div className="w-full xl:w-1/3 flex flex-col gap-6 animate-in slide-in-from-left-4 fade-in duration-500">
               <div className="flex items-center justify-between px-2">
                  <h3 className="font-playfair text-xl font-bold italic">Source Document</h3>
                  <div className="text-[10px] font-bold text-zinc-400">Context</div>
               </div>
               <div className="bg-white rounded-[2.5rem] border border-zinc-100 min-h-[650px] max-h-[800px] shadow-2xl flex flex-col overflow-hidden">
                 
                 {/* Ambiguities Alert */}
                 {results?.fact_sheet?.ambiguous_statements && results.fact_sheet.ambiguous_statements.length > 0 && (
                 <div className="p-6 bg-yellow-50 border-b border-yellow-100 flex flex-col gap-3 shrink-0">
                    <div className="flex items-center gap-2 text-yellow-800 text-xs font-bold uppercase tracking-widest">
                       <span>⚠️</span> Researcher Insights (Ambiguities)
                    </div>
                    <ul className="list-disc pl-5 text-[13px] text-yellow-900/80 space-y-1">
                       {results.fact_sheet.ambiguous_statements.map((stmt: string, i: number) => (
                          <li key={i}>{stmt}</li>
                       ))}
                    </ul>
                 </div>
                 )}

                 <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                      <p className="text-sm font-outfit text-zinc-400 italic">Processing source text...</p>
                    ) : results?.source_text?.startsWith("[FILE_URL_REFERENCE]::") ? (
                      <div className="flex flex-col items-center justify-center h-full gap-6 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="h-20 w-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div className="space-y-2">
                           <h4 className="font-bold text-lg">Source Document Ready</h4>
                           <p className="text-sm text-zinc-500 max-w-[240px] mx-auto">This campaign was generated from an external document reference.</p>
                        </div>
                        <a 
                          href={results.source_text.split("::")[1]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-8 py-3 rounded-2xl bg-zinc-900 text-white text-[13px] font-bold shadow-xl shadow-zinc-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          View Original Document
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm font-outfit leading-relaxed text-zinc-600 whitespace-pre-wrap">
                        {results?.source_text || "No source text available."}
                      </p>
                    )}
                 </div>
               </div>
             </div>
           )}

           {/* --- DRAFTS GRID --- */}
           <div className={`flex-1 grid grid-cols-1 gap-8 transition-all duration-700 ${viewMode === 'desktop' ? (showSource ? 'xl:grid-cols-2 lg:grid-cols-2' : 'lg:grid-cols-3 xl:grid-cols-3') : 'grid-cols-1 md:grid-cols-3'}`}>
           
           {/* --- ARTICLE / BLOG --- */}
           <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                 <h3 className="font-playfair text-xl font-bold italic">Blog Master</h3>
                 <div className="flex gap-2 text-[10px] font-bold text-zinc-400">
                    <button onClick={() => navigator.clipboard.writeText(results?.drafts?.blog || "")} className="hover:text-blue-600">Copy</button>
                    <span>/</span>
                    {approvals.blog ? (
                       <button 
                          onClick={() => handleApprove('blog')}
                          className="flex items-center gap-1 text-emerald-500 hover:text-emerald-700 transition-all group"
                          title="Click to unverify"
                       >
                          <svg className="h-3 w-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                          <span className="group-hover:line-through decoration-emerald-300">Verified</span>
                       </button>
                    ) : (
                       <button onClick={() => handleApprove('blog')} className="hover:text-emerald-600">Approve</button>
                    )}
                 </div>
              </div>

              <div className={`bg-zinc-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col transition-all duration-700 relative overflow-hidden ${viewMode === 'mobile' ? 'aspect-[9/19.5] rounded-[3rem] border-[8px] border-zinc-900 mx-auto w-full max-w-[320px] ring-1 ring-white/10' : 'rounded-[2.5rem] border border-zinc-100 min-h-[650px]'}`}>
                  
                  {/* Mobile Notch Mockup */}
                  {viewMode === 'mobile' && (
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-20 flex items-center justify-center gap-1">
                        <div className="h-1.5 w-8 bg-zinc-800 rounded-full" />
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                     </div>
                  )}

                  <div className={`flex-1 bg-white overflow-y-auto no-scrollbar rounded-t-[calc(3rem-8px)] ${viewMode === 'mobile' ? 'pt-6 px-6 pb-0' : 'p-10'}`}>
                     <div className="space-y-8 animate-in fade-in duration-700">
                        {/* Substack Style Header on Mobile */}
                        {viewMode === 'mobile' && (
                           <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6 mb-2">
                              <div className="flex items-center gap-2">
                                 <div className="h-8 w-8 rounded bg-zinc-900 flex items-center justify-center text-white font-bold text-xs">C</div>
                                 <div className="flex flex-col -gap-0.5">
                                    <span className="text-[12px] font-bold">Campaign Factory</span>
                                    <span className="text-[10px] text-zinc-400">Published 2h ago</span>
                                 </div>
                              </div>
                           </div>
                        )}
                        
                        <h2 className={`font-playfair font-bold text-zinc-900 leading-tight ${viewMode === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                           {results?.drafts?.blog?.split('\n')[0]?.replace('#', '') || "Campaign Strategy Blog"}
                        </h2>
                        
                        <div className="space-y-5 text-zinc-600 leading-relaxed font-outfit text-sm whitespace-pre-wrap selection:bg-blue-100">
                           {isLoading ? "Assembling your long-form draft..." : error ? error : (results?.drafts?.blog || "No blog draft generated.")}
                        </div>
                     </div>
                  </div>

                  <div className={`p-6 bg-zinc-50/80 backdrop-blur-md border-t border-zinc-100 flex gap-3 mt-auto shrink-0 z-10`}>
                     {approvals.blog ? (
                        <button 
                           onClick={() => handleApprove('blog')}
                           className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[11px] font-bold border border-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-100 hover:border-emerald-200 transition-all group active:scale-95"
                           title="Click to unverify"
                        >
                           <svg className="h-4 w-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                           Verified
                        </button>
                     ) : (
                        <button 
                           onClick={() => handleApprove('blog')}
                           className="flex-1 py-3 bg-zinc-900 text-white rounded-2xl text-[11px] font-bold shadow-lg shadow-zinc-200 transition-all hover:scale-105 active:scale-95">
                           Approve
                        </button>
                     )}
                     <button 
                        disabled={!!approvals.blog}
                        className={`flex-1 py-3 text-[11px] font-bold border transition-all rounded-2xl ${approvals.blog ? 'bg-zinc-50 text-black border-zinc-100' : 'bg-white border-zinc-200 text-black hover:bg-zinc-50 active:scale-95'}`}>
                        Regenerate
                     </button>
                  </div>

                  {/* Mobile Home Indicator Mockup */}
                  {viewMode === 'mobile' && (
                    <div className="h-6 w-full flex items-center justify-center bg-zinc-50/80 backdrop-blur-md shrink-0 pb-2">
                       <div className="h-1 w-32 bg-zinc-200 rounded-full" />
                    </div>
                  )}
               </div>
           </div>

           {/* --- EMAIL (IMPROVED GMAIL MOCKUP) --- */}
           <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                 <h3 className="font-playfair text-xl font-bold italic">Email Draft</h3>
                 <div className="flex gap-2 text-[10px] font-bold text-zinc-400">
                    <button onClick={() => navigator.clipboard.writeText((results?.drafts?.email?.subject || "") + "\n\n" + (results?.drafts?.email?.body || ""))} className="hover:text-blue-600">Copy</button>
                    <span>/</span>
                    {approvals.email ? (
                       <button 
                          onClick={() => handleApprove('email')}
                          className="flex items-center gap-1 text-emerald-500 hover:text-emerald-700 transition-all group"
                          title="Click to unverify"
                       >
                          <svg className="h-3 w-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                          <span className="group-hover:line-through decoration-emerald-300">Verified</span>
                       </button>
                    ) : (
                       <button onClick={() => handleApprove('email')} className="hover:text-emerald-600">Approve</button>
                    )}
                 </div>
              </div>

              <div className={`bg-zinc-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col transition-all duration-700 relative overflow-hidden ${viewMode === 'mobile' ? 'aspect-[9/19.5] rounded-[3rem] border-[8px] border-zinc-900 mx-auto w-full max-w-[320px] ring-1 ring-white/10' : 'rounded-[2.5rem] border border-zinc-100 min-h-[650px]'}`}>
                  
                  {/* Mobile Notch Mockup */}
                  {viewMode === 'mobile' && (
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-20 flex items-center justify-center gap-1">
                        <div className="h-1.5 w-8 bg-zinc-800 rounded-full" />
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                     </div>
                  )}

                  <div className="flex-1 bg-white overflow-y-auto no-scrollbar rounded-t-[calc(3rem-8px)]">
                     {/* Gmail Top Bar */}
                     <div className="h-12 bg-white border-b border-zinc-100 flex items-center px-4 justify-between shrink-0 sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                           <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                           <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" className="h-4" alt="Gmail" />
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="h-5 w-5 rounded-full border-2 border-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-400">P</div>
                        </div>
                     </div>

                     <div className={`pt-6 px-6 pb-0 animate-in slide-in-from-bottom-4 duration-700`}>
                        <div className="mb-8 space-y-6">
                           <div className="flex items-start justify-between">
                              <h4 className="text-2xl font-semibold text-zinc-900 leading-tight tracking-tight">
                                 {isLoading ? "Generating strategy..." : (results?.drafts?.email?.subject || "Digital Assembly Strategy")}
                              </h4>
                              <svg className="h-6 w-6 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                           </div>

                           <div className="flex items-center gap-3">
                              <div className="h-12 w-12 shrink-0 rounded-full bg-[#EA4335] text-white flex items-center justify-center font-bold text-lg shadow-lg ring-4 ring-red-50">C</div>
                              <div className="flex flex-col min-w-0">
                                 <div className="flex items-center gap-2">
                                    <span className="text-[15px] font-bold text-zinc-900 truncate">ContentFactory</span>
                                    <span className="text-[12px] text-zinc-400">2h ago</span>
                                 </div>
                                 <span className="text-[12px] text-zinc-500 truncate">to: marketing-team@client.com</span>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6 text-[15px] text-zinc-800 leading-relaxed font-sans whitespace-pre-wrap">
                           {isLoading ? "Drafting email..." : (results?.drafts?.email?.body || "No email content generated.")}
                        </div>

                        <div className="mt-12 flex flex-col gap-3">
                           <button className="w-full py-4 rounded-xl bg-zinc-50 border border-zinc-200 text-[13px] font-bold text-zinc-900 flex items-center justify-center gap-2 transition-all hover:bg-zinc-100 active:scale-[0.98]">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5"/></svg>
                              Reply to Thread
                           </button>
                           <button className="w-full py-4 rounded-xl bg-white border border-zinc-200 text-[13px] font-bold text-black flex items-center justify-center gap-2 transition-all hover:bg-zinc-50">
                              Forward Draft
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className={`p-6 bg-zinc-50/80 backdrop-blur-md border-t border-zinc-100 flex gap-3 mt-auto shrink-0 z-10`}>
                     {approvals.email ? (
                        <button 
                           onClick={() => handleApprove('email')}
                           className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[11px] font-bold border border-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-100 hover:border-emerald-200 transition-all group active:scale-95"
                           title="Click to unverify"
                        >
                           <svg className="h-4 w-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                           Verified
                        </button>
                     ) : (
                        <button 
                           onClick={() => handleApprove('email')}
                           className="flex-1 py-3 bg-zinc-900 text-white rounded-2xl text-[11px] font-bold shadow-lg shadow-zinc-200 transition-all hover:scale-105 active:scale-95">
                           Approve
                        </button>
                     )}
                     <button 
                        disabled={!!approvals.email}
                        className={`flex-1 py-3 text-[11px] font-bold border transition-all rounded-2xl ${approvals.email ? 'bg-zinc-50 text-black border-zinc-100' : 'bg-white border-zinc-200 text-black hover:bg-zinc-50 active:scale-95'}`}>
                        Regenerate
                     </button>
                  </div>

                  {/* Mobile Home Indicator Mockup */}
                  {viewMode === 'mobile' && (
                     <div className="h-6 w-full flex items-center justify-center bg-zinc-50/80 backdrop-blur-md shrink-0 pb-2">
                        <div className="h-1 w-32 bg-zinc-200 rounded-full" />
                     </div>
                  )}
               </div>
           </div>

           {/* --- SOCIAL (HUB) --- */}
           <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                 <h3 className="font-playfair text-xl font-bold italic">Social Stream</h3>
                  <div className="flex gap-2 text-[10px] font-bold text-zinc-400">
                    <button onClick={() => {
                        const content = socialPlatform === 'instagram' ? results?.drafts?.instagram_post : 
                                        Array.isArray(results?.drafts?.linkedin_thread) ? results?.drafts?.linkedin_thread.join('\n\n') : results?.drafts?.linkedin_thread;
                        navigator.clipboard.writeText(content || "");
                    }} className="hover:text-blue-600">Copy</button>
                    <span>/</span>
                    {approvals[`social_${socialPlatform}`] ? (
                       <button 
                          onClick={() => handleApprove(`social_${socialPlatform}`)}
                          className="flex items-center gap-1 text-emerald-500 hover:text-emerald-700 transition-all group"
                          title="Click to unverify"
                       >
                          <svg className="h-3 w-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                          <span className="group-hover:line-through decoration-emerald-300">Verified</span>
                       </button>
                    ) : (
                       <button onClick={() => handleApprove(`social_${socialPlatform}`)} className="hover:text-emerald-600">Approve</button>
                    )}
                 </div>
                 <div className="flex gap-2 p-1 bg-white border border-zinc-100 rounded-full shadow-sm">
                    <button onClick={() => setSocialPlatform('x')} className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${socialPlatform === 'x' ? 'bg-zinc-900 text-white' : 'text-zinc-300 hover:text-zinc-900'}`}>X</button>
                    <button onClick={() => setSocialPlatform('linkedin')} className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${socialPlatform === 'linkedin' ? 'bg-[#0077b5] text-white' : 'text-zinc-300 hover:text-zinc-900'}`}>in</button>
                    <button onClick={() => setSocialPlatform('instagram')} className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${socialPlatform === 'instagram' ? 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white' : 'text-zinc-300 hover:text-zinc-900'}`}>IG</button>
                 </div>
              </div>

              <div className={`bg-zinc-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col transition-all duration-700 relative overflow-hidden ${viewMode === 'mobile' ? 'aspect-[9/19.5] rounded-[3rem] border-[8px] border-zinc-900 mx-auto w-full max-w-[320px] ring-1 ring-white/10' : 'rounded-[2.5rem] min-h-[650px]'}`}>
                 
                 {/* Mobile Notch Mockup */}
                 {viewMode === 'mobile' && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-20 flex items-center justify-center gap-1">
                       <div className="h-1.5 w-8 bg-zinc-800 rounded-full" />
                       <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                    </div>
                 )}

                 <div className="flex-1 bg-white overflow-y-auto no-scrollbar">
                    {socialPlatform === 'x' ? (
                       <div className="animate-in fade-in duration-500 font-sans">
                          <div className="p-4 border-b border-zinc-50 flex gap-3 pb-6">
                             <div className="h-12 w-12 rounded-full bg-zinc-900 flex-shrink-0 flex items-center justify-center">
                                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                   <div className="flex items-center gap-1">
                                      <span className="text-[15px] font-bold truncate">ContentFactory AI</span>
                                      <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M22.5 12.5c0-1.58-.8-2.47-1.44-3.23l-.16-.2c-.47-.57-.7-1.31-.4-2.03.26-.6.7-1.13 1.23-1.54l.5-.36c.45-.3.75-.77.84-1.31.09-.55-.1-.1.1-.1s-.11-.1-.16-.1l-.1-.01c-.13-.02-.26-.03-.39-.03h-.14c-.03 0-.05 0-.08.01l-.22.01c-.14.01-.28.02-.42.02-.12.01-.25.01-.37.01-.11 0-.21-.01-.32-.01-.13 0-.25-.01-.38-.01-.1 0-.21 0-.31.01-.13 0-.27 0-.41.01-.12 0-.23 0-.35 0-.17 0-.33 0-.5.01-.12 0-.25.01-.37.01-.1 0-.21 0-.31.01s-.2.01-.31.02z"/></svg>
                                   </div>
                                   <span className="text-zinc-500 text-[14px]">...</span>
                                </div>
                                <div className="text-[15px] leading-relaxed text-zinc-900 whitespace-pre-wrap mb-4">
                                   {isLoading ? "Drafting..." : (Array.isArray(results?.drafts?.linkedin_thread) ? results.drafts.linkedin_thread.join('\n\n') : results?.drafts?.linkedin_thread) || "No draft available."}
                                </div>
                                
                                <div className="flex items-center justify-between text-zinc-500 max-w-xs pr-4">
                                   <div className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                      <span className="text-[12px]">2.4K</span>
                                   </div>
                                   <div className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">                                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                      <span className="text-[12px]">1.1K</span>
                                   </div>
                                   <div className="flex items-center gap-1.5 hover:text-red-500 transition-colors">                                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                      <span className="text-[12px]">8.9K</span>
                                   </div>
                                   <div className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">                                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                      <span className="text-[12px]">45K</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    ) : socialPlatform === 'linkedin' ? (
                       <div className="bg-[#f3f2ef] h-full animate-in fade-in duration-500 font-sans">
                          <div className="bg-white p-4 space-y-4 mb-2 shadow-sm">
                             <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                   <div className="h-12 w-12 rounded bg-[#0077b5] text-white flex items-center justify-center font-bold text-lg shadow-lg">CF</div>
                                   <div>
                                      <div className="text-[14px] font-bold text-zinc-900">ContentFactory AI</div>
                                      <div className="text-[11px] text-zinc-500 flex items-center gap-1">2h &bull; <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zM8 13a5 5 0 110-10 5 5 0 010 10z"/></svg> Public</div>
                                   </div>
                                </div>
                                <button className="text-blue-600 font-bold text-[13px] flex items-center gap-1">
                                   <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z"/></svg>                       Follow
                                </button>
                             </div>
                             <div className="text-[14px] text-zinc-900 leading-snug whitespace-pre-wrap">
                                {isLoading ? "Drafting..." : (Array.isArray(results?.drafts?.linkedin_thread) ? results.drafts.linkedin_thread.join('\n\n') : results?.drafts?.linkedin_thread) || "No draft available."}
                             </div>
                             <div className="aspect-video bg-zinc-800 flex items-center justify-center rounded-lg overflow-hidden group relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4 transition-all opacity-0 group-hover:opacity-100">
                                   <span className="text-white text-xs font-bold uppercase tracking-widest">Premium Creative Factory</span>
                                </div>
                                <h4 className="font-playfair text-2xl text-white italic drop-shadow-lg">Strategic Insight</h4>
                             </div>
                             <div className="flex items-center justify-between pt-3 text-zinc-500 border-t border-zinc-100 font-bold text-[11px]">
                                <div className="flex gap-4">
                                   <span className="flex items-center gap-1.5 hover:text-blue-600">Like</span>
                                   <span className="flex items-center gap-1.5 hover:text-blue-600">Comment</span>
                                   <span className="flex items-center gap-1.5 hover:text-blue-600">Repost</span>
                                </div>
                                <span className="hover:text-blue-600">Send</span>
                             </div>
                          </div>
                       </div>
                    ) : (
                       <div className="h-full bg-white animate-in fade-in duration-500 font-sans">
                          {/* IG Profile Bar */}
                          <div className="p-3 mb-1 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] p-[1.5px]">
                                   <div className="h-full w-full rounded-full bg-white p-[1.5px]">
                                      <div className="h-full w-full rounded-full bg-zinc-200" />
                                   </div>
                                </div>
                                <div className="flex flex-col -gap-0.5">
                                   <span className="text-[13px] font-bold">content.factory</span>
                                   <span className="text-[11px] text-zinc-500">Suggested for you</span>
                                </div>
                             </div>
                             <button className="text-blue-500 font-bold text-xs">Follow</button>
                          </div>
                          
                          {/* IG Content Area */}
                          <div className="aspect-square bg-zinc-900 flex flex-col items-center justify-center relative group overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-br from-[#833ab4]/30 to-[#fcb045]/30 group-hover:scale-105 transition-transform duration-700" />
                             <h4 className="font-playfair text-3xl text-white italic relative z-10 drop-shadow-2xl font-bold tracking-tighter">THE ASSEMBLY.</h4>
                          </div>

                          {/* IG Action Bar */}
                          <div className="p-3 space-y-3">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <svg className="h-6 w-6 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                   <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                   <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </div>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                             </div>
                             
                             <div className="space-y-1">
                                <span className="text-[13px] font-bold block mb-0.5">85,241 likes</span>
                                <p className="text-[13px] leading-snug">
                                   <span className="font-bold mr-2">content.factory</span>
                                   <span className="whitespace-pre-wrap text-zinc-800">{isLoading ? "Drafting..." : results?.drafts?.instagram_post || "No Instagram draft available."}</span>
                                </p>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>

                 <div className={`p-6 bg-zinc-50/80 backdrop-blur-md border-t border-zinc-100 flex gap-3 mt-auto shrink-0 z-10`}>
                     {approvals[`social_${socialPlatform}`] ? (
                        <button 
                           onClick={() => handleApprove(`social_${socialPlatform}`)}
                           className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[11px] font-bold border border-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-100 hover:border-emerald-200 transition-all group active:scale-95"
                           title="Click to unverify"
                        >
                           <svg className="h-4 w-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                           Verified
                        </button>
                     ) : (
                        <button 
                           onClick={() => handleApprove(`social_${socialPlatform}`)}
                           className="flex-1 py-3 bg-zinc-900 text-white rounded-2xl text-[11px] font-bold shadow-lg shadow-zinc-200 transition-all hover:scale-105 active:scale-95">
                           Approve
                        </button>
                     )}
                     <button 
                        disabled={!!approvals[`social_${socialPlatform}`]}
                        className={`flex-1 py-3 text-[11px] font-bold border transition-all rounded-2xl ${approvals[`social_${socialPlatform}`] ? 'bg-zinc-50 text-black border-zinc-100' : 'bg-white border-zinc-200 text-black hover:bg-zinc-50 active:scale-95'}`}>
                        Regenerate
                     </button>
                  </div>

                 {/* Mobile Home Indicator Mockup */}
                 {viewMode === 'mobile' && (
                    <div className="h-6 w-full flex items-center justify-center bg-zinc-50/80 backdrop-blur-md shrink-0 pb-2">
                       <div className="h-1 w-32 bg-zinc-200 rounded-full" />
                    </div>
                 )}
              </div>
            </div>

           </div>
        </div>
      </div>

      {/* --- REFINE MODAL --- */}
      {showRefineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-2xl p-8 max-w-2xl w-full flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-zinc-900">Request Revision</h4>
                  <p className="text-sm text-zinc-500">Provide feedback for the Copywriter to instantly regenerate these drafts.</p>
                </div>
              </div>
              <button onClick={() => setShowRefineModal(false)} className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <textarea 
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="e.g. Make the LinkedIn thread more professional, shorten the email, and don't oversell the features." 
              className="w-full h-32 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none custom-scrollbar"
            />
            
            <div className="flex justify-end gap-3 mt-2">
              <button 
                onClick={() => setShowRefineModal(false)}
                className="px-6 py-3 bg-white border border-zinc-200 text-zinc-600 font-bold text-[13px] rounded-xl hover:bg-zinc-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleRefine}
                disabled={isRefining || !feedbackText.trim()}
                className="px-8 py-3 bg-blue-600 text-white font-bold text-[13px] rounded-xl shadow-md hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                {isRefining ? "Queuing Pipeline..." : "Send to Assembly Line"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
