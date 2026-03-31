"use client";

import React, { useState } from "react";
import { Shield, Menu, X, ArrowRight, PenLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="flex items-center justify-center w-10 h-10 bg-black border-2 border-black group-hover:bg-yellow-400 group-hover:border-yellow-400 transition-all duration-300">
              <PenLine className="w-5 h-5 text-yellow-400 group-hover:text-black transition-colors" />
            </div>
            <span className="text-2xl font-black font-heading tracking-tighter text-black uppercase">
              Before<span className="text-yellow-500">Sign</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10 text-sm font-bold text-black uppercase tracking-widest">
            <a href="#" className="hover:underline decoration-yellow-400 decoration-4 underline-offset-8 transition-all">Features</a>
            <a href="#" className="hover:underline decoration-yellow-400 decoration-4 underline-offset-8 transition-all">Security</a>
            <div className="h-4 w-[2px] bg-black" />
            <button className="modern-button text-xs py-2 px-6 flex items-center gap-2 group">
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="p-2 text-black hover:bg-black/5"
            >
              {isMobileMenuOpen ? (
                <X className="w-8 h-8" />
              ) : (
                <Menu className="w-8 h-8" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-black overflow-hidden"
          >
            <div className="px-6 py-4 space-y-2">
              <a 
                href="#" 
                className="block text-2xl font-black uppercase tracking-tight text-black"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#" 
                className="block text-2xl font-black uppercase tracking-tight text-black"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Security
              </a>
              <button 
                className="w-full modern-button text-xs py-4 flex items-center justify-center gap-3 mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                GET STARTED
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
