"use client";

import { motion } from "framer-motion";
import { FileText, Sparkles, ArrowRight, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDocument } from "@/contexts/DocumentContext";
import { safeArray, hasData } from "@/lib/arrayHelpers";

interface SummaryCardProps {
  documentName: string;
  title: string;
  summary: string;
  mainThemes: string[];
  keyPoints?: string[];
  documentId: string;
}

export function SummaryCard({
  documentName,
  title,
  summary,
  mainThemes,
  keyPoints,
  documentId,
}: SummaryCardProps) {
  const router = useRouter();
  const { clearDocument } = useDocument();

  // Safe array for iteration
  const safeMainThemes = safeArray(mainThemes);
  const safeKeyPoints = safeArray(keyPoints);

  const handleNewDocument = () => {
    clearDocument();
    router.push("/upload");
  };

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              {documentName}
            </h2>
            <p className="text-sm text-slate-600">Document Summary</p>
          </div>
        </div>
      </motion.div>

      {/* Summary Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      >
        {/* Title Section */}
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 border-b border-slate-200 p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-600">AI-Generated Summary</p>
            </div>
          </div>
        </div>

        {/* Summary Text */}
        <div className="p-6">
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
          </div>
        </div>

        {/* Key Points */}
        {hasData(safeKeyPoints) && (
          <div className="border-t border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Key Points
            </h4>
            <ul className="space-y-3">
              {safeKeyPoints.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-start gap-3 text-slate-700"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="flex-1 leading-relaxed">{point}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Key Points Error Message */}
        {!hasData(safeKeyPoints) && documentId && (
          <div className="border-t border-slate-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              Key points could not be generated
            </p>
          </div>
        )}

        {/* Main Themes */}
        {hasData(safeMainThemes) && (
          <div className="border-t border-slate-200 bg-slate-50 p-6">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">
              Main Themes
            </h4>
            <div className="flex flex-wrap gap-2">
              {safeMainThemes.map((theme, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2" />
                  {theme}
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-900">
            Next Steps
          </h4>
          <button
            onClick={handleNewDocument}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            New Document
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/flashcards"
            className={cn(
              "group flex items-center justify-between p-4 rounded-lg",
              "bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200",
              "hover:shadow-md transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            )}
          >
            <div>
              <div className="font-medium text-slate-900 mb-1">
                Generate Flashcards
              </div>
              <div className="text-xs text-slate-600">
                Create study cards from this document
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/mcqs"
            className={cn(
              "group flex items-center justify-between p-4 rounded-lg",
              "bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200",
              "hover:shadow-md transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            )}
          >
            <div>
              <div className="font-medium text-slate-900 mb-1">
                Generate MCQs
              </div>
              <div className="text-xs text-slate-600">
                Test your knowledge with questions
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/learning-gain"
            className={cn(
              "group flex items-center justify-between p-4 rounded-lg",
              "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200",
              "hover:shadow-md transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            )}
          >
            <div>
              <div className="font-medium text-slate-900 mb-1">
                Measure Learning Gain
              </div>
              <div className="text-xs text-slate-600">
                Track your progress with pre/post tests
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
