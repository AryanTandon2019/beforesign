"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface RiskGaugeProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
}

export default function RiskGauge({ score, size = 200, strokeWidth = 8 }: RiskGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 500);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative flex items-center justify-center bg-white" style={{ width: size + 40, height: size + 40 }}>
      {/* Background Ring */}
      <svg 
        width={size + strokeWidth} 
        height={size + strokeWidth} 
        viewBox={`0 0 ${size + strokeWidth} ${size + strokeWidth}`} 
        className="transform -rotate-90 overflow-visible"
      >
        <circle
          cx={(size + strokeWidth) / 2}
          cy={(size + strokeWidth) / 2}
          r={radius}
          stroke="#000000"
          strokeWidth={1}
          fill="transparent"
          opacity={0.1}
        />
        {/* Progress Ring */}
        <motion.circle
          cx={(size + strokeWidth) / 2}
          cy={(size + strokeWidth) / 2}
          r={radius}
          stroke="#000000"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: "circOut" }}
          strokeLinecap="butt"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
          className="text-7xl font-black text-black tracking-tighter"
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/30 mt-1">
          Risk Index
        </span>
      </div>
    </div>
  );
}
