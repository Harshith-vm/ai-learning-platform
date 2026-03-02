"use client";

import { motion } from "framer-motion";
import { 
  BookOpen, 
  Lightbulb, 
  List, 
  Code2, 
  AlertTriangle 
} from "lucide-react";
import { safeArray, hasData } from "@/lib/arrayHelpers";

interface ConceptData {
  title: string;
  overview: string;
  explanation: string;
  keyIdeas: string[];
  examples: {
    title: string;
    description: string;
    code?: string;
  }[];
  commonMistakes: {
    mistake: string;
    correction: string;
  }[];
}

interface ConceptExplanationProps {
  concept: ConceptData;
}

export function ConceptExplanation({ concept }: ConceptExplanationProps) {
  // Safe arrays for iteration
  const safeKeyIdeas = safeArray(concept.keyIdeas);
  const safeExamples = safeArray(concept.examples);
  const safeCommonMistakes = safeArray(concept.commonMistakes);
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="text-center space-y-2"
      >
        <h1 className="text-4xl font-bold text-white">{concept.title}</h1>
        <p className="text-slate-400">Simplified explanation for better understanding</p>
      </motion.div>

      {/* Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
        className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-500/20"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white mb-2">Overview</h2>
            <p className="text-slate-300 leading-relaxed">{concept.overview}</p>
          </div>
        </div>
      </motion.div>

      {/* Detailed Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.2 }}
        className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl p-6 border border-slate-700/50 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Detailed Explanation</h2>
        </div>
        <div className="prose prose-invert prose-slate max-w-none">
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {concept.explanation}
          </p>
        </div>
      </motion.div>

      {/* Key Ideas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.3 }}
        className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl p-6 border border-slate-700/50 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <List className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Key Ideas</h2>
        </div>
        {hasData(safeKeyIdeas) ? (
          <div className="space-y-3">
            {safeKeyIdeas.map((idea, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/40 border border-slate-700/30"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-emerald-400">{index + 1}</span>
                </div>
                <p className="text-slate-300 leading-relaxed flex-1">{idea}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">No key ideas available</p>
        )}
      </motion.div>

      {/* Examples */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.4 }}
        className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl p-6 border border-slate-700/50 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Examples</h2>
        </div>
        {hasData(safeExamples) ? (
          <div className="space-y-4">
            {safeExamples.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-400">{index + 1}</span>
                  </div>
                  <h3 className="font-semibold text-white">{example.title}</h3>
                </div>
                <p className="text-slate-300 leading-relaxed pl-8">{example.description}</p>
                {example.code && (
                  <div className="pl-8">
                    <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-700/30 overflow-x-auto">
                      <pre className="text-sm text-slate-300 font-mono leading-relaxed">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">No examples available</p>
        )}
      </motion.div>

      {/* Common Mistakes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.5 }}
        className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl p-6 border border-slate-700/50 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Common Mistakes</h2>
        </div>
        {hasData(safeCommonMistakes) ? (
          <div className="space-y-3">
            {safeCommonMistakes.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="p-4 rounded-lg bg-slate-900/40 border border-slate-700/30 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-semibold text-sm">❌ Mistake:</span>
                  <p className="text-slate-300 leading-relaxed flex-1">{item.mistake}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-semibold text-sm">✓ Correction:</span>
                  <p className="text-slate-300 leading-relaxed flex-1">{item.correction}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">No common mistakes listed</p>
        )}
      </motion.div>
    </div>
  );
}
