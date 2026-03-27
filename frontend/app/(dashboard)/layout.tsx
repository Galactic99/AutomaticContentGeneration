import { createClient } from "@/src/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen w-full bg-zinc-50 font-outfit text-zinc-900 overflow-hidden">
      {/* --- SIDEBAR --- */}
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
            <Link 
              href="/dashboard"
              className="group flex items-center gap-3 rounded-2xl bg-zinc-900 border border-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-zinc-200 transition-all hover:-translate-y-0.5"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-xs transition-colors group-hover:bg-zinc-600">
                +
              </div>
              New Campaign
            </Link>
          </div>

          <div>
            <div className="flex items-center justify-between px-4 mb-4">
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Recent Activity</h3>
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
            
            <div className="space-y-1">
              {/* --- MOCK PREVIOUS SESSIONS --- */}
              {[
                { id: "123", name: "Q3 Tech Release", date: "2h ago" },
                { id: "124", name: "Winter Pulse Doc", date: "Yesterday" },
                { id: "125", name: "Security Audit (v2)", date: "Jan 12" },
                { id: "126", name: "Blog: Future of AI", date: "Jan 10" },
              ].map((campaign) => (
                <Link 
                  key={campaign.id}
                  href={`/campaign/${campaign.id}/review`}
                  className="group relative flex flex-col px-4 py-3 rounded-2xl transition-all duration-300 hover:bg-zinc-100/80 active:scale-[0.98]"
                >
                  <span className="text-sm font-medium text-zinc-800 truncate leading-snug">{campaign.name}</span>
                  <span className="text-[10px] text-zinc-400 font-medium">{campaign.date}</span>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                    <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </div>
                </Link>
              ))}
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

      {/* --- MAIN --- */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="flex h-20 items-center justify-between px-10 border-b border-zinc-100 bg-white/60 backdrop-blur-xl z-20">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
             <span>Dashboard</span>
             <span className="text-zinc-200">/</span>
             <span className="text-zinc-900">Assembly Line</span>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-zinc-400 hover:text-zinc-900 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            </button>
            
            <div className="group relative">
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm ring-4 ring-zinc-50 transition-all hover:scale-110 active:scale-95">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center font-bold text-xs text-blue-600 uppercase tracking-tighter shadow-inner">
                  {user.email?.charAt(0)}
                </div>
              </button>
              
              {/* DROPDOWN (Simplified for Layout) */}
              <div className="absolute right-0 top-full mt-4 w-56 p-2 rounded-3xl bg-white border border-zinc-100 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                <div className="px-4 py-3 border-b border-zinc-50 mb-1">
                  <p className="text-xs font-bold truncate">{user.email}</p>
                  <p className="text-[10px] text-zinc-400 font-medium">Free Organization</p>
                </div>
                <Link href="/settings" className="flex items-center gap-2 px-4 py-2 rounded-2xl text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
                  Settings
                </Link>
                <form action="/auth/signout" method="post">
                  <button className="w-full text-left px-4 py-2 rounded-2xl text-[13px] font-medium text-red-500 transition-colors hover:bg-red-50">
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto bg-zinc-50">
          {children}
        </section>
      </main>
    </div>
  );
}