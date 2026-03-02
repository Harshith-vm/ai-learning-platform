"use client";

import { HelpCircle } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import Link from "next/link";

export default function MCQsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 py-16 px-6">
      <EmptyState
        icon={HelpCircle}
        title="Generate MCQs"
        description="Upload a document to create AI-generated multiple-choice questions. Perfect for exam preparation and self-assessment."
        action={
          <Link
            href="/upload"
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transition-all font-medium shadow-lg shadow-emerald-500/20"
          >
            Upload Document
          </Link>
        }
      />
    </div>
  );
}
