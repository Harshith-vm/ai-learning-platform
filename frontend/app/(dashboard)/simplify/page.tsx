"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Search } from "lucide-react";
import { ConceptExplanation } from "@/components/simplify/ConceptExplanation";
import { ConceptSkeleton } from "@/components/simplify/ConceptSkeleton";
import { mockConcept, mockConceptAsync } from "@/lib/mockConceptData";

const SAMPLE_CONCEPTS = [
  { id: "recursion", label: "Recursion", data: mockConcept },
  { id: "async", label: "Async Programming", data: mockConceptAsync },
];

export default function SimplifyPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<typeof mockConcept | null>(null);

  const handleSearch = (conceptId: string) => {
    const concept = SAMPLE_CONCEPTS.find(c => c.id === conceptId);
    if (!concept) return;

    setLoading(true);
    setSelectedConcept(null);

    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      setSelectedConcept(concept.data);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // For demo, search for recursion by default
    handleSearch("recursion");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 py-8 px-6">
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
          <p className="text-slate-400 max-w-2xl mx-auto">
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a concept to explain (e.g., recursion, async programming)..."
              className="w-full px-6 py-4 pl-14 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Explain
            </button>
          </form>
        </motion.div>

        {/* Sample Concepts */}
        {!loading && !selectedConcept && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <p className="text-sm text-slate-400 text-center">Try these sample concepts:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {SAMPLE_CONCEPTS.map((concept) => (
                <button
                  key={concept.id}
                  onClick={() => handleSearch(concept.id)}
                  className="px-6 py-3 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-slate-600/50 rounded-lg text-white font-medium transition-all"
                >
                  {concept.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && <ConceptSkeleton key="skeleton" />}
          {!loading && selectedConcept && (
            <ConceptExplanation key="explanation" concept={selectedConcept} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
