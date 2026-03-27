"use client";

import { signInWithGoogle } from "./actions";
import Link from "next/link";
import { motion } from "framer-motion";
import { Send, ChevronLeft, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-[#FDFCF9] font-outfit text-zinc-900 selection:bg-blue-100 overflow-hidden relative items-center justify-center">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-50/50 blur-[140px] rounded-full -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-50/40 blur-[120px] rounded-full -z-10" />

      {/* Navigation / Back to Home */}
      <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors font-semibold text-sm group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to site
        </Link>
      </div>

      {/* Simplified Centered Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[420px] p-6 sm:p-0 space-y-12 text-center"
      >
        {/* Brand Header */}
        <div className="space-y-8">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-zinc-900 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-zinc-200">
              <Send className="text-white h-7 w-7 transform -rotate-12" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
              Welcome <span className="italic text-zinc-300">back</span>
            </h1>
            <p className="text-zinc-400 font-medium text-lg leading-relaxed px-4">
              Access your personalized content factory and manage your assembly lines.
            </p>
          </div>
        </div>

        {/* Primary Auth Action */}
        <div className="space-y-6">
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="relative flex w-full h-[64px] items-center justify-center rounded-3xl bg-white border border-zinc-200 px-8 text-base font-bold text-zinc-900 transition-all hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-100/50 active:scale-[0.98] group"
            >
              {/* Google Icon (Absolute Left) */}
              <div className="absolute left-6">
                 <svg className="h-6 w-6" viewBox="0 0 24 24">
                   <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                   <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                   <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                   <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                 </svg>
              </div>

              <span>Continue with Google</span>

              {/* Arrow Icon (Absolute Right) */}
              <div className="absolute right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-zinc-400">
                <ArrowRight className="h-5 w-5" />
              </div>
            </button>
          </form>

          <p className="text-[11px] font-bold text-zinc-300 uppercase tracking-[0.3em]">
             Authorized Access Only
          </p>
        </div>

        {/* Legal / Policy Footer */}
        <div className="pt-12 text-center text-xs text-zinc-400 leading-relaxed font-medium">
          By signing in, you agree to our <br/>
          <Link href="#" className="text-zinc-900 border-b border-zinc-200 pb-0.5 hover:text-zinc-500 transition-colors">Terms of Service</Link> 
          <span className="mx-2 font-normal text-zinc-200">/</span>
          <Link href="#" className="text-zinc-900 border-b border-zinc-200 pb-0.5 hover:text-zinc-500 transition-colors">Privacy Policy</Link>
        </div>
      </motion.div>
    </div>
  );
}