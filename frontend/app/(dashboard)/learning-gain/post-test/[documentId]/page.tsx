"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDocument } from "@/contexts/DocumentContext";
import { MCQPlayer } from "@/components/mcq/MCQPlayer";
import { Loader2 } from "lucide-react";

export default function PostTestPage() {
    const params = useParams();
    const router = useRouter();
    const documentId = params.documentId as string;
    const { setLearningGainState, learningGainState } = useDocument();

    const [mcqs, setMcqs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        // Check if pre-test is completed
        if (!learningGainState.preTestCompleted) {
            router.push("/learning-gain");
            return;
        }

        fetchPostTest();
    }, [documentId, learningGainState.preTestCompleted]);

    const fetchPostTest = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/learning/post-test/${documentId}`,
                {
                    method: "POST",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to generate post-test");
            }

            const data = await response.json();
            setMcqs(data.mcqs);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load post-test");
        } finally {
            setLoading(false);
        }
    };

    const handlePostTestComplete = async (answers: any[], score: number, totalQuestions: number) => {
        try {
            // Submit post-test answers
            const response = await fetch(
                `http://127.0.0.1:8000/learning/post-test/submit/${documentId}`,
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
                throw new Error("Failed to submit post-test");
            }

            const result = await response.json();

            // Update learning gain state
            setLearningGainState({
                postTestCompleted: true,
                postTestScore: result.post_score,
                learningGain: result.learning_gain_percentage,
            });

            // Store detailed results for the results page
            if (typeof window !== "undefined") {
                sessionStorage.setItem(`learning_gain_${documentId}`, JSON.stringify(result));
            }

            // Navigate to learning gain page
            router.push("/learning-gain");
        } catch (err) {
            console.error("Failed to submit post-test:", err);
            alert("Failed to submit post-test. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
                    <p className="text-slate-300">Generating your post-test...</p>
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
                        onClick={fetchPostTest}
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
                    <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium mb-2">
                        Post-Test
                    </div>
                    <h1 className="text-4xl font-bold text-white">Measure Your Improvement</h1>
                    <p className="text-slate-300 max-w-2xl mx-auto">
                        Test your knowledge after studying to see how much you've learned
                    </p>
                    {learningGainState.preTestScore !== null && (
                        <p className="text-sm text-slate-400">
                            Your pre-test score: {learningGainState.preTestScore}%
                        </p>
                    )}
                </div>

                {/* MCQ Player */}
                <MCQPlayer
                    documentId={documentId}
                    mcqsData={mcqs}
                    onComplete={handlePostTestComplete}
                    mode="post-test"
                />
            </div>
        </div>
    );
}
