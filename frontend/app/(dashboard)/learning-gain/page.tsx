"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDocument } from "@/contexts/DocumentContext";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Lock, BookOpen, Brain, TrendingUp, Loader2, FileText, Layers, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function LearningGainPage() {
    const router = useRouter();
    const { documentId, documentName, learningGainState } = useDocument();

    useEffect(() => {
        if (!documentId) {
            router.push("/upload");
        }
    }, [documentId, router]);

    if (!documentId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
            </div>
        );
    }

    const panels = [
        {
            id: "pre-test",
            title: "1️⃣ Pre-Test",
            description: "Test your current knowledge before studying",
            icon: Brain,
            completed: learningGainState.preTestCompleted,
            locked: false,
            score: learningGainState.preTestScore,
            route: `/learning-gain/pre-test/${documentId}`,
            gradient: "from-indigo-500 to-blue-600",
        },
        {
            id: "study",
            title: "2️⃣ Study Materials",
            description: "Review summary, flashcards, and key points",
            icon: BookOpen,
            completed: false,
            locked: false, // Always unlocked - users can study anytime
            score: null,
            route: null,
            gradient: "from-purple-500 to-pink-600",
        },
        {
            id: "post-test",
            title: "3️⃣ Post-Test",
            description: "Test your knowledge after studying",
            icon: TrendingUp,
            completed: learningGainState.postTestCompleted,
            locked: !learningGainState.preTestCompleted,
            score: learningGainState.postTestScore,
            route: `/learning-gain/post-test/${documentId}`,
            gradient: "from-emerald-500 to-teal-600",
        },
        {
            id: "results",
            title: "4️⃣ Learning Gain",
            description: "View your improvement and progress",
            icon: TrendingUp,
            completed: learningGainState.postTestCompleted,
            locked: !learningGainState.postTestCompleted,
            score: learningGainState.learningGain,
            route: `/learning-gain/${documentId}`,
            gradient: "from-amber-500 to-orange-600",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-16 px-6">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <h1 className="text-4xl font-bold text-white">Learning Gain Dashboard</h1>
                    <p className="text-slate-300 max-w-2xl mx-auto">
                        Complete your learning journey: Pre-Test → Study → Post-Test → Results
                    </p>
                    {documentName && (
                        <p className="text-sm text-slate-400">Document: {documentName}</p>
                    )}
                </motion.div>

                {/* Learning Panels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {panels.map((panel, index) => {
                        const Icon = panel.icon;

                        return (
                            <motion.div
                                key={panel.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div
                                    className={`
                    relative bg-slate-900/60 backdrop-blur-md border rounded-xl p-6 h-full
                    transition-all duration-300
                    ${panel.completed ? "border-emerald-500/50 shadow-lg shadow-emerald-500/10" : "border-slate-700"}
                    ${panel.locked ? "opacity-60" : ""}
                  `}
                                >
                                    {/* Status Icon */}
                                    <div className="absolute -top-3 -right-3">
                                        {panel.completed ? (
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                                <CheckCircle2 className="w-5 h-5 text-white" />
                                            </div>
                                        ) : panel.locked ? (
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                                <Lock className="w-4 h-4 text-slate-400" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                                <Circle className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${panel.gradient} bg-opacity-20`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-1">
                                                {panel.title}
                                            </h3>
                                            <p className="text-sm text-slate-400">
                                                {panel.description}
                                            </p>
                                        </div>

                                        {/* Score Display */}
                                        {panel.score !== null && panel.id !== "results" && (
                                            <div className="pt-2 border-t border-slate-700">
                                                <p className="text-xs text-slate-400">Score</p>
                                                <p className="text-lg font-semibold text-white">
                                                    {panel.score}%
                                                </p>
                                            </div>
                                        )}

                                        {/* Learning Gain Display */}
                                        {panel.id === "results" && panel.score !== null && (
                                            <div className="pt-2 border-t border-slate-700">
                                                <p className="text-xs text-slate-400">Learning Gain</p>
                                                <p className="text-2xl font-bold text-emerald-400">
                                                    +{panel.score}%
                                                </p>
                                            </div>
                                        )}

                                        {/* Action Button or Study Materials */}
                                        {!panel.locked && panel.id !== "study" && panel.route && (
                                            <Link
                                                href={panel.route}
                                                className={`
                          block w-full px-4 py-2 rounded-lg text-center text-sm font-medium
                          transition-all shadow-lg
                          ${panel.completed
                                                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                                        : `bg-gradient-to-r ${panel.gradient} text-white hover:opacity-90`
                                                    }
                        `}
                                            >
                                                {panel.completed ? "Review" : "Start"}
                                            </Link>
                                        )}

                                        {/* Study Materials Links */}
                                        {panel.id === "study" && !panel.locked && (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-3 gap-2">
                                                    <Link
                                                        href="/summarize"
                                                        className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all text-center"
                                                    >
                                                        <FileText className="w-5 h-5 text-blue-400" />
                                                        <span className="text-xs text-slate-300">Summary</span>
                                                    </Link>
                                                    <Link
                                                        href="/flashcards"
                                                        className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all text-center"
                                                    >
                                                        <Layers className="w-5 h-5 text-purple-400" />
                                                        <span className="text-xs text-slate-300">Flashcards</span>
                                                    </Link>
                                                    <Link
                                                        href="/simplify"
                                                        className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all text-center"
                                                    >
                                                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                                                        <span className="text-xs text-slate-300">Simplify</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Progress Summary */}
                {learningGainState.preTestCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-xl p-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">Your Progress</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                <p className="text-sm text-slate-400 mb-1">Pre-Test</p>
                                <p className="text-2xl font-bold text-white">
                                    {learningGainState.preTestScore ?? "-"}%
                                </p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <p className="text-sm text-slate-400 mb-1">Post-Test</p>
                                <p className="text-2xl font-bold text-white">
                                    {learningGainState.postTestScore ?? "-"}%
                                </p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <p className="text-sm text-slate-400 mb-1">Learning Gain</p>
                                <p className="text-2xl font-bold text-emerald-400">
                                    {learningGainState.learningGain !== null ? `+${learningGainState.learningGain}%` : "-"}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
