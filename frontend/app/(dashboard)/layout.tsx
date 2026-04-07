import { createClient } from "@/src/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardProvider } from "@/src/context/DashboardContext";
import { DashboardSidebar } from "@/src/components/DashboardSidebar";

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
    <DashboardProvider>
      <div className="flex h-screen w-full bg-zinc-50 font-outfit text-zinc-900 overflow-hidden">
        {/* --- SIDEBAR --- */}
        <DashboardSidebar userEmail={user.email} />

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
                
                {/* DROPDOWN BRIDGE (To prevent closing when moving mouse) */}
                <div className="absolute right-0 top-0 pt-12 mt-0 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                  <div className="p-2 rounded-3xl bg-white border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
                    <div className="px-4 py-3 border-b border-zinc-50 mb-1">
                      <p className="text-xs font-bold truncate text-zinc-900">{user.email}</p>
                    </div>
                    <div className="px-4 py-2.5 rounded-2xl text-[13px] font-bold text-zinc-300 cursor-not-allowed">
                      Settings (Coming Soon)
                    </div>
                    <form action="/signout" method="post">
                      <button className="w-full text-left px-4 py-2.5 rounded-2xl text-[13px] font-bold text-red-500 transition-colors hover:bg-red-50">
                        Sign Out
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="flex-1 bg-zinc-50">
            {children}
          </section>
        </main>
      </div>
    </DashboardProvider>
  );
}