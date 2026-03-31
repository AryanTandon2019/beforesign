"use client";

import React, { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import UploadZone from "@/components/UploadZone";
import ResultsDashboard from "@/components/ResultsDashboard";
import LoadingState from "@/components/LoadingState";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeContractText, analyzeContractImage, analyzeContractPDF } from "@/lib/analyze-contract";
import AuditHistorySection from "@/components/AuditHistorySection";
import { saveAudit, getHistory, deleteAudit, AuditEntry } from "@/lib/history";

// Replace this with your actual Gumroad product link
// Replace this with your actual Dodo Payments checkout link
// Replace this with your actual Dodo Payments checkout link
const DODO_PAYMENT_URL = "https://test.checkout.dodopayments.com/buy/pdt_0NbgH55LhWDR7ofoD54Wf?quantity=1&redirect_url=https://getbeforesign.vercel.app?paid=true";

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [history, setHistory] = useState<AuditEntry[]>([]);

  const unlockAndSave = () => {
    localStorage.setItem("beforesign_paid", "true");
    setIsPaid(true);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };


  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Handle redirect fallback (?paid=true) and existing localStorage payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "true") {
      window.history.replaceState({}, "", window.location.pathname);
      // Restore saved results from before the redirect
      const saved = sessionStorage.getItem("beforesign_results");
      if (saved) {
        try {
          setResults(JSON.parse(saved));
        } catch {}
        sessionStorage.removeItem("beforesign_results");
      }
      unlockAndSave();
    } else if (localStorage.getItem("beforesign_paid") === "true") {
      setIsPaid(true);
    }
  }, []);

  const handleUnlock = () => {
    // Save results so they survive a payment redirect
    if (results) {
      sessionStorage.setItem("beforesign_results", JSON.stringify(results));
    }
    
    // Redirect to Dodo Payments checkout
    window.location.href = DODO_PAYMENT_URL;
  };

  const handleAnalyze = async (data: { type: "pdf" | "image" | "text"; content: string | File }) => {
    const controller = new AbortController();
    setAbortController(controller);
    
    setIsAnalyzing(true);
    setResults(null);
    setIsPaid(false);
    setShowSuccess(false);
    setError(null);

    try {
      let result;
      if (data.type === "text") {
        result = await analyzeContractText(data.content as string, controller.signal);
      } else if (data.type === "image") {
        result = await analyzeContractImage(data.content as File, controller.signal);
      } else if (data.type === "pdf") {
        result = await analyzeContractPDF(data.content as File, controller.signal);
      }
      
      setResults(result);

      if (result) {
        const name =
          data.type !== "text" && data.content instanceof File
            ? (data.content as File).name
            : "Untitled Contract";
        saveAudit(name, result);
        setHistory(getHistory());
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Analysis cancelled by user');
      } else {
        setError(err.message);
      }
    } finally {
      setIsAnalyzing(false);
      setAbortController(null);
    }
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setIsAnalyzing(false);
      setAbortController(null);
    }
  };

  const handleReopen = (entry: AuditEntry) => {
    setResults(entry.results);
    setIsPaid(localStorage.getItem("beforesign_paid") === "true");
    setShowSuccess(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(deleteAudit(id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-grow">
        <Hero>
          <AnimatePresence mode="wait">
            {!isAnalyzing && !results && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <UploadZone onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoadingState onCancel={handleCancel} />
              </motion.div>
            )}

            {results && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-black text-yellow-400 border-2 border-yellow-400 px-6 py-3 font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-[4px_4px_0px_#000000]"
                  >
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    Full Analysis Unlocked. Thank you!
                  </motion.div>
                )}

                <ResultsDashboard
                  results={results}
                  isLocked={!isPaid}
                  onUnlock={handleUnlock}
                />
                
                <div className="flex justify-center mt-12 pb-24">
                  <button
                    onClick={() => {
                      setResults(null);
                      setIsPaid(false);
                    }}
                    className="modern-button-outline text-xs px-10 py-4"
                  >
                    Analyze New Document
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 p-8 bg-black text-white max-w-2xl mx-auto border-2 border-black shadow-[8px_8px_0px_#FFFF00]"
            >
              <p className="font-bold uppercase tracking-widest text-xs mb-6 text-yellow-400">Audit Failed</p>
              <p className="text-sm font-medium mb-8 leading-relaxed uppercase tracking-tight">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="bg-yellow-400 text-black px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white transition-colors"
              >
                Dismiss & Retry
              </button>
            </motion.div>
          )}
        </Hero>

        {!results && (
          <div className="bg-white">
            <AuditHistorySection
              history={history}
              onReopen={handleReopen}
              onDelete={handleDeleteHistory}
            />
            <HowItWorks />
            <FAQ />
          </div>
        )}
      </main>

      <Footer />

    </div>
  );
}
