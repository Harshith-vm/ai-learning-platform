"use client";

import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface LearningGainErrorProps {
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function LearningGainError({ 
  message = "Failed to load learning gain data", 
  onRetry,
  onBack 
}: LearningGainErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl p-12 border border-slate-700/50 text-center space-y-6">
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto"
        >
          <AlertCircle className="w-8 h-8 text-orange-400" />
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-2xl font-semibold text-white">
            Learning Gain Unavailable
          </h3>
          <p className="text-slate-400 leading-relaxed">
            {message}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-3 pt-4"
        >
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg shadow-indigo-500/20"
            >
              Try Again
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="px-8 py-3 rounded-lg bg-slate-800/60 text-white hover:bg-slate-700/60 border border-slate-700/50 hover:border-slate-600/50 transition-all font-medium"
            >
              Back to Dashboard
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
