"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { LearningGainDisplay } from "@/components/learning-gain/LearningGainDisplay";

interface LearningGainData {
  pre_score: number;
  post_score: number;
  learning_gain_percentage: number;
  concept_performance?: {
    weak: string[];
    strong: string[];
    accuracy_map: Record<string, number>;
  } | null;
  learning_insight?: string | null;
}

export default function LearningGainPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;

  const [data, setData] = useState<LearningGainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // In a real implementation, this would fetch from the backend
    // For now, we'll check if data was passed via navigation state
    // or fetch from localStorage/sessionStorage
    
    const storedData = sessionStorage.getItem(`learning_gain_${documentId}`);
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
      } catch (err) {
        setError("Failed to load learning gain data");
      }
    } else {
      setError("No learning gain data available. Please complete both pre-test and post-test.");
    }
    
    setLoading(false);
  }, [documentId]);

  const handleContinue = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
          <p className="text-slate-400">Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 flex items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto">
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="text-2xl font-semibold text-white">
            Learning Gain Not Available
          </h3>
          <p className="text-slate-400 leading-relaxed">
            {error || "Complete both pre-test and post-test to see your learning gain."}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg shadow-indigo-500/20"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 py-16 px-6">
      <LearningGainDisplay data={data} onContinue={handleContinue} />
    </div>
  );
}
