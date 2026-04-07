"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/src/context/DashboardContext";
import { createClient } from "@/src/utils/supabase/client";

interface CampaignItem {
  id: string;
  name: string;
  created_at: string;
}

export function DashboardSidebar({ userEmail }: { userEmail: string | undefined }) {
  const { triggerUpload } = useDashboard();
  const [recentCampaigns, setRecentCampaigns] = useState<CampaignItem[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCampaigns() {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setRecentCampaigns(data);
      }
    }
    fetchCampaigns();
  }, [supabase]);

  function timeAgo(dateString: string) {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return past.toLocaleDateString();
  }

  return (
    <aside className="flex h-full w-72 flex-col bg-white border-r border-zinc-200 shadow-sm transition-all duration-300">
      <div className="p-8 pb-4">
        <Link href="/dashboard" className="flex flex-col gap-1 transition-opacity hover:opacity-80">
          <h1 className="font-playfair text-2xl font-bold tracking-tight text-zinc-900 italic">ContentFactory</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-semibold pl-0.5">Automated Assembly</p>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-8 overflow-y-auto custom-scrollbar">
        <div className="mb-8">
          <h3 className="px-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Core Actions</h3>
          <button 
            onClick={triggerUpload}
            className="w-full group flex items-center gap-3 rounded-2xl bg-zinc-900 border border-zinc-900 px-5 py-4 text-sm font-semibold text-white shadow-xl shadow-zinc-200 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-xs transition-colors group-hover:bg-zinc-600">
              +
            </div>
            New Campaign
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between px-4 mb-4">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Recent Activity</h3>
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          
          <div className="space-y-1">
            {recentCampaigns.length > 0 ? (
              recentCampaigns.map((campaign) => (
                <Link 
                  key={campaign.id}
                  href={`/campaign/${campaign.id}/review`}
                  className="group relative flex flex-col px-4 py-3 rounded-2xl transition-all duration-300 hover:bg-zinc-100/80 active:scale-[0.98]"
                >
                  <span className="text-sm font-medium text-zinc-800 truncate leading-snug">{campaign.name}</span>
                  <span className="text-[10px] text-zinc-400 font-medium">{timeAgo(campaign.created_at)}</span>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-8 text-center space-y-3 opacity-40">
                <div className="h-10 w-10 bg-zinc-100 rounded-2xl mx-auto flex items-center justify-center text-zinc-400">∅</div>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-loose">No recent activity <br/> detected</p>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-100">
         <Link href="/pricing" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-br from-zinc-50 to-white border border-zinc-200 shadow-sm transition-all hover:border-zinc-300">
            <div className="text-lg">⭐</div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">Upgrade Plan</span>
              <span className="text-[10px] text-zinc-400 font-medium">Unlock full agent power</span>
            </div>
         </Link>
      </div>
    </aside>
  );
}
