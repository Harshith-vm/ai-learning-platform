"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2 } from "lucide-react";
import { CodeEditor } from "@/components/code/CodeEditor";
import { CodeActions } from "@/components/code/CodeActions";
import { CodeExplanation } from "@/components/code/results/CodeExplanation";
import { CodeImprovements } from "@/components/code/results/CodeImprovements";
import { CodeComplexity } from "@/components/code/results/CodeComplexity";
import { CodeRefactor } from "@/components/code/results/CodeRefactor";
import { ResultSkeleton } from "@/components/code/results/ResultSkeleton";
import {
  mockExplanation,
  mockImprovements,
  mockComplexity,
  mockRefactor,
} from "@/lib/mockCodeData";

const DEFAULT_CODE = `// Welcome to the AI Code Assistant
// Write or paste your code here for analysis

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Try the action buttons below to:
// • Get AI explanations
// • Improve code quality
// • Analyze complexity
// • Refactor for better performance

console.log(fibonacci(10));
`;

type AnalysisType = "explain" | "improve" | "complexity" | "refactor" | null;

export default function CodePage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [loading, setLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisType>(null);

  const simulateLoading = (type: AnalysisType) => {
    setLoading(true);
    setActiveAnalysis(null);
    
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      setActiveAnalysis(type);
    }, 1500);
  };

  const handleExplain = () => {
    simulateLoading("explain");
  };

  const handleImprove = () => {
    simulateLoading("improve");
  };

  const handleAnalyzeComplexity = () => {
    simulateLoading("complexity");
  };

  const handleRefactor = () => {
    simulateLoading("refactor");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
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
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              AI Code Assistant
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Write or paste your code below. Use AI-powered tools to explain, improve, analyze, and refactor.
          </p>
        </motion.div>

        {/* Editor */}
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
          <CodeEditor
            value={code}
            onChange={setCode}
            language="javascript"
          />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 22,
            delay: 0.2
          }}
        >
          <CodeActions
            onExplain={handleExplain}
            onImprove={handleImprove}
            onAnalyzeComplexity={handleAnalyzeComplexity}
            onRefactor={handleRefactor}
            loading={loading}
            disabled={!code.trim()}
          />
        </motion.div>

        {/* Results Panel */}
        <AnimatePresence mode="wait">
          {loading && (
            <ResultSkeleton key="skeleton" />
          )}

          {!loading && activeAnalysis === "explain" && (
            <CodeExplanation
              key="explanation"
              explanation={mockExplanation.explanation}
              keyPoints={mockExplanation.keyPoints}
            />
          )}

          {!loading && activeAnalysis === "improve" && (
            <CodeImprovements
              key="improvements"
              improvements={mockImprovements.improvements}
              summary={mockImprovements.summary}
            />
          )}

          {!loading && activeAnalysis === "complexity" && (
            <CodeComplexity
              key="complexity"
              timeComplexity={mockComplexity.timeComplexity}
              spaceComplexity={mockComplexity.spaceComplexity}
              cyclomaticComplexity={mockComplexity.cyclomaticComplexity}
              summary={mockComplexity.summary}
            />
          )}

          {!loading && activeAnalysis === "refactor" && (
            <CodeRefactor
              key="refactor"
              originalCode={mockRefactor.originalCode}
              refactoredCode={mockRefactor.refactoredCode}
              improvements={mockRefactor.improvements}
              summary={mockRefactor.summary}
            />
          )}
        </AnimatePresence>

        {/* Info Footer */}
        {!loading && !activeAnalysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-sm text-slate-500">
              Supports JavaScript, TypeScript, Python, and more. 
              AI analysis powered by advanced language models.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
