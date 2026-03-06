"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDocument } from "@/contexts/DocumentContext";
import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { FlashcardPlayer } from "@/components/flashcards/FlashcardPlayer";
import { motion } from "framer-motion";
import Link from "next/link";

export default function FlashcardsPage() {
    const router = useRouter();
    const { documentId, flashcards, setFlashcards } = useDocument();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const fetchFlashcards = async () => {
        if (!documentId) return;

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/flashcards/${documentId}`,
                {
                    method: "POST",
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to generate flashcards");
            }

            const data = await response.json();
            setFlashcards(data.flashcards || []);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load flashcards"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId && !flashcards) {
            fetchFlashcards();
        }
    }, [documentId]);

    // Show empty state if no document is uploaded
    if (!documentId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-16 px-6">
                <EmptyState
                    icon={BookOpen}
                    title="Generate Flashcards"
                    description="Upload a document to create AI-generated flashcards. Perfect for memorization and quick review."
                    action={
                        <Link
                            href="/upload"
                            className="px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg transition-all"
                        >
                            Upload Document
                        </Link>
                    }
                />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-300">Generating flashcards...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center px-6">
                <div className="text-center space-y-6 max-w-md">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-white">Error</h3>
                    <p className="text-slate-300">{error}</p>
                    <button
                        onClick={fetchFlashcards}
                        className="px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all font-medium shadow-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!flashcards || flashcards.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center px-6">
                <div className="text-center space-y-6 max-w-md">
                    <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto">
                        <span className="text-3xl">📚</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-white">No Flashcards Available</h3>
                    <p className="text-slate-300">No flashcards were generated for this document.</p>
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
                        Flashcards
                    </h1>
                    <p className="text-slate-300 max-w-2xl mx-auto">
                        Master your knowledge with AI-generated flashcards. Click to flip, use arrow keys to navigate.
                    </p>
                </motion.div>

                {/* Flashcard Player */}
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
                    <FlashcardPlayer documentId={documentId} flashcardsData={flashcards} />
                </motion.div>
            </div>
        </div>
    );
}
