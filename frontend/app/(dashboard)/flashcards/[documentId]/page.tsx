"use client";

import { useParams } from "next/navigation";
import { FlashcardPlayer } from "@/components/flashcards/FlashcardPlayer";
import { motion } from "framer-motion";

export default function FlashcardsPage() {
  const params = useParams();
  const documentId = params.documentId as string;

  return (
    <div className="min-h-screen bg-background py-16 px-6">
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
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Flashcards
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
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
          <FlashcardPlayer documentId={documentId} />
        </motion.div>
      </div>
    </div>
  );
}
