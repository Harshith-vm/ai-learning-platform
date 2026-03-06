"use client";

import { motion } from "framer-motion";
import { Lightbulb, CheckCircle2 } from "lucide-react";
import { safeArray, hasData } from "@/lib/arrayHelpers";

interface CodeExplanationProps {
  explanation: string;
  keyPoints?: string[];
}

export function CodeExplanation({ explanation, keyPoints }: CodeExplanationProps) {
  // Safe array for iteration
  const safeKeyPoints = safeArray(keyPoints);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl p-6 border border-slate-700/50 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Code Explanation</h3>
          <p className="text-sm text-slate-400">AI-powered analysis of your code</p>
        </div>
      </div>

      {/* Explanation Text */}
      <div className="prose prose-invert prose-slate max-w-none">
        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
          {explanation}
        </p>
      </div>

      {/* Key Points */}
      {hasData(safeKeyPoints) && (
        <div className="pt-4 border-t border-slate-700/50 space-y-3">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Key Points
          </h4>
          <div className="space-y-2">
            {safeKeyPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300 text-sm">{point}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
