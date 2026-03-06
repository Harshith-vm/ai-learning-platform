"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { MCQOption } from "./MCQOption";
import { cn } from "@/lib/utils";

interface MCQOptionData {
    option: string;
    is_correct: boolean;
}

interface MCQData {
    question: string;
    options: MCQOptionData[];
    difficulty: "easy" | "medium" | "hard";
    explanation: string;
}

interface MCQPlayerProps {
    documentId: string;
    mcqsData?: MCQData[];
    onComplete?: (answers: number[], score: number, totalQuestions: number) => void;
    mode?: "normal" | "pre-test" | "post-test";
}

export function MCQPlayer({ documentId, mcqsData, onComplete, mode = "normal" }: MCQPlayerProps) {
    const [mcqs, setMcqs] = useState<MCQData[]>(mcqsData || []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(!mcqsData);
    const [error, setError] = useState<string>("");
    const [showCompletion, setShowCompletion] = useState(false);
    const [userAnswers, setUserAnswers] = useState<number[]>([]);

    useEffect(() => {
        if (!mcqsData) {
            fetchMCQs();
        }
    }, [documentId, mcqsData]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showCompletion) return;

            // Number keys 1-4 for option selection
            if (["1", "2", "3", "4"].includes(e.key) && !isAnswered) {
                const optionIndex = parseInt(e.key) - 1;
                if (optionIndex < mcqs[currentIndex]?.options.length) {
                    setSelectedOption(optionIndex);
                }
            }

            // Enter to submit or continue
            if (e.key === "Enter") {
                if (selectedOption !== null && !isAnswered) {
                    handleSubmit();
                } else if (isAnswered) {
                    handleNext();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedOption, isAnswered, currentIndex, mcqs.length, showCompletion]);

    const fetchMCQs = async () => {
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
                throw new Error("Failed to generate MCQs");
            }

            const data = await response.json();

            // Backend returns the correct format, use it directly
            console.log("MCQs received from backend:", data.mcqs);
            console.log("First MCQ options:", data.mcqs[0]?.options);

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
                err instanceof Error ? err.message : "Failed to load MCQs"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = useCallback(() => {
        if (selectedOption === null || isAnswered) return;

        const currentMCQ = mcqs[currentIndex];
        const isCorrect = currentMCQ.options[selectedOption].is_correct;

        // Store the user's answer
        const newAnswers = [...userAnswers];
        newAnswers[currentIndex] = selectedOption;
        setUserAnswers(newAnswers);

        setTimeout(() => {
            setIsAnswered(true);
            if (isCorrect) {
                setScore(score + 1);
            }
        }, 150);
    }, [selectedOption, isAnswered, mcqs, currentIndex, score, userAnswers]);

    const handleNext = useCallback(() => {
        if (currentIndex < mcqs.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowCompletion(true);

            // Call onComplete callback if provided (for pre-test/post-test)
            if (onComplete) {
                onComplete(userAnswers, score, mcqs.length);
            }
        }
    }, [currentIndex, mcqs.length, onComplete, userAnswers, score]);

    const handleReset = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setShowCompletion(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground">Generating MCQs...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                        Failed to Load MCQs
                    </h3>
                    <p className="text-muted-foreground">{error}</p>
                    <button
                        onClick={fetchMCQs}
                        className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (mcqs.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <span className="text-3xl">📝</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                        No MCQs Available
                    </h3>
                    <p className="text-muted-foreground">
                        No questions were generated for this document.
                    </p>
                </div>
            </div>
        );
    }

    if (showCompletion) {
        const percentage = Math.round((score / mcqs.length) * 100);
        const performanceLabel =
            percentage >= 80 ? { text: "Excellent", color: "success", emoji: "🎉" } :
                percentage >= 50 ? { text: "Good", color: "warning", emoji: "👍" } :
                    { text: "Needs Review", color: "error", emoji: "📚" };

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="max-w-2xl mx-auto"
            >
                <div className="bg-card rounded-2xl p-12 border border-border shadow-xl text-center space-y-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-lg"
                    >
                        <span className="text-5xl">🎯</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-4xl font-bold text-foreground mb-3">
                            Quiz Complete!
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            You've completed all questions
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                    >
                        <div className="text-7xl font-bold text-foreground">
                            {score}<span className="text-muted-foreground">/{mcqs.length}</span>
                        </div>
                        <div className="text-3xl font-semibold text-foreground">
                            {percentage}%
                        </div>
                        <div className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-lg font-medium",
                            performanceLabel.color === "success" ? "bg-success/10 text-success border border-success/20" : "",
                            performanceLabel.color === "warning" ? "bg-warning/10 text-warning border border-warning/20" : "",
                            performanceLabel.color === "error" ? "bg-error/10 text-error border border-error/20" : ""
                        )}>
                            <span>{performanceLabel.emoji}</span>
                            {performanceLabel.text}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-2 gap-4 max-w-md mx-auto"
                    >
                        <div className="bg-success/5 rounded-xl p-6 border border-success/20">
                            <div className="text-4xl font-bold text-success mb-2">{score}</div>
                            <div className="text-sm text-muted-foreground">Correct</div>
                        </div>
                        <div className="bg-error/5 rounded-xl p-6 border border-error/20">
                            <div className="text-4xl font-bold text-error mb-2">{mcqs.length - score}</div>
                            <div className="text-sm text-muted-foreground">Incorrect</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
                    >
                        <button
                            onClick={handleReset}
                            className="px-8 py-3 rounded-lg bg-card text-foreground hover:bg-accent border border-border hover:border-primary/50 transition-all font-medium"
                        >
                            Retry MCQs
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="px-8 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all font-medium shadow-lg"
                        >
                            Continue Learning
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    const currentMCQ = mcqs[currentIndex];
    const progress = ((currentIndex + 1) / mcqs.length) * 100;

    const difficultyColors = {
        easy: "text-success bg-success/10 border border-success/20",
        medium: "text-warning bg-warning/10 border border-warning/20",
        hard: "text-error bg-error/10 border border-error/20",
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            {/* Progress Bar */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-base font-semibold text-foreground">
                            Question {currentIndex + 1} of {mcqs.length}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {Math.round(progress)}% Complete
                        </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Score: {score}/{mcqs.length}
                    </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary via-secondary to-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 18
                        }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                    }}
                    className="bg-card rounded-2xl p-8 border border-border shadow-lg space-y-6"
                >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="text-xs font-bold tracking-widest text-primary uppercase">
                            Question
                        </div>
                        <span className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium capitalize",
                            difficultyColors[currentMCQ.difficulty]
                        )}>
                            {currentMCQ.difficulty}
                        </span>
                    </div>

                    {/* Question Text */}
                    <div>
                        <p className="text-2xl font-semibold text-foreground leading-relaxed">
                            {currentMCQ.question}
                        </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentMCQ.options.map((option, index) => (
                            <MCQOption
                                key={index}
                                option={option.option}
                                index={index}
                                isSelected={selectedOption === index}
                                isCorrect={option.is_correct}
                                isAnswered={isAnswered}
                                onSelect={() => !isAnswered && setSelectedOption(index)}
                            />
                        ))}
                    </div>

                    {/* Feedback & Explanation */}
                    {isAnswered && selectedOption !== null && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 22,
                                delay: 0.15
                            }}
                            className="space-y-4 pt-2"
                        >
                            {/* Feedback Message */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20,
                                    delay: 0.25
                                }}
                                className={cn(
                                    "p-4 rounded-xl border-2 font-medium",
                                    currentMCQ.options[selectedOption].is_correct
                                        ? "bg-success/10 border-success/40 text-success"
                                        : "bg-error/10 border-error/40 text-error"
                                )}
                            >
                                {currentMCQ.options[selectedOption].is_correct ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">✅</span>
                                        <span>Correct! Well done.</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">❌</span>
                                        <span>Not quite. The correct answer is highlighted in green above.</span>
                                    </div>
                                )}
                            </motion.div>

                            {/* Explanation */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.35 }}
                                className="pt-2 border-t border-border"
                            >
                                <div className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-3">
                                    Explanation
                                </div>
                                <p className="text-foreground leading-relaxed">
                                    {currentMCQ.explanation}
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
                <AnimatePresence mode="wait">
                    {!isAnswered && selectedOption !== null && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            onClick={handleSubmit}
                            className="px-12 py-3.5 rounded-lg font-medium text-sm bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg"
                        >
                            Submit Answer
                        </motion.button>
                    )}

                    {isAnswered && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            onClick={handleNext}
                            className="px-12 py-3.5 rounded-lg font-medium text-sm bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg flex items-center gap-2"
                        >
                            {currentIndex < mcqs.length - 1 ? "Next Question" : "View Results"}
                            <span>→</span>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Keyboard Hint */}
            <div className="text-center">
                <p className="text-xs text-muted-foreground">
                    Use <kbd className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-mono">1-4</kbd>{" "}
                    to select, <kbd className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-mono">Enter</kbd>{" "}
                    to submit
                </p>
            </div>
        </div>
    );
}
