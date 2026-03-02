"use client";

import { motion } from "framer-motion";

export function ConceptSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-2"
      >
        <div className="h-10 w-96 bg-slate-800/60 rounded-lg animate-pulse mx-auto" />
        <div className="h-5 w-64 bg-slate-800/40 rounded animate-pulse mx-auto" />
      </motion.div>

      {/* Overview Skeleton */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-32 bg-slate-700/50 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-700/30 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-slate-700/30 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl p-6 border border-slate-700/50 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700/50 animate-pulse" />
            <div className="h-6 w-40 bg-slate-700/50 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-700/30 rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-slate-700/30 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-slate-700/30 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
