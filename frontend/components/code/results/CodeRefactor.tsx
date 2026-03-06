"use client";

import { motion } from "framer-motion";
import { RefreshCw, ArrowRight, Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { safeArray, hasData } from "@/lib/arrayHelpers";

interface CodeRefactorProps {
  originalCode: string;
  refactoredCode: string;
  improvements: string[];
  summary: string;
}

export function CodeRefactor({
  originalCode,
  refactoredCode,
  improvements,
  summary,
}: CodeRefactorProps) {
  const [copied, setCopied] = useState(false);
  
  // Safe array for iteration
  const safeImprovements = safeArray(improvements);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(refactoredCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl p-6 border border-slate-700/50 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Refactored Code</h3>
            <p className="text-sm text-slate-400">Optimized version of your code</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-slate-600/50 transition-all text-sm font-medium text-white flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Code
            </>
          )}
        </button>
      </div>

      {/* Summary */}
      <div className="text-slate-300 leading-relaxed">
        {summary}
      </div>

      {/* Code Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Original */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">
            <span>Original</span>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700/30 overflow-x-auto">
            <pre className="text-sm text-slate-300 font-mono leading-relaxed">
              <code>{originalCode}</code>
            </pre>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center">
          <ArrowRight className="w-6 h-6 text-slate-600" />
        </div>

        {/* Refactored */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400 uppercase tracking-wider">
            <span>Refactored</span>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-4 border border-emerald-500/20 overflow-x-auto">
            <pre className="text-sm text-slate-300 font-mono leading-relaxed">
              <code>{refactoredCode}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Improvements */}
      {hasData(safeImprovements) && (
        <div className="pt-4 border-t border-slate-700/50 space-y-3">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Key Improvements
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            {safeImprovements.map((improvement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{improvement}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
