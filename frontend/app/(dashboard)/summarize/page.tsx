"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDocument } from "@/contexts/DocumentContext";
import { FileText, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { SummaryCard } from "@/components/summary/SummaryCard";
import { SummarySkeleton } from "@/components/summary/SummarySkeleton";
import { SummaryError } from "@/components/summary/SummaryError";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

export default function SummarizePage() {
  const router = useRouter();
  const { documentId, documentName, summary, setSummary, setDocumentName } = useDocument();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [pastedContent, setPastedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  const fetchSummary = async () => {
    if (!documentId) return;
    if (summaryLoaded) return; // Prevent infinite regeneration

    // Clear previous summary and error
    setSummary(null);
    setLoading(true);
    setError("");

    try {
      // Fetch or generate summary
      const summaryData = await apiRequest<any>(
        `/summarize/${documentId}`,
        {
          method: "POST",
        }
      );

      // Automatically fetch key points after summary
      try {
        const keyPointsData = await apiRequest<{ key_points: string[] }>(
          `/key-points/${documentId}`,
          {
            method: "POST",
          }
        );

        summaryData.key_points = keyPointsData.key_points;
      } catch (keyPointsErr) {
        console.warn("Failed to fetch key points:", keyPointsErr);
        // Continue without key points
      }

      setSummary(summaryData);
      setSummaryLoaded(true); // Mark as loaded to prevent regeneration
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load summary"
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
      const summaryData = await apiRequest<any>("/generate-summary", {
        method: "POST",
        body: JSON.stringify({ text: pastedContent }),
      });

      setSummary(summaryData);
      setDocumentName("Pasted Content");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate summary"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger summary generation when documentId changes
  useEffect(() => {
    if (documentId) {
      // Clear previous summary and reset loaded state
      setSummary(null);
      setSummaryLoaded(false); // Reset to allow new generation
      fetchSummary();
    }
  }, [documentId]);

  // Show empty state with paste option if no document is uploaded
  if (!documentId && !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Summarize Documents</h1>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Upload a document or paste content to generate intelligent AI-powered summaries.
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
              className="w-full h-64 px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
                  Generating Summary...
                </>
              ) : (
                "Generate Summary"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || isGenerating) {
    return <SummarySkeleton />;
  }

  if (error && !summary) {
    return <SummaryError error={error} onRetry={documentId ? fetchSummary : generateFromPastedContent} />;
  }

  if (!summary) {
    return (
      <SummaryError
        error="No summary data available"
        onRetry={fetchSummary}
      />
    );
  }

  return (
    <SummaryCard
      documentName={documentName || "Document"}
      title={summary.title}
      summary={summary.summary}
      mainThemes={summary.main_themes}
      keyPoints={summary.key_points}
      documentId={documentId || ""}
    />
  );
}
