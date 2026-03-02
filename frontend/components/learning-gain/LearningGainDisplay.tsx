"use client";

import { motion } from "framer-motion";
import { TrendingUp, Award, Target, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { safeArray, hasData } from "@/lib/arrayHelpers";

interface LearningGainData {
  pre_score: number;
  post_score: number;
  learning_gain_percentage: number;
  concept_performance?: {
    weak: string[];
    strong: string[];
    accuracy_map: Record<string, number>;
  } | null;
  learning_insight?: string | null;
}

interface LearningGainDisplayProps {
  data: LearningGainData;
  onContinue?: () => void;
}

export function LearningGainDisplay({ data, onContinue }: LearningGainDisplayProps) {
  const { pre_score, post_score, learning_gain_percentage, concept_performance, learning_insight } = data;

  // Safe arrays for iteration
  const safeStrongConcepts = safeArray(concept_performance?.strong);
  const safeWeakConcepts = safeArray(concept_performance?.weak);

  // Determine performance level and styling
  const getPerformanceLevel = (gain: number) => {
    if (gain >= 30) return { label: "Exceptional Growth", color: "emerald", emoji: "🚀" };
    if (gain >= 15) return { label: "Strong Progress", color: "green", emoji: "📈" };
    if (gain >= 5) return { label: "Steady Improvement", color: "blue", emoji: "✨" };
    if (gain >= -5) return { label: "Maintained Level", color: "yellow", emoji: "🎯" };
    return { label: "Review Recommended", color: "orange", emoji: "📚" };
  };

  const performance = getPerformanceLevel(learning_gain_percentage);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="text-center space-y-3"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30"
        >
          <TrendingUp className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white">Your Learning Journey</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          See how much you've grown from pre-test to post-test
        </p>
      </motion.div>

      {/* Learning Gain Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.2 }}
        className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl p-8 border border-slate-700/50 space-y-8"
      >
        {/* Learning Gain Percentage */}
        <div className="text-center space-y-4">
          <div className="text-sm font-bold tracking-widest text-slate-400 uppercase">
            Learning Gain
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.3 }}
            className="space-y-2"
          >
            <div className="text-7xl font-bold">
              <span className={cn(
                learning_gain_percentage >= 0 ? "text-emerald-400" : "text-orange-400"
              )}>
                {learning_gain_percentage >= 0 ? "+" : ""}{learning_gain_percentage.toFixed(1)}%
              </span>
            </div>
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-base font-medium",
              performance.color === "emerald" && "bg-emerald-500/10 text-emerald-400",
              performance.color === "green" && "bg-green-500/10 text-green-400",
              performance.color === "blue" && "bg-blue-500/10 text-blue-400",
              performance.color === "yellow" && "bg-yellow-500/10 text-yellow-400",
              performance.color === "orange" && "bg-orange-500/10 text-orange-400"
            )}>
              <span>{performance.emoji}</span>
              {performance.label}
            </div>
          </motion.div>
        </div>

        {/* Score Comparison */}
        <div className="grid grid-cols-2 gap-6">
          {/* Pre-Test Score */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-slate-400">
              <Target className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Pre-Test</span>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-white">{pre_score.toFixed(0)}%</div>
              {/* Progress Bar */}
              <div className="h-3 bg-slate-900/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-slate-600 to-slate-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${pre_score}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.5 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Post-Test Score */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-emerald-400">
              <Award className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Post-Test</span>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-white">{post_score.toFixed(0)}%</div>
              {/* Progress Bar */}
              <div className="h-3 bg-slate-900/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/30"
                  initial={{ width: 0 }}
                  animate={{ width: `${post_score}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.6 }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Learning Insight */}
        {learning_insight && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="pt-6 border-t border-slate-700/50"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-indigo-400 mb-2">AI Insight</div>
                <p className="text-slate-300 leading-relaxed">{learning_insight}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Concept Performance */}
        {concept_performance && (hasData(safeStrongConcepts) || hasData(safeWeakConcepts)) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-700/50"
          >
            {/* Strong Concepts */}
            {hasData(safeStrongConcepts) && (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                  ✓ Strong Areas
                </div>
                <div className="flex flex-wrap gap-2">
                  {safeStrongConcepts.map((concept, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-sm border border-emerald-500/20"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Weak Concepts */}
            {hasData(safeWeakConcepts) && (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-orange-400 uppercase tracking-wider">
                  ⚡ Focus Areas
                </div>
                <div className="flex flex-wrap gap-2">
                  {safeWeakConcepts.map((concept, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-300 text-sm border border-orange-500/20"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <button
          onClick={() => window.history.back()}
          className="px-8 py-3 rounded-lg bg-slate-800/60 text-white hover:bg-slate-700/60 border border-slate-700/50 hover:border-slate-600/50 transition-all font-medium"
        >
          Back to Dashboard
        </button>
        {onContinue && (
          <button
            onClick={onContinue}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg shadow-indigo-500/20"
          >
            Continue Learning
          </button>
        )}
      </motion.div>

      {/* Explainer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Learning gain measures your improvement from pre-test to post-test. 
          It reflects how much you've learned through the study materials and practice.
        </p>
      </motion.div>
    </div>
  );
}
