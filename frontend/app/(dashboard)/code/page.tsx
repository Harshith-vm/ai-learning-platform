"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, ListOrdered, Building2, GitCompare, Award } from "lucide-react";
import { CodeEditor } from "@/components/code/CodeEditor";
import { CodeActions } from "@/components/code/CodeActions";
import { CodeExplanation } from "@/components/code/results/CodeExplanation";
import { CodeImprovements } from "@/components/code/results/CodeImprovements";
import { CodeComplexity } from "@/components/code/results/CodeComplexity";
import { CodeRefactor } from "@/components/code/results/CodeRefactor";
import { ResultSkeleton } from "@/components/code/results/ResultSkeleton";
import {
  submitCode,
  explainCode,
  improveCode,
  analyzeComplexity,
  refactorCode,
  getStepwiseExplanation,
  getArchitectureAnalysis,
  getRefactorImpact,
  getCodeQuality,
} from "@/lib/codeApi";

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

type AnalysisType = "explain" | "improve" | "complexity" | "refactor" | "stepwise" | "architecture" | "refactor-impact" | "quality" | null;

interface AnalysisData {
  explanation?: {
    explanation: string;
    keyPoints?: string[];
  };
  improvements?: {
    improvements: Array<{
      type: "critical" | "warning" | "suggestion";
      title: string;
      description: string;
      line?: number;
    }>;
    summary?: string;
  };
  complexity?: {
    timeComplexity: {
      label: string;
      value: string;
      level: "low" | "medium" | "high";
      description: string;
    };
    spaceComplexity: {
      label: string;
      value: string;
      level: "low" | "medium" | "high";
      description: string;
    };
    summary: string;
  };
  refactor?: {
    originalCode: string;
    refactoredCode: string;
    improvements: string[];
    summary: string;
  };
  stepwise?: {
    explanation: string;
  };
  architecture?: {
    analysis: string;
  };
  refactorImpact?: {
    originalComplexity: string;
    refactoredComplexity: string;
    summary: string;
  };
  quality?: {
    readability: number;
    efficiency: number;
    maintainability: number;
    overall: number;
    summary: string;
  };
}

export default function CodePage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [loading, setLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisType>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData>({});
  const [error, setError] = useState<string | null>(null);
  const [refactorComplete, setRefactorComplete] = useState(false);

  const ensureSession = async (): Promise<string> => {
    if (!sessionId) {
      const session = await submitCode(code, "javascript");
      setSessionId(session.session_id);
      return session.session_id;
    }
    return sessionId;
  };

  const handleExplain = async (): Promise<void> => {
    setLoading(true);
    setActiveAnalysis(null);
    setError(null);

    try {
      const sid = await ensureSession();
      const result = await explainCode(sid);

      // Backend returns: { explanation: string }
      setAnalysisData({
        ...analysisData,
        explanation: {
          explanation: result.explanation,
          keyPoints: [],
        },
      });
      setActiveAnalysis("explain");
    } catch (err) {
      setError("Failed to explain code. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async (): Promise<void> => {
    setLoading(true);
    setActiveAnalysis(null);
    setError(null);

    try {
      const sid = await ensureSession();
      const result = await improveCode(sid);

      // Backend returns: { improvements: string }
      // Transform plain text into structured format for UI
      const improvementsText = result.improvements;
      const improvements = [{
        type: "suggestion" as const,
        title: "Code Improvements",
        description: improvementsText,
      }];

      setAnalysisData({
        ...analysisData,
        improvements: {
          improvements,
          summary: "AI-generated suggestions to enhance your code quality.",
        },
      });
      setActiveAnalysis("improve");
    } catch (err) {
      setError("Failed to improve code. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeComplexity = async (): Promise<void> => {
    setLoading(true);
    setActiveAnalysis(null);
    setError(null);

    try {
      const sid = await ensureSession();
      const result = await analyzeComplexity(sid);

      // Backend returns: { time_complexity: string, space_complexity: string, justification: string }
      // Determine complexity level based on Big-O notation
      const getComplexityLevel = (complexity: string): "low" | "medium" | "high" => {
        if (complexity.includes("O(1)") || complexity.includes("O(log")) {
          return "low";
        } else if (complexity.includes("O(n)")) {
          return "medium";
        } else {
          return "high";
        }
      };

      setAnalysisData({
        ...analysisData,
        complexity: {
          timeComplexity: {
            label: "Time Complexity",
            value: result.time_complexity,
            level: getComplexityLevel(result.time_complexity),
            description: "Computational time required to execute the algorithm",
          },
          spaceComplexity: {
            label: "Space Complexity",
            value: result.space_complexity,
            level: getComplexityLevel(result.space_complexity),
            description: "Memory space required during execution",
          },
          summary: result.justification,
        },
      });
      setActiveAnalysis("complexity");
    } catch (err) {
      setError("Failed to analyze complexity. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefactor = async (): Promise<void> => {
    setLoading(true);
    setActiveAnalysis(null);
    setError(null);

    try {
      const sid = await ensureSession();
      const result = await refactorCode(sid);

      // Backend returns: { refactored_code: string }
      setAnalysisData({
        ...analysisData,
        refactor: {
          originalCode: code,
          refactoredCode: result.refactored_code,
          improvements: [
            "Improved code structure",
            "Enhanced readability",
            "Optimized performance",
          ],
          summary: "Your code has been refactored to improve quality and maintainability.",
        },
      });
      setActiveAnalysis("refactor");
      setRefactorComplete(true); // Mark refactor as complete
    } catch (err) {
      setError("Failed to refactor code. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset session when code changes
  const handleCodeChange = (newCode: string): void => {
    setCode(newCode);
    setSessionId(null);
    setActiveAnalysis(null);
    setError(null);
    setRefactorComplete(false); // Reset refactor state
  };

  const handleStepwise = async (): Promise<void> => {
    setLoading(true);
    setActiveAnalysis(null);
    setError(null);

    try {
      const sid = await ensureSession();
      const result = await getStepwiseExplanation(sid);

      setAnalysisData({
        ...analysisData,
        stepwise: {
          explanation: result.stepwise_explanation,
        },
      });
      setActiveAnalysis("stepwise");
    } catch (err) {
      setError("Failed to get stepwise explanation. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleArchitecture = async (): Promise<void> => {
    setLoading(true);
    setActiveAnalysis(null);
    setError(null);

    try {
      const sid = await ensureSession();
      const result = await getArchitectureAnalysis(sid);

      setAnalysisData({
        ...analysisData,
        architecture: {
          analysis: result.architecture_analysis,
        },
      });
      setActiveAnalysis("architecture");
    } catch (err) {
      setError("Failed to get architecture analysis. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefactorImpact = async (): Promise<void> => {
    setLoading(true);
    setActiveAnalysis(null);
    setError(null);

    try {
      const sid = await ensureSession();

      // Step 1: Run refactor first (backend requirement)
      const refactorResult = await refactorCode(sid);

      // Store refactored code in state
      setAnalysisData({
        ...analysisData,
        refactor: {
          originalCode: code,
          refactoredCode: refactorResult.refactored_code,
          improvements: [
            "Improved code structure",
            "Enhanced readability",
            "Optimized performance",
          ],
          summary: "Your code has been refactored to improve quality and maintainability.",
        },
      });
      setRefactorComplete(true);

      // Step 2: Get refactor impact analysis
      const result = await getRefactorImpact(sid);

      setAnalysisData({
        ...analysisData,
        refactorImpact: {
          originalComplexity: result.original_time_complexity,
          refactoredComplexity: result.refactored_time_complexity,
          summary: result.improvement_summary,
        },
      });
      setActiveAnalysis("refactor-impact");
    } catch (err) {
      setError("Failed to get refactor impact. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuality = async (): Promise<void> => {
    setLoading(true);
    setActiveAnalysis(null);
    setError(null);

    try {
      const sid = await ensureSession();
      const result = await getCodeQuality(sid);

      setAnalysisData({
        ...analysisData,
        quality: {
          readability: result.readability,
          efficiency: result.efficiency,
          maintainability: result.maintainability,
          overall: result.overall,
          summary: result.summary,
        },
      });
      setActiveAnalysis("quality");
    } catch (err) {
      setError("Failed to evaluate code quality. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-8 px-6">
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
              onChange={handleCodeChange}
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
              onStepwise={handleStepwise}
              onArchitecture={handleArchitecture}
              onRefactorImpact={handleRefactorImpact}
              onQuality={handleQuality}
              loading={loading}
              disabled={!code.trim()}
              refactorComplete={refactorComplete}
            />
          </motion.div>

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

          {/* Results Panel */}
          <AnimatePresence mode="wait">
            {loading && (
              <ResultSkeleton key="skeleton" />
            )}

            {!loading && activeAnalysis === "explain" && analysisData.explanation && (
              <CodeExplanation
                key="explanation"
                explanation={analysisData.explanation.explanation}
                keyPoints={analysisData.explanation.keyPoints}
              />
            )}

            {!loading && activeAnalysis === "improve" && analysisData.improvements && (
              <CodeImprovements
                key="improvements"
                improvements={analysisData.improvements.improvements}
                summary={analysisData.improvements.summary}
              />
            )}

            {!loading && activeAnalysis === "complexity" && analysisData.complexity && (
              <CodeComplexity
                key="complexity"
                timeComplexity={analysisData.complexity.timeComplexity}
                spaceComplexity={analysisData.complexity.spaceComplexity}
                summary={analysisData.complexity.summary}
              />
            )}

            {!loading && activeAnalysis === "refactor" && analysisData.refactor && (
              <CodeRefactor
                key="refactor"
                originalCode={analysisData.refactor.originalCode}
                refactoredCode={analysisData.refactor.refactoredCode}
                improvements={analysisData.refactor.improvements}
                summary={analysisData.refactor.summary}
              />
            )}

            {!loading && activeAnalysis === "stepwise" && analysisData.stepwise && (
              <motion.div
                key="stepwise"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-xl p-8"
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-indigo-400" />
                  Stepwise Explanation
                </h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {analysisData.stepwise.explanation}
                  </p>
                </div>
              </motion.div>
            )}

            {!loading && activeAnalysis === "architecture" && analysisData.architecture && (
              <motion.div
                key="architecture"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-xl p-8"
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-violet-400" />
                  Architecture Analysis
                </h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {analysisData.architecture.analysis}
                  </p>
                </div>
              </motion.div>
            )}

            {!loading && activeAnalysis === "refactor-impact" && analysisData.refactorImpact && (
              <motion.div
                key="refactor-impact"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-xl p-8"
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-amber-400" />
                  Refactor Impact Comparison
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-2">Original Complexity</p>
                    <p className="text-2xl font-bold text-red-400">
                      {analysisData.refactorImpact.originalComplexity}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-2">Refactored Complexity</p>
                    <p className="text-2xl font-bold text-green-400">
                      {analysisData.refactorImpact.refactoredComplexity}
                    </p>
                  </div>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {analysisData.refactorImpact.summary}
                  </p>
                </div>
              </motion.div>
            )}

            {!loading && activeAnalysis === "quality" && analysisData.quality && (
              <motion.div
                key="quality"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-xl p-8"
              >
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-400" />
                  Code Quality Evaluation
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-slate-400 mb-2">Readability</p>
                    <p className="text-3xl font-bold text-blue-400">{analysisData.quality.readability}</p>
                    <p className="text-xs text-slate-500 mt-1">/10</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-slate-400 mb-2">Efficiency</p>
                    <p className="text-3xl font-bold text-green-400">{analysisData.quality.efficiency}</p>
                    <p className="text-xs text-slate-500 mt-1">/10</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-slate-400 mb-2">Maintainability</p>
                    <p className="text-3xl font-bold text-purple-400">{analysisData.quality.maintainability}</p>
                    <p className="text-xs text-slate-500 mt-1">/10</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-slate-400 mb-2">Overall</p>
                    <p className="text-3xl font-bold text-amber-400">{analysisData.quality.overall}</p>
                    <p className="text-xs text-slate-500 mt-1">/10</p>
                  </div>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {analysisData.quality.summary}
                  </p>
                </div>
              </motion.div>
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
    </ProtectedRoute>
  );
}
