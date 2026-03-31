"use client";

import React from "react";
import { motion } from "framer-motion";
import RiskGauge from "./RiskGauge";
import ClauseCard, { Clause } from "./ClauseCard";
import { AlertCircle, FileDown, Lock, CheckCircle, Info, Loader2 } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { AuditReport } from "./AuditReport";

interface ResultsDashboardProps {
  results: {
    overall_score: number;
    overall_verdict: string;
    clauses: Clause[];
    questions_to_ask: string[];
    suggested_changes: string[];
  };
  isLocked: boolean;
  onUnlock: () => void;
}

export default function ResultsDashboard({ results, isLocked, onUnlock }: ResultsDashboardProps) {
  const safeCount = results.clauses.filter((c) => c.risk_level === "safe").length;

  return (
    <div className="max-w-4xl mx-auto py-24 px-4 space-y-32">
      {/* Top Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="modern-card p-16 bg-white"
      >
        <div className="flex flex-col md:flex-row items-center gap-20">
          <RiskGauge score={results.overall_score} />

          <div className="flex-1 text-center md:text-left">
            <div className="inline-block bg-yellow-400 text-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest mb-6">
              Official Analysis Report
            </div>
            <h2 className="text-4xl font-black text-black leading-[1.1] mb-10 uppercase tracking-tighter">
              {results.overall_verdict}
            </h2>

            <div className="grid grid-cols-3 gap-8 mb-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2">Clauses</p>
                <p className="text-3xl font-black">{results.clauses.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2">Safe</p>
                <p className="text-3xl font-black">{safeCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2">Risks</p>
                <p className="text-3xl font-black text-yellow-600">{results.clauses.length - safeCount}</p>
              </div>
            </div>

            {!isLocked ? (
              <PDFDownloadLink
                document={<AuditReport results={results} />}
                fileName={`BeforeSign_Audit_${new Date().toISOString().split("T")[0]}.pdf`}
              >
                {({ loading }) => (
                  <button
                    className="modern-button px-8 py-3 text-xs flex items-center gap-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                    {loading ? "Preparing..." : "Download Full Audit PDF"}
                  </button>
                )}
              </PDFDownloadLink>
            ) : (
              <div className="flex flex-col items-start gap-3">
                <button
                  disabled
                  className="modern-button px-8 py-3 text-xs flex items-center gap-3 opacity-30 cursor-not-allowed"
                >
                  <FileDown className="w-4 h-4" />
                  Download Full Audit PDF
                  <Lock className="w-3 h-3" />
                </button>
                <button
                  onClick={onUnlock}
                  className="modern-button px-8 py-3 text-xs flex items-center gap-3 bg-yellow-400 text-black hover:bg-yellow-300"
                >
                  <Lock className="w-4 h-4" />
                  Pay to Unlock Full Audit — $2.99
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Audit Detail Section */}
      <div className="space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-black pb-10">
          <h2 className="text-5xl font-black text-black tracking-tighter uppercase">
            Clause Audit
          </h2>
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 flex items-center gap-2 px-3 py-1 border border-black/10">
            <Info className="w-4 h-4" />
            <span>AI CORE 4.0 ACTIVE</span>
          </div>
        </div>
        
        <div className="space-y-12">
          {results.clauses.map((clause) => (
            <ClauseCard
              key={clause.clause_number}
              clause={clause}
              isLocked={isLocked}
              onUnlock={onUnlock}
            />
          ))}
        </div>
      </div>

      {/* Strategic Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Questions */}
        <div className="modern-card p-12 bg-white relative overflow-hidden">
          <h3 className="text-2xl font-black text-black mb-10 flex items-center gap-4 uppercase tracking-tight">
            <CheckCircle className="w-7 h-7 text-black" />
            Strategic Inquiries
          </h3>
          <ul className={`space-y-8 ${isLocked ? "blur-text" : ""}`}>
            {results.questions_to_ask.map((q, i) => (
              <li key={i} className="text-black font-bold leading-tight flex items-start gap-4">
                <span className="bg-black text-white px-1.5 min-w-[1.5rem] text-center">{i + 1}</span>
                {q}
              </li>
            ))}
          </ul>
          {isLocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[6px] z-20">
              <button onClick={onUnlock} className="modern-button text-xs">
                UNLOCK STRATEGIC AUDIT — $2.99
              </button>
            </div>
          )}
        </div>

        {/* Changes */}
        <div className="modern-card p-12 bg-white relative overflow-hidden">
          <h3 className="text-2xl font-black text-black mb-10 flex items-center gap-4 uppercase tracking-tight">
            <AlertCircle className="w-7 h-7 text-black" />
            Necessary Edits
          </h3>
          <ul className={`space-y-8 ${isLocked ? "blur-text" : ""}`}>
            {results.suggested_changes.map((c, i) => (
              <li key={i} className="text-black font-bold leading-tight flex items-start gap-4">
                <span className="bg-yellow-400 text-black px-1.5 min-w-[1.5rem] text-center border border-black">{i + 1}</span>
                {c}
              </li>
            ))}
          </ul>
          {isLocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[6px] z-20">
              <button onClick={onUnlock} className="modern-button text-xs">
                UNLOCK NECESSARY EDITS — $2.99
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-[10px] font-bold uppercase tracking-[0.4em] max-w-xl mx-auto text-black/30 leading-relaxed pb-32">
        THIS IS AN AI-GENERATED AUDIT. IT IS NOT A LEGAL DOCUMENT.
        CONSULT A QUALIFIED ATTORNEY BEFORE MAKING ANY LEGAL DECISIONS.
      </p>
    </div>
  );
}
