"use client";

import { LearningGainDisplay } from "@/components/learning-gain/LearningGainDisplay";

// Sample data for demonstration
const sampleData = {
  pre_score: 45.0,
  post_score: 88.0,
  learning_gain_percentage: 43.0,
  concept_performance: {
    weak: ["Advanced Algorithms", "Data Structures"],
    strong: ["Basic Syntax", "Control Flow", "Functions"],
    accuracy_map: {
      "Basic Syntax": 0.95,
      "Control Flow": 0.90,
      "Functions": 0.85,
      "Advanced Algorithms": 0.40,
      "Data Structures": 0.35
    }
  },
  learning_insight: "You've shown remarkable improvement, jumping from 45% to 88%. Your grasp of fundamental concepts like syntax and control flow is excellent. Focus on practicing advanced algorithms and data structures to further strengthen your skills. Consider working through more complex problems to build confidence in these areas."
};

export default function LearningGainDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-16 px-6">
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-4 text-center backdrop-blur-sm">
          <p className="text-yellow-300 text-sm font-medium">
            📊 Demo Mode - This is sample data to showcase the Learning Gain visualization
          </p>
        </div>
      </div>
      <LearningGainDisplay
        data={sampleData}
        onContinue={() => window.history.back()}
      />
    </div>
  );
}
