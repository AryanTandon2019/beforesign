"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "How is my data protected?",
    answer: "We employ industry-standard encryption and never store your documents on our servers. Analysis is performed in-memory and discarded immediately after processing.",
  },
  {
    question: "Does this replace professional legal counsel?",
    answer: "No. BeforeSign is an analytical tool designed to enhance your understanding of contract risks. It is not a substitute for formal legal advice from a qualified attorney.",
  },
  {
    question: "Which jurisdictions do you support?",
    answer: "Our AI is trained on general contract law principles applicable in most common law jurisdictions, including the US, UK, Canada, and Australia.",
  },
  {
    question: "What is the accuracy of the risk assessment?",
    answer: "The platform identifies over 95% of common risk patterns. However, legal nuances can vary by document; we always recommend a final review by a legal professional.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="py-44 px-4 sm:px-6 lg:px-8 border-t border-black bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="mb-24">
          <div className="inline-block bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-1 mb-6">
            Inquiry Center
          </div>
          <h2 className="text-6xl font-black text-black leading-none uppercase tracking-tighter">
            Common <span className="highlighter shadow-[0_0_40px_rgba(255,255,0,0.3)]">Questions</span>
          </h2>
        </div>

        <div className="divide-y-2 divide-black">
          {faqs.map((faq, index) => (
            <div key={index} className="py-4">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between py-10 text-left hover:bg-black/5 px-6 transition-all outline-none group"
              >
                <span className={`text-2xl font-black uppercase tracking-tight transition-colors ${openIndex === index ? "text-black" : "text-black/60 group-hover:text-black"}`}>
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-6 h-6 text-black" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-black/20" />
                )}
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-12 px-6 text-xl font-medium text-black leading-relaxed max-w-2xl">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
