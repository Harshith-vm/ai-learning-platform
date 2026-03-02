"use client";

import { motion } from "framer-motion";
import { Sparkles, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { safeArray, hasData } from "@/lib/arrayHelpers";

interface Improvement {
  type: "critical" | "warning" | "suggestion";
  title: string;
  description: string;
  line?: number;
}

interface CodeImprovementsProps {
  improvements: Improvement[];
  summary?: string;
}

export function CodeImprovements({ improvements, summary }: CodeImprovementsProps) {
  const getIcon = (type: Improvement["type"]) => {
    switch (type) {
      case "critical":
        return <AlertCircle className="w-4 h-4" />;
      case "warning":
        return <Info className="w-4 h-4" />;
      case "suggestion":
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getColors = (type: Improvement["type"]) => {
    switch (type) {
      case "critical":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-400",
          icon: "text-red-400",
        };
      case "warning":
        return {
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          text: "text-yellow-400",
          icon: "text-yellow-400",
        };
      case "suggestion":
        return {
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          text: "text-emerald-400",
          icon: "text-emerald-400",
        };
    }
  };

  // Safe array for iteration
  const safeImprovements = safeArray(improvements);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl p-6 border border-slate-700/50 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Code Improvements</h3>
          <p className="text-sm text-slate-400">Suggestions to enhance your code</p>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="text-slate-300 leading-relaxed">
          {summary}
        </div>
      )}

      {/* Improvements List */}
      {hasData(safeImprovements) ? (
        <div className="space-y-3">
          {safeImprovements.map((improvement, index) => {
            const colors = getColors(improvement.type);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 rounded-lg border",
                  colors.bg,
                  colors.border
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("flex-shrink-0 mt-0.5", colors.icon)}>
                    {getIcon(improvement.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={cn("font-semibold text-sm", colors.text)}>
                        {improvement.title}
                      </h4>
                      {improvement.line && (
                        <span className="text-xs text-slate-500 font-mono">
                          Line {improvement.line}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {improvement.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <p>No improvements to display</p>
        </div>
      )}
    </motion.div>
  );
}
