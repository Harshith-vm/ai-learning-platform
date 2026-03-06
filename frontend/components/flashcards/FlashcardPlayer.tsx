"use client";

import { useState, useEffect, useCallback } from "react";
import { Flashcard } from "./Flashcard";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";

interface FlashcardData {
  question: string;
  answer: string;
}

interface FlashcardPlayerProps {
  documentId: string;
  flashcardsData?: FlashcardData[];
}

export function FlashcardPlayer({ documentId, flashcardsData }: FlashcardPlayerProps) {
  const [flashcards, setFlashcards] = useState<FlashcardData[]>(flashcardsData || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(!flashcardsData);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!flashcardsData) {
      fetchFlashcards();
    }
  }, [documentId, flashcardsData]);

  const handleFlip = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setIsFlipped(prev => !prev);
      setTimeout(() => setIsAnimating(false), 450);
    }
  }, [isAnimating]);

  const handleNext = useCallback(() => {
    if (currentIndex < flashcards.length - 1 && !isAnimating) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, flashcards.length, isAnimating]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0 && !isAnimating) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  }, [currentIndex, isAnimating]);

  const handleReset = useCallback(() => {
    if (!isAnimating) {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [isAnimating]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scroll behavior
      if (["ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === " ") {
        handleFlip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevious, handleNext, handleFlip]);

  const fetchFlashcards = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest<{ flashcards: FlashcardData[] }>(
        `/flashcards/${documentId}`,
        {
          method: "POST",
        }
      );

      setFlashcards(data.flashcards);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load flashcards"
      );
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Generating flashcards...</p>
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
            Failed to Load Flashcards
          </h3>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={fetchFlashcards}
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <span className="text-3xl">📚</span>
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            No Flashcards Available
          </h3>
          <p className="text-muted-foreground">
            No flashcards were generated for this document.
          </p>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-base font-semibold text-foreground">
              Card {currentIndex + 1} of {flashcards.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <button
            onClick={handleReset}
            disabled={isAnimating}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium",
              "bg-card text-card-foreground hover:bg-accent",
              "border border-border hover:border-primary/50",
              "transition-all duration-200",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            Reset
          </button>
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

      {/* Flashcard */}
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
        >
          <Flashcard
            question={currentCard.question}
            answer={currentCard.answer}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            isAnimating={isAnimating}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0 || isAnimating}
          className={cn(
            "px-10 py-3 rounded-lg font-medium text-sm",
            "transition-all duration-200",
            currentIndex === 0 || isAnimating
              ? "bg-muted/40 text-muted-foreground cursor-not-allowed"
              : "bg-card text-foreground hover:bg-accent border border-border hover:border-primary/50"
          )}
        >
          Previous
        </button>

        {currentIndex < flashcards.length - 1 ? (
          <button
            onClick={handleNext}
            disabled={isAnimating}
            className={cn(
              "px-10 py-3 rounded-lg font-medium text-sm",
              "transition-all duration-200",
              isAnimating
                ? "bg-muted/40 text-muted-foreground cursor-not-allowed"
                : "bg-card text-foreground hover:bg-accent border border-border hover:border-primary/50"
            )}
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => window.location.href = `/summarize/${documentId}`}
            className="px-10 py-3 rounded-lg font-medium text-sm bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg"
          >
            Continue Learning
          </button>
        )}
      </div>

      {/* Keyboard Hint */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Use <kbd className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-mono">←</kbd>{" "}
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-mono">Space</kbd>{" "}
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground font-mono">→</kbd>{" "}
          to navigate
        </p>
      </div>
    </div>
  );
}
