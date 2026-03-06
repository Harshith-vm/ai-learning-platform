"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Search } from "lucide-react";
import { ConceptExplanation } from "@/components/simplify/ConceptExplanation";
import { ConceptSkeleton } from "@/components/simplify/ConceptSkeleton";
import { explainConcept, ConceptResponse } from "@/lib/conceptApi";
import { usePersona } from "@/contexts/PersonaContext";

export default function SimplifyPage() {
  const [inputValue, setInputValue] = useState("");
  const [conceptData, setConceptData] = useState<ConceptResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { persona } = usePersona();

  // Map persona types to backend format
  const getBackendPersona = (frontendPersona: string): string | undefined => {
    const personaMap: Record<string, string> = {
      beginner: "beginner",
      student: "student",
      senior: "senior_dev",
    };
    return personaMap[frontendPersona];
  };

  const handleExplain = async (): Promise<void> => {
    if (!inputValue.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setConceptData(null);

      console.log("Calling backend with:", inputValue);
      console.log("Persona:", persona);

      const backendPersona = getBackendPersona(persona);
      const data = await explainConcept(inputValue, backendPersona);

      console.log("Backend response:", data);

      setConceptData(data);
    } catch (err: any) {
      console.error("Error explaining concept:", err);
      setError(err.message || "Failed to explain concept. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    handleExplain();
  };

  // Transform backend response to component format
  const transformToComponentFormat = (data: ConceptResponse) => {
    return {
      title: data.concept,
      overview: data.explanation.split('\n')[0] || data.explanation.substring(0, 200),
      explanation: data.explanation,
      keyIdeas: data.key_ideas,
      examples: data.examples.map((example, index) => ({
        title: `Example ${index + 1}`,
        description: example,
        code: undefined,
      })),
      commonMistakes: data.common_mistakes,
    };
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-8 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 22
            }}
            className="text-center space-y-3"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Simplify Concepts
              </h1>
            </div>
            <p className="text-slate-100 max-w-2xl mx-auto text-base">
              Break down complex topics into simple, easy-to-understand explanations
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 22,
              delay: 0.1
            }}
          >
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter a concept to explain (e.g., recursion, async programming)..."
                className="w-full px-6 py-4 pl-14 bg-slate-900/80 border border-slate-500/50 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <button
                type="submit"
                onClick={handleExplain}
                disabled={!inputValue.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Explain
              </button>
            </form>
          </motion.div>

          {/* Persona Info */}
          {!loading && !conceptData && !error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <p className="text-sm text-slate-100 font-medium">
                Current persona: <span className="text-indigo-300 font-semibold capitalize">{persona}</span>
              </p>
              <p className="text-sm text-slate-200 mt-1">
                Explanations are tailored to your selected learning level
              </p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Results */}
          <AnimatePresence mode="wait">
            {loading && <ConceptSkeleton key="skeleton" />}

            {!loading && conceptData && (
              <ConceptExplanation
                key="explanation"
                concept={transformToComponentFormat(conceptData)}
              />
            )}
          </AnimatePresence>

          {/* Prerequisites Section */}
          {!loading && conceptData && conceptData.prerequisites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.6 }}
              className="bg-gradient-to-br from-slate-900/90 to-slate-800/95 rounded-xl p-6 border border-slate-600/20 backdrop-blur-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Prerequisites</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {conceptData.prerequisites.map((prereq, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-slate-950/40 border border-slate-600/20 rounded-lg text-sm text-slate-100"
                  >
                    {prereq}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
