"use client";

import { FileText } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import Link from "next/link";

export default function SummarizePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 py-16 px-6">
      <EmptyState
        icon={FileText}
        title="Summarize Documents"
        description="Upload a document to generate intelligent AI-powered summaries. Extract key insights and main themes instantly."
        action={
          <Link
            href="/upload"
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 transition-all font-medium shadow-lg shadow-blue-500/20"
          >
            Upload Document
          </Link>
        }
      />
    </div>
  );
}
