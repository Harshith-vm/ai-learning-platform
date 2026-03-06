"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  message,
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn("flex flex-col items-center justify-center gap-4", className)}
    >
      <Loader2 className={cn(sizeClasses[size], "text-indigo-500 animate-spin")} />
      {message && (
        <p className="text-slate-400 text-sm animate-pulse">{message}</p>
      )}
    </motion.div>
  );
}
