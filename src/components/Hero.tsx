"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, FileText } from "lucide-react";

export default function Hero({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-white flex flex-col items-center">
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Label Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-black text-black text-[10px] font-bold uppercase tracking-[0.2em] mb-10">
            Professional AI Audit Engine
          </div>

          <h1 className="text-6xl md:text-8xl font-black font-heading text-black mb-8 leading-[1.05] tracking-tight uppercase">
            Stop signing <br />
            <span className="highlighter shadow-[0_0_40px_rgba(255,255,0,0.3)]">blindly.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-black font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            Audit any contract in seconds. Identify hidden traps, negotiate better terms, 
            and <span className="underline decoration-yellow-400 decoration-4 underline-offset-4">protect your rights</span> with AI-powered precision.
          </p>
        </motion.div>

        {/* Upload Zone Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-20 mb-10"
        >
          {children}
        </motion.div>

        {/* Global Trust Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-12 text-[10px] font-bold uppercase tracking-[0.3em] text-black/40"
        >
          <div className="flex items-center gap-2 hover:text-black transition-colors">
            <Shield className="w-4 h-4" />
            <span>Encrypted Review</span>
          </div>
          <div className="flex items-center gap-2 hover:text-black transition-colors">
            <Zap className="w-4 h-4" />
            <span>Instant Results</span>
          </div>
          <div className="flex items-center gap-2 hover:text-black transition-colors">
            <FileText className="w-4 h-4" />
            <span>Multi-modal Engine</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
