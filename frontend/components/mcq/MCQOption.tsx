"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MCQOptionProps {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  isAnswered: boolean;
  onSelect: () => void;
}

export function MCQOption({
  option,
  index,
  isSelected,
  isCorrect,
  isAnswered,
  onSelect,
}: MCQOptionProps) {
  const optionLabels = ["A", "B", "C", "D"];

  // Deterministic feedback logic with clear priority:
  // 1. If answered and this is the correct option → always show green
  // 2. If answered and this is selected but incorrect → show red
  // 3. Otherwise → neutral state
  const showAsCorrect = isAnswered && isCorrect;
  const showAsIncorrect = isAnswered && isSelected && !isCorrect;
  const showFeedbackIcon = isAnswered && (showAsCorrect || showAsIncorrect);

  return (
    <motion.button
      onClick={onSelect}
      disabled={isAnswered}
      whileHover={!isAnswered ? { scale: 1.02 } : {}}
      whileTap={!isAnswered ? { scale: 0.98 } : {}}
      className={cn(
        "w-full text-left p-5 rounded-xl transition-all duration-200 border-2",
        !isSelected && !isAnswered ? "bg-card border-border hover:border-primary/50" : "",
        isSelected && !isAnswered ? "bg-primary/10 border-primary" : "",
        showAsCorrect ? "bg-success/10 border-success shadow-lg shadow-success/10" : "",
        showAsIncorrect ? "bg-error/10 border-error shadow-lg shadow-error/10" : "",
        isAnswered && !showAsCorrect && !showAsIncorrect ? "bg-muted/30 border-border opacity-60" : "",
        isAnswered ? "cursor-not-allowed" : ""
      )}
    >
      <div className="flex items-start gap-4">
        {/* Option Label */}
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm transition-colors",
            !isSelected && !isAnswered ? "bg-muted text-muted-foreground" : "",
            isSelected && !isAnswered ? "bg-primary/20 text-primary" : "",
            showAsCorrect ? "bg-success/20 text-success" : "",
            showAsIncorrect ? "bg-error/20 text-error" : "",
            isAnswered && !showAsCorrect && !showAsIncorrect ? "bg-muted/50 text-muted-foreground" : ""
          )}
        >
          {optionLabels[index]}
        </div>

        {/* Option Text */}
        <div className="flex-1 pt-0.5">
          <p className={cn(
            "leading-relaxed transition-colors font-medium",
            showAsCorrect ? "text-green-100" : "",
            showAsIncorrect ? "text-red-100" : "",
            !isAnswered ? "text-slate-100" : "",
            isAnswered && !showAsCorrect && !showAsIncorrect ? "text-slate-400" : ""
          )}>
            {option}
          </p>
        </div>

        {/* Feedback Icon */}
        {showFeedbackIcon && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex-shrink-0"
          >
            {showAsCorrect ? (
              <div className="w-7 h-7 rounded-full bg-success/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-success stroke-[3]" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-error/20 flex items-center justify-center">
                <X className="w-4 h-4 text-error stroke-[3]" />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
