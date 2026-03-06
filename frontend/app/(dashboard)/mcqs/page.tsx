"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDocument } from "@/contexts/DocumentContext";
import { HelpCircle, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { MCQPlayer } from "@/components/mcq/MCQPlayer";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MCQsPage() {
  const router = useRouter();
  const { documentId, mcqs, setMcqs } = useDocument();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [pastedContent, setPastedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchMCQs = async () => {
    if (!documentId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/mcqs/${documentId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate MCQs");
      }

      const data = await response.json();

      // Backend returns the correct format, use it directly
      setMcqs(data.mcqs);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load MCQs"
      );
    } finally {
      setLoading(false);
    }
  };

  const generateFromPastedContent = async () => {
    if (!pastedContent.trim()) return;

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/generate-mcqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: pastedContent }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate MCQs");
      }

      const data = await response.json();

      // Transform the data if it's in the text MCQ format (options as strings)
      const normalizedMcqs = data.mcqs.map((mcq: any) => {
        // Check if options are strings (text MCQ format)
        if (Array.isArray(mcq.options) && typeof mcq.options[0] === 'string') {
          return {
            question: mcq.question,
            options: mcq.options.map((opt: string, idx: number) => ({
              option: opt,
              is_correct: idx === mcq.correct_index
            })),
            difficulty: mcq.difficulty,
            explanation: mcq.explanation
          };
        }
        // Already in correct format (document MCQ format)
        return mcq;
      });

      setMcqs(normalizedMcqs);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate MCQs"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (documentId && !mcqs) {
      fetchMCQs();
    }
  }, [documentId]);

  // Show empty state with paste option if no document is uploaded
  if (!documentId && !mcqs) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <HelpCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Generate MCQs</h1>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Upload a document or paste content to create AI-generated multiple-choice questions.
            </p>
          </div>

          {/* Upload Option */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-xl p-8 text-center">
            <h3 className="text-lg font-semibold text-white mb-4">Upload Document</h3>
            <Link
              href="/upload"
              className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg transition-all"
            >
              Upload Document
            </Link>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-slate-400">OR</span>
            </div>
          </div>

          {/* Paste Content Option */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-xl p-8">
            <h3 className="text-lg font-semibold text-white mb-4">Paste Content</h3>
            <textarea
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              placeholder="Paste your document content here..."
              className="w-full h-64 px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={generateFromPastedContent}
              disabled={!pastedContent.trim() || isGenerating}
              className="mt-4 w-full px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating MCQs...
                </>
              ) : (
                "Generate MCQs"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-300">Generating MCQs...</p>
        </div>
      </div>
    );
  }

  if (error && !mcqs) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-2xl font-semibold text-white">Error</h3>
          <p className="text-slate-300">{error}</p>
          <button
            onClick={documentId ? fetchMCQs : generateFromPastedContent}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all font-medium shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!mcqs || mcqs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto">
            <span className="text-3xl">❓</span>
          </div>
          <h3 className="text-2xl font-semibold text-white">No MCQs Available</h3>
          <p className="text-slate-300">No MCQs were generated for this document.</p>
          <button
            onClick={() => router.push("/upload")}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all font-medium shadow-lg"
          >
            Upload New Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
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
          <h1 className="text-4xl font-bold text-white tracking-tight">
            MCQs
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Test your understanding with AI-generated questions.
          </p>
        </motion.div>

        {/* MCQ Player */}
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
          <MCQPlayer documentId={documentId || "pasted-content"} mcqsData={mcqs} />
        </motion.div>
      </div>
    </div>
  );
}
