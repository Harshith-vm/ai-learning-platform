"use client";

import { motion } from "framer-motion";

export function SummarySkeleton() {
  return (
    <div className="space-y-6">
      {/* Document Header Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-slate-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-slate-200 rounded animate-pulse w-48" />
            <div className="h-4 bg-slate-200 rounded animate-pulse w-32" />
          </div>
        </div>
      </div>

      {/* Summary Content Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Title Section Skeleton */}
        <div className="bg-slate-50 border-b border-slate-200 p-6">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded bg-slate-200 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-slate-200 rounded animate-pulse w-64" />
              <div className="h-4 bg-slate-200 rounded animate-pulse w-40" />
            </div>
          </div>
        </div>

        {/* Summary Text Skeleton */}
        <div className="p-6 space-y-3">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-full" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-full" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-full" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-4/5" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-full" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
        </div>

        {/* Main Themes Skeleton */}
        <div className="border-t border-slate-200 bg-slate-50 p-6">
          <div className="h-4 bg-slate-200 rounded animate-pulse w-24 mb-3" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-8 bg-slate-200 rounded-lg animate-pulse w-32"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="h-4 bg-slate-200 rounded animate-pulse w-24 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Pulsing indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 text-sm text-slate-500">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-primary-500"
          />
          Generating summary...
        </div>
      </motion.div>
    </div>
  );
}
