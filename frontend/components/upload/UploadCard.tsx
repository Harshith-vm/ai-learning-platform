"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDocument } from "@/contexts/DocumentContext";
import { DragDropZone } from "./DragDropZone";
import { FileMetaDisplay } from "./FileMetaDisplay";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";

type UploadState = "idle" | "uploading" | "success" | "error";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export function UploadCard() {
  const router = useRouter();
  const { setDocumentId, setDocumentName, setSummary } = useDocument();
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [localDocumentId, setLocalDocumentId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState(0);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload PDF, DOCX, or TXT files.";
    }
    if (file.size > MAX_SIZE) {
      return "File size exceeds 50MB limit.";
    }
    return null;
  };

  const handleFileSelect = async (selectedFile: File) => {
    setError("");

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      setState("error");
      return;
    }

    setFile({
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
    });

    setState("uploading");
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const data = await apiRequest<{ document_id: string; filename: string }>(
        "/upload-document",
        {
          method: "POST",
          body: formData,
        }
      );

      clearInterval(progressInterval);
      setProgress(100);

      // Store document_id from response and clear old summary
      if (data.document_id) {
        setLocalDocumentId(data.document_id);
        setSummary(null); // Clear old summary to force regeneration
        setDocumentId(data.document_id);
        setDocumentName(selectedFile.name);
      }

      setState("success");
    } catch (err) {
      setState("error");
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed. Please try again."
      );
    }
  };

  const handleReset = () => {
    setState("idle");
    setFile(null);
    setLocalDocumentId("");
    setError("");
    setProgress(0);
  };

  const handleProcessDocument = () => {
    if (localDocumentId) {
      // Navigate to learning gain dashboard instead of summarize page
      router.push("/learning-gain");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8"
          >
            <DragDropZone onFileSelect={handleFileSelect} />
          </motion.div>
        )}

        {state === "uploading" && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8"
          >
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Uploading...
                </h3>
                <p className="text-sm text-slate-600">{file?.name}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">{progress}%</p>
              </div>
            </div>
          </motion.div>
        )}

        {state === "success" && file && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-8"
          >
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
              </motion.div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Upload Successful!
                </h3>
                <p className="text-sm text-slate-600">
                  Your document has been uploaded successfully
                </p>
              </div>

              <FileMetaDisplay file={file} />

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleReset}
                  className={cn(
                    "px-6 py-2.5 rounded-lg text-sm font-medium",
                    "bg-slate-100 text-slate-700 border border-slate-200",
                    "hover:bg-slate-200 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  )}
                >
                  Upload Another
                </button>
                <button
                  onClick={handleProcessDocument}
                  disabled={!localDocumentId}
                  className={cn(
                    "px-6 py-2.5 rounded-lg text-sm font-medium",
                    localDocumentId
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed",
                    "transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  )}
                >
                  Process Document
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8"
          >
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Upload Failed
                </h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>

              <button
                onClick={handleReset}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium",
                  "bg-primary-600 text-white",
                  "hover:bg-primary-700 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                )}
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
