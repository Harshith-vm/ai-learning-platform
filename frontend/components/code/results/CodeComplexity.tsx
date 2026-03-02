"use client";

import { motion } from "framer-motion";
import { BarChart3, Clock, Database, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplexityMetric {
  label: string;
  value: string;
  level: "low" | "medium" | "high";
  description: string;
}

interface CodeComplexityProps {
  timeComplexity: ComplexityMetric;
  spaceComplexity: ComplexityMetric;
  cyclomaticComplexity?: ComplexityMetric;
  summary: string;
}

export function CodeComplexity({
  timeComplexity,
  spaceComplexity,
  cyclomaticComplexity,
  summary,
}: CodeComplexityProps) {
  const getLevelColor = (level: ComplexityMetric["level"]) => {
    switch (level) {
      case "low":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/30";
    }
  };

  const metrics = [
    { ...timeComplexity, icon: Clock, color: "blue" },
    { ...spaceComplexity, icon: Database, color: "purple" },
  ];

  if (cyclomaticComplexity) {
    metrics.push({ ...cyclomaticComplexity, icon: TrendingUp, color: "emerald" });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl p-6 border border-slate-700/50 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Complexity Analysis</h3>
          <p className="text-sm text-slate-400">Performance and efficiency metrics</p>
        </div>
      </div>

      {/* Summary */}
      <div className="text-slate-300 leading-relaxed">
        {summary}
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/40 rounded-lg p-4 border border-slate-700/30 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Icon className={cn(
                  "w-4 h-4",
                  metric.color === "blue" && "text-blue-400",
                  metric.color === "purple" && "text-purple-400",
                  metric.color === "emerald" && "text-emerald-400"
                )} />
                <span className="text-sm font-semibold text-slate-300">
                  {metric.label}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-white font-mono">
                  {metric.value}
                </div>
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium border capitalize",
                  getLevelColor(metric.level)
                )}>
                  {metric.level}
                </span>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed">
                {metric.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
