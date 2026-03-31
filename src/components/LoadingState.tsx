"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";

const loadingStates = [
  "INITIALIZING AUDIT...",
  "DECODING LEGALESE...",
  "EXTRACTING RISK FACTORS...",
  "COMPARING CASE PRECEDENTS...",
  "EVALUATING LIABILITY EXPOSURE...",
  "FINALIZING REPORT...",
];

interface LoadingStateProps {
  onCancel?: () => void;
}

export default function LoadingState({ onCancel }: LoadingStateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % loadingStates.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 md:p-24 modern-card bg-white min-h-[500px]">
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mb-12 relative"
      >
        <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full" />
        <Shield className="w-20 h-20 text-black relative z-10" />
      </motion.div>
      
      <div className="h-12 relative w-full flex justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "anticipate" }}
            className="text-2xl md:text-3xl font-black text-black absolute uppercase tracking-tighter"
          >
            {loadingStates[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-20 w-full max-w-md">
        <div className="h-2 w-full border border-black bg-white overflow-hidden mb-4">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 15, ease: "linear" }}
            className="h-full bg-black"
          />
        </div>
        <div className="flex justify-between items-center px-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black">
            AI Engine 01 — ACTIVE
          </p>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            PROCESSING SECURITY BLOCKS...
          </p>
        </div>
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-16 text-[11px] font-black uppercase tracking-[0.2em] text-black/40 hover:text-black transition-colors border-b-2 border-transparent hover:border-black py-1"
        >
          Cancel Audit
        </button>
      )}
    </div>
  );
}
