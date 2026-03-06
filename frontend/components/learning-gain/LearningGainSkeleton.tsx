"use client";

import { motion } from "framer-motion";

export function LearningGainSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header Skeleton */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-slate-800/60 animate-pulse mx-auto" />
        <div className="h-10 w-64 bg-slate-800/60 rounded-lg animate-pulse mx-auto" />
        <div className="h-5 w-96 bg-slate-800/40 rounded-lg animate-pulse mx-auto" />
      </div>

      {/* Main Card Skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl p-8 border border-slate-700/50 space-y-8"
      >
        {/* Learning Gain Percentage Skeleton */}
        <div className="text-center space-y-4">
          <div className="h-4 w-32 bg-slate-800/60 rounded animate-pulse mx-auto" />
          <div className="h-20 w-48 bg-slate-800/60 rounded-lg animate-pulse mx-auto" />
          <div className="h-8 w-40 bg-slate-800/60 rounded-lg animate-pulse mx-auto" />
        </div>

        {/* Score Comparison Skeleton */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="h-4 w-24 bg-slate-800/60 rounded animate-pulse" />
            <div className="h-12 w-32 bg-slate-800/60 rounded animate-pulse" />
            <div className="h-3 bg-slate-900/50 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-slate-700/50 animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 w-24 bg-slate-800/60 rounded animate-pulse" />
            <div className="h-12 w-32 bg-slate-800/60 rounded animate-pulse" />
            <div className="h-3 bg-slate-900/50 rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-slate-700/50 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Insight Skeleton */}
        <div className="pt-6 border-t border-slate-700/50 space-y-3">
          <div className="h-4 w-24 bg-slate-800/60 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-800/40 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-slate-800/40 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-slate-800/40 rounded animate-pulse" />
          </div>
        </div>
      </motion.div>

      {/* Buttons Skeleton */}
      <div className="flex gap-4 justify-center">
        <div className="h-12 w-40 bg-slate-800/60 rounded-lg animate-pulse" />
        <div className="h-12 w-40 bg-slate-800/60 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
