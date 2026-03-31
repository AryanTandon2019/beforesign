"use client";

import React from "react";
import { Upload, Cpu, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    title: "UPLOAD",
    description: "Drop your contract. PDF, Image, or plain text. Our system handles any format instantly.",
    icon: Upload,
  },
  {
    title: "AUDIT",
    description: "Our high-performance AI decodes the legalese, identifying risky clauses and hidden traps.",
    icon: Cpu,
  },
  {
    title: "NEGOTIATE",
    description: "Receive a plain-English report with strategic suggestions to protect your interests.",
    icon: ShieldCheck,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-44 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-32">
          <div className="inline-block bg-black text-white text-[10px] font-bold uppercase tracking-[0.4em] px-4 py-1.5 mb-8">
            Operational Protocol
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-black leading-none uppercase tracking-tighter">
            How it <span className="bg-yellow-400 px-2">Works</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="p-12 bg-white border border-black flex flex-col items-center text-center group"
            >
              <div className="mb-10 relative">
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-yellow-400 border border-black flex items-center justify-center text-xl font-black italic">
                  0{index + 1}
                </div>
                <div className="bg-black p-6 group-hover:scale-110 transition-transform duration-500">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-black mb-6 uppercase tracking-tight">{step.title}</h3>
              <p className="text-black font-medium leading-relaxed text-lg">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
