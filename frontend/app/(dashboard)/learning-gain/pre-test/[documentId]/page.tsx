"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDocument } from "@/contexts/DocumentContext";
import { MCQPlayer } from "@/components/mcq/MCQPlayer";
import { Loader2 } from "lucide-react";

export default function PreTestPage() {
    const params = useParams();
    const router = useRouter();
    const documentId = params.documentId as string;
    const { setLearningGainState } = useDocument();

    const [mcqs, setMcqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetchPreTest();
    }, [documentId]);

    const fetchPreTest = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/learning/pre-test/${documentId}`,
                {
                    method: "POST",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to generate pre-test");
            }

            const data = await response.json();
            setMcqs(data.mcqs);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load pre-test");
        } finally {
            setLoading(false);
        }
    };

    const handlePreTestComplete = async (answers: any[], score: number, totalQuestions: number) => {
        try {
            // Submit pre-test answers
            const response = await fetch(
                `http://127.0.0.1:8000/learning/pre-test/submit/${documentId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        answers: answers.map((answer, index) => ({
                            question_index: index,
                            selected_option_index: answer,
                        })),
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to submit pre-test");
            }

            const result = await response.json();
            const scorePercentage = result.score_percentage;

            // Update learning gain state
            setLearningGainState({
                preTestCompleted: true,
                preTestScore: scorePercentage,
            });

            // Navigate back to learning gain page
            router.push("/learning-gain");
        } catch (err) {
            console.error("Failed to submit pre-test:", err);
            alert("Failed to submit pre-test. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
                    <p className="text-slate-300">Generating your pre-test...</p>
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
                        onClick={fetchPreTest}
                        className="px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all font-medium shadow-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-16 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-2">
                        Pre-Test
                    </div>
                    <h1 className="text-4xl font-bold text-white">Test Your Current Knowledge</h1>
                    <p className="text-slate-300 max-w-2xl mx-auto">
                        Answer these questions to establish your baseline understanding
                    </p>
                </div>

                {/* MCQ Player */}
                <MCQPlayer
                    documentId={documentId}
                    mcqsData={mcqs}
                    onComplete={handlePreTestComplete}
                    mode="pre-test"
                />
            </div>
        </div>
    );
}
