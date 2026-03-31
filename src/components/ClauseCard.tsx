"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, AlertTriangle, XCircle } from "lucide-react";

export interface Clause {
  clause_number: number;
  clause_title: string;
  risk_level: "safe" | "caution" | "danger";
  original_text: string;
  plain_english: string;
  why_risky?: string | null;
  suggestion?: string | null;
}

interface ClauseCardProps {
  clause: Clause;
  isLocked: boolean;
  onUnlock: () => void;
}

export default function ClauseCard({ clause, isLocked: globalLocked, onUnlock }: ClauseCardProps) {
  const isClauseRisky = clause.risk_level !== "safe";
  const showBlur = isClauseRisky && globalLocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="modern-card p-10 mb-8 bg-white"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-4 border-b border-black/10">
        <div className="flex items-center gap-4">
          <span className="text-black font-black text-2xl">
            {clause.clause_number.toString().padStart(2, "0")}
          </span>
          <h3 className="text-3xl font-black uppercase tracking-tight">
            {clause.clause_title}
          </h3>
        </div>
        <div className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 border border-black ${
          clause.risk_level === 'safe' ? 'bg-white text-black' : 'bg-yellow-400 text-black'
        }`}>
          {clause.risk_level}
        </div>
      </div>

      <div className="space-y-10">
        {/* Plain English Explanation */}
        <div className="relative">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 mb-4">
            Audit Summary
          </h4>
          <div className={`clause-content ${showBlur ? "blur-text" : "unlocked"}`}>
            <p className="text-2xl font-bold leading-snug text-black highlighter inline">
              {clause.plain_english}
            </p>
          </div>
          
          {showBlur && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/10 backdrop-blur-[4px] z-10 pt-6">
              <button
                onClick={onUnlock}
                className="modern-button flex items-center gap-3 text-xs py-3 px-8 shadow-[4px_4px_0px_#FFFF00]"
              >
                <Lock className="w-4 h-4" />
                UNLOCK FULL ANALYSIS — $2.99
              </button>
            </div>
          )}
        </div>

        {/* Detailed Insights */}
        {!isClauseRisky || !globalLocked ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-black/5">
            {clause.why_risky && (
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 mb-4">
                  The Risk
                </h4>
                <p className="text-lg font-medium leading-relaxed text-black">{clause.why_risky}</p>
              </div>
            )}
            {clause.suggestion && (
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 mb-4">
                  The Solution
                </h4>
                <p className="text-lg font-medium leading-relaxed text-black">{clause.suggestion}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="pt-10 border-t border-black/5 space-y-4">
            <div className="h-6 bg-gray-100 w-3/4" />
            <div className="h-6 bg-gray-100 w-1/2" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
