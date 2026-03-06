"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SummaryCard } from "@/components/summary/SummaryCard";
import { SummarySkeleton } from "@/components/summary/SummarySkeleton";
import { SummaryError } from "@/components/summary/SummaryError";

interface SummaryData {
  title: string;
  summary: string;
  main_themes: string[];
}

interface DocumentData {
  filename: string;
}

export default function SummarizePage() {
  const params = useParams();
  const documentId = params.documentId as string;

  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchSummary = async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch document info first
      const docResponse = await fetch(
        `http://127.0.0.1:8000/document/${documentId}`
      );

      if (!docResponse.ok) {
        throw new Error("Document not found");
      }

      const docData = await docResponse.json();
      setDocumentData(docData);

      // Fetch or generate summary
      const summaryResponse = await fetch(
        `http://127.0.0.1:8000/summarize/${documentId}`,
        {
          method: "POST",
        }
      );

      if (!summaryResponse.ok) {
        const errorText = await summaryResponse.text();
        throw new Error(errorText || "Failed to generate summary");
      }

      const summary = await summaryResponse.json();
      setSummaryData(summary);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load summary"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchSummary();
    }
  }, [documentId]);

  if (loading) {
    return <SummarySkeleton />;
  }

  if (error) {
    return <SummaryError error={error} onRetry={fetchSummary} />;
  }

  if (!summaryData || !documentData) {
    return (
      <SummaryError
        error="No summary data available"
        onRetry={fetchSummary}
      />
    );
  }

  return (
    <SummaryCard
      documentName={documentData.filename}
      title={summaryData.title}
      summary={summaryData.summary}
      mainThemes={summaryData.main_themes}
      documentId={documentId}
    />
  );
}
