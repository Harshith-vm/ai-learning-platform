"use client";

import { motion } from "framer-motion";

export function ResultSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl p-6 border border-slate-700/50 space-y-6"
    >
      {/* Header Skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-700/50 animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-40 bg-slate-700/50 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-700/30 rounded animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-full bg-slate-700/30 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-slate-700/30 rounded animate-pulse" />
        <div className="h-4 w-4/6 bg-slate-700/30 rounded animate-pulse" />
      </div>

      {/* Additional Content */}
      <div className="pt-4 border-t border-slate-700/50 space-y-3">
        <div className="h-4 w-32 bg-slate-700/50 rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-700/30 rounded animate-pulse" />
          <div className="h-4 w-4/5 bg-slate-700/30 rounded animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
