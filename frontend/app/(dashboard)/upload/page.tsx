"use client";

import { UploadCard } from "@/components/upload/UploadCard";
import { motion } from "framer-motion";

export default function UploadPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 22
        }}
        className="w-full max-w-2xl"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 22,
            delay: 0.1
          }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Upload Document
          </h1>
          <p className="text-slate-600">
            Upload your document to get started with AI-powered analysis
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 22,
            delay: 0.2
          }}
        >
          <UploadCard />
        </motion.div>
      </motion.div>
    </div>
  );
}
