"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

interface FlashcardProps {
  question: string;
  answer: string;
  isFlipped: boolean;
  onFlip: () => void;
  isAnimating: boolean;
}

export function Flashcard({ 
  question, 
  answer, 
  isFlipped, 
  onFlip,
  isAnimating 
}: FlashcardProps) {
  const handleClick = () => {
    if (!isAnimating) {
      onFlip();
    }
  };

  return (
    <div 
      className={cn(
        "flashcard-container",
        isAnimating && "pointer-events-none"
      )} 
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={isFlipped ? "Show question" : "Show answer"}
    >
      <motion.div
        className="flashcard"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        {/* Front - Question */}
        <div className="flashcard-face flashcard-front">
          <div className="flex flex-col h-full justify-between">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold tracking-widest text-primary uppercase">
                Question
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <RotateCcw className="w-4 h-4 text-primary" />
              </div>
            </div>
            
            {/* Question Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
              <p className="text-2xl md:text-3xl font-semibold text-foreground text-center leading-relaxed">
                {question}
              </p>
            </div>
            
            {/* Footer Hint */}
            <div className="text-xs text-muted-foreground text-center">
              Click or press <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono text-xs">Space</kbd> to reveal answer
            </div>
          </div>
        </div>

        {/* Back - Answer */}
        <div className="flashcard-face flashcard-back">
          <div className="flex flex-col h-full justify-between">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold tracking-widest text-success uppercase">
                Answer
              </div>
              <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                <span className="text-lg">✓</span>
              </div>
            </div>
            
            {/* Answer Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-8">
              <p className="text-xl md:text-2xl font-medium text-foreground text-center leading-relaxed">
                {answer}
              </p>
            </div>
            
            {/* Footer Hint */}
            <div className="text-xs text-muted-foreground text-center">
              Click or press <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono text-xs">Space</kbd> to see question
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
