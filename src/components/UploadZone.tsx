"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, ImageIcon, X, AlertCircle, Zap } from "lucide-react";

interface UploadZoneProps {
  onAnalyze: (data: { type: "pdf" | "image" | "text"; content: string | File }) => void;
  isAnalyzing: boolean;
}

export default function UploadZone({ onAnalyze, isAnalyzing }: UploadZoneProps) {
  const [activeTab, setActiveTab] = useState<"pdf" | "image" | "text">("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateFile(selectedFile);
    }
  };

  const validateFile = (file: File) => {
    // Vercel body limit is 4.5MB. 
    // For images, we send the whole file (Base64), so 4MB is the strict limit.
    // For PDFs, we extract text locally, so the original file can be much larger.
    const isImage = activeTab === "image";
    const limit = isImage ? 4 * 1024 * 1024 : 25 * 1024 * 1024; // 4MB for images, 25MB for PDFs
    
    if (file.size > limit) {
      setError(
        isImage 
          ? "Image exceeds 4MB limit. Please crop it or compress it." 
          : "PDF exceeds 25MB limit. Please split the document."
      );
      return;
    }
    setError(null);
    setFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateFile(droppedFile);
    }
  };

  const handleAnalyze = () => {
    if (activeTab === "text") {
      if (text.length < 50) {
        setError("Please provide a more substantial contract text for analysis.");
        return;
      }
      onAnalyze({ type: "text", content: text });
    } else {
      if (!file) {
        setError("Please select a document to proceed.");
        return;
      }
      onAnalyze({ type: activeTab as "pdf" | "image", content: file });
    }
  };

  const tabs = [
    { id: "pdf", label: "PDF", icon: FileText },
    { id: "image", label: "IMAGE", icon: ImageIcon },
    { id: "text", label: "TEXT", icon: FileText },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto modern-card p-6">
      {/* Tabs */}
      <div className="flex border-b border-black mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-3 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-black/5"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-2">
        <AnimatePresence mode="wait">
          {activeTab === "text" ? (
            <motion.div
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste contract text here..."
                className="w-full h-48 bg-gray-50 border border-black p-6 text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all resize-none font-sans font-medium"
              />
            </motion.div>
          ) : (
            <motion.div
              key="file"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full h-48 border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  file
                    ? "border-black bg-yellow-50"
                    : "border-black/20 hover:border-black hover:bg-black/5"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={activeTab === "pdf" ? ".pdf" : ".jpg,.jpeg,.png,.heic"}
                  className="hidden"
                />
                
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileText className="w-10 h-10 text-black mb-3" />
                    <p className="text-black font-bold uppercase tracking-tight">{file.name}</p>
                    <p className="text-black/40 text-[10px] font-bold uppercase mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-black text-white hover:bg-yellow-400 hover:text-black transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-10 h-10 text-black/10 mb-4 mx-auto" />
                    <p className="text-black/40 font-bold uppercase tracking-[0.2em] text-[10px]">
                      Drop {activeTab === "pdf" ? "PDF file" : "Image scan"} Here
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mt-6 bg-yellow-400 text-black p-4 font-bold text-[10px] uppercase tracking-widest border border-black shadow-[4px_4px_0px_#000000]"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}

        <motion.button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          whileHover={{ scale: 1.01, translateY: -2, translateX: -2 }}
          whileTap={{ scale: 0.98, translateY: 0, translateX: 0 }}
          className="w-full mt-10 bg-yellow-400 text-black border-2 border-black font-black uppercase tracking-widest flex items-center justify-center gap-3 py-6 text-xl shadow-[4px_4px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-6 h-6 fill-black" />
              </motion.div>
              AUDITING DOCUMENT...
            </span>
          ) : (
            <>
              UPLOAD & ANALYZE
              <Zap className="w-6 h-6 fill-black group-hover:scale-125 transition-transform" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
