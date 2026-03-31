"use client";

import React from "react";
import { Shield, PenLine } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-24 px-4 sm:px-6 lg:px-8 border-t-2 border-black bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex items-center gap-3 cursor-default group">
          <div className="flex items-center justify-center w-12 h-12 bg-black border-2 border-black group-hover:bg-yellow-400 group-hover:border-yellow-400 transition-all duration-300">
            <PenLine className="w-6 h-6 text-yellow-400 group-hover:text-black transition-colors" />
          </div>
          <span className="text-3xl font-black uppercase tracking-tighter text-black">
            Before<span className="text-yellow-500">Sign</span>
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-10 text-[10px] font-bold uppercase tracking-[0.3em] text-black">
          <span className="opacity-40">© {new Date().getFullYear()} BeforeSign Group</span>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto mt-20 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] leading-relaxed text-black/20 max-w-2xl mx-auto">
          Audit Protocol 4.0.1 // This platform provides automated contract analysis for educational and 
          informational purposes only. It does not constitute legal advice or an 
          attorney-client relationship.
        </p>
      </div>
    </footer>
  );
}
