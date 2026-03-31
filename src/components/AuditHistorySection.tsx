"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuditEntry } from "@/lib/history";
import { RotateCcw, Trash2 } from "lucide-react";

interface AuditHistorySectionProps {
  history: AuditEntry[];
  onReopen: (entry: AuditEntry) => void;
  onDelete: (id: string) => void;
}

function scoreColor(score: number): string {
  if (score >= 70) return "bg-green-400 text-black";
  if (score >= 40) return "bg-yellow-400 text-black";
  return "bg-red-500 text-white";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AuditHistorySection({
  history,
  onReopen,
  onDelete,
}: AuditHistorySectionProps) {
  if (history.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 mb-6">
        Recent Audits
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {history.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modern-card p-6 bg-white flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-black text-sm uppercase tracking-tight leading-tight line-clamp-2 flex-1">
                  {entry.name}
                </p>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-black/20 hover:text-black transition-colors shrink-0"
                  aria-label="Delete audit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 ${scoreColor(
                    entry.score
                  )}`}
                >
                  {entry.score}/100
                </span>
                <span className="text-[10px] text-black/40 font-bold uppercase tracking-widest">
                  {formatDate(entry.date)}
                </span>
              </div>

              <p className="text-xs font-bold text-black/60 leading-snug line-clamp-2">
                {entry.verdict}
              </p>

              <button
                onClick={() => onReopen(entry)}
                className="modern-button-outline text-[10px] px-4 py-2 flex items-center justify-center gap-2 mt-auto"
              >
                <RotateCcw className="w-3 h-3" />
                Reopen
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
