"use client";

import { useParams } from "next/navigation";
import { MCQPlayer } from "@/components/mcq/MCQPlayer";
import { motion } from "framer-motion";

export default function MCQsPage() {
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
            MCQs
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Test your understanding with AI-generated questions.
          </p>
        </motion.div>

        {/* MCQ Player */}
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
          <MCQPlayer documentId={documentId} />
        </motion.div>
      </div>
    </div>
  );
}
