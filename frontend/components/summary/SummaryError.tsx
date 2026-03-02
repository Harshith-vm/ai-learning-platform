"use client";

import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SummaryErrorProps {
  error: string;
  onRetry?: () => void;
}

export function SummaryError({ error, onRetry }: SummaryErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
        {/* Error Header */}
        <div className="bg-red-50 border-b border-red-200 p-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Failed to Generate Summary
              </h3>
              <p className="text-sm text-slate-600">
                We encountered an error while processing your document
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className={cn(
                  "flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium",
                  "bg-primary-600 text-white",
                  "hover:bg-primary-700 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                )}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium",
                "bg-slate-100 text-slate-700 border border-slate-200",
                "hover:bg-slate-200 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              )}
            >
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="border-t border-slate-200 bg-slate-50 p-6">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">
            Common Issues
          </h4>
          <ul className="space-y-1 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-slate-400 mt-0.5">•</span>
              <span>Document may be too large or complex</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 mt-0.5">•</span>
              <span>Network connection issues</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 mt-0.5">•</span>
              <span>Server temporarily unavailable</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
