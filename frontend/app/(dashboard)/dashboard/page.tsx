export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-10 py-20 bg-zinc-50 font-outfit">
      <div className="w-full max-w-2xl text-center space-y-12">
        <header className="space-y-4">
          <h2 className="font-playfair text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            What are we creating <span className="italic text-zinc-400">today?</span>
          </h2>
          <p className="text-sm font-medium text-zinc-400 max-w-md mx-auto leading-relaxed uppercase tracking-wider">
            Start a new assembly line by dropping your technical source document below.
          </p>
        </header>

        {/* --- UPLOAD ZONE --- */}
        <div className="relative group cursor-pointer transition-all duration-500 hover:scale-[1.01]">
          {/* Decorative Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[4rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
          
          <div className="relative flex flex-col items-center justify-center p-16 rounded-[3rem] border-2 border-dashed border-zinc-200 bg-white/40 backdrop-blur-xl transition-all duration-300 group-hover:bg-white/80 group-hover:border-zinc-300">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-900 text-white shadow-2xl shadow-zinc-200 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="font-playfair text-2xl font-bold text-zinc-900 italic">Drop source document</h3>
              <p className="text-sm font-medium text-zinc-500">
                PDF, DOCX, or TXT (Max 25MB)
              </p>
            </div>

            <div className="mt-10 flex gap-4">
              <button className="px-8 py-3 rounded-2xl bg-zinc-900 text-white text-[13px] font-bold shadow-xl shadow-zinc-200 transition-all hover:bg-zinc-800 active:scale-95">
                Browse Files
              </button>
              <button className="px-8 py-3 rounded-2xl bg-white border border-zinc-200 text-zinc-600 text-[13px] font-bold shadow-sm transition-all hover:border-zinc-300 active:scale-95">
                Paste URL
              </button>
            </div>
          </div>
        </div>

        <footer className="pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 bg-white shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
              Processing Capability: High reasoning models active
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}