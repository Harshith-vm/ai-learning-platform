"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragDropZoneProps {
  onFileSelect: (file: File) => void;
}

export function DragDropZone({ onFileSelect }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Upload document"
        animate={{
          borderColor: isDragging ? "#6366f1" : "#e2e8f0",
          backgroundColor: isDragging ? "#f0f4ff" : "#ffffff",
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-12",
          "cursor-pointer transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          "hover:border-primary-300 hover:bg-slate-50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={handleFileInput}
          className="hidden"
          aria-hidden="true"
        />

        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div
            animate={{
              scale: isDragging ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-primary-500 to-secondary-500"
            )}
          >
            <Upload className="w-8 h-8 text-white" />
          </motion.div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {isDragging ? "Drop your file here" : "Upload Document"}
            </h3>
            <p className="text-sm text-slate-600">
              Drag and drop your file here, or click to browse
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <FileText className="w-4 h-4" />
            <span>Supported formats: PDF, DOCX, TXT</span>
          </div>
        </div>

        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-primary-50/50 rounded-xl pointer-events-none"
          />
        )}
      </motion.div>

      {/* File Requirements */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h4 className="text-sm font-medium text-slate-900 mb-2">
          File Requirements
        </h4>
        <ul className="space-y-1 text-xs text-slate-600">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Maximum file size: 50MB
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Accepted formats: PDF (.pdf), Word (.docx), Text (.txt)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            One file at a time
          </li>
        </ul>
      </div>
    </div>
  );
}
