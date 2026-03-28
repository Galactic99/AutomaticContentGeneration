"use client";

import React, { useState } from "react";
import { FileUpload } from "@/src/components/FileUpload";

export default function Dashboard() {
  const [isUploading, setIsUploading] = useState(false);

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

        {/* --- DYNAMIC UPLOAD ZONE --- */}
        <FileUpload 
          onUploadStart={() => setIsUploading(true)}
        />

        {/* --- STATUS OVERLAY (OPTIONAL) --- */}
        {isUploading && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-6">
            <div className="h-20 w-20 flex items-center justify-center rounded-3xl bg-zinc-900 text-white shadow-2xl animate-bounce">
              <svg className="h-10 w-10 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            </div>
            <div className="space-y-2 text-center scale-up-fade">
              <h3 className="font-playfair text-3xl font-bold text-zinc-900 italic">Provisioning Agents</h3>
              <p className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Entering the Assembly Line...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}