"use client";

import { usePersona } from "@/contexts/PersonaContext";
import { FeatureCard } from "@/components/dashboard/FeatureCard";
import {
  FileText,
  Layers,
  HelpCircle,
  Code2,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: FileText,
    title: "Summarize Documents",
    gradient: "from-blue-500 to-cyan-500",
    descriptions: {
      beginner:
        "Turn long documents into easy-to-read summaries. Perfect for understanding complex topics quickly!",
      student:
        "Generate concise summaries from lengthy documents. Ideal for study materials and research papers.",
      senior:
        "Extract key insights from documents with AI-powered summarization. Optimized for efficiency.",
    },
  },
  {
    icon: Layers,
    title: "Flashcards",
    gradient: "from-purple-500 to-pink-500",
    descriptions: {
      beginner:
        "Create fun flashcards to help you remember important information. Learning made simple!",
      student:
        "Generate study flashcards automatically from your materials. Enhance retention and recall.",
      senior:
        "Auto-generate flashcards for knowledge retention. Streamline your learning workflow.",
    },
  },
  {
    icon: HelpCircle,
    title: "MCQs",
    gradient: "from-emerald-500 to-teal-500",
    descriptions: {
      beginner:
        "Practice with multiple-choice questions created just for you. Test your knowledge in a friendly way!",
      student:
        "Generate practice MCQs from any content. Perfect for exam preparation and self-assessment.",
      senior:
        "Create targeted MCQs for knowledge validation. Efficient assessment generation.",
    },
  },
  {
    icon: Code2,
    title: "Code Intelligence",
    gradient: "from-orange-500 to-red-500",
    descriptions: {
      beginner:
        "Get help understanding code with simple explanations. Coding doesn't have to be scary!",
      student:
        "Analyze and understand code with AI assistance. Learn programming concepts effectively.",
      senior:
        "Advanced code analysis and optimization suggestions. Accelerate development workflows.",
    },
  },
  {
    icon: Lightbulb,
    title: "Concept Simplification",
    gradient: "from-indigo-500 to-purple-500",
    descriptions: {
      beginner:
        "Break down complicated ideas into simple terms. Understanding made easy for everyone!",
      student:
        "Simplify complex concepts for better understanding. Bridge knowledge gaps efficiently.",
      senior:
        "Distill complex topics into actionable insights. Optimize knowledge transfer.",
    },
  },
];

export default function DashboardPage() {
  const { persona } = usePersona();

  const welcomeMessages = {
    beginner: {
      greeting: "Welcome! Let's Learn Together 🌟",
      subtitle:
        "Explore our friendly tools designed to make learning fun and easy. Pick any feature below to get started!",
    },
    student: {
      greeting: "Welcome to Your Learning Hub",
      subtitle:
        "Access powerful AI tools to enhance your studies. Select a feature below to begin your learning journey.",
    },
    senior: {
      greeting: "AI Learning Platform",
      subtitle:
        "Leverage advanced AI capabilities for productivity and knowledge management. Select a tool to proceed.",
    },
  };

  const message = welcomeMessages[persona];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 22
        }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-purple-500 to-secondary-500 p-8 lg:p-12 text-white"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-3xl lg:text-4xl font-bold">{message.greeting}</h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl leading-relaxed">
            {message.subtitle}
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Feature Cards Grid */}
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
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Explore Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.descriptions[persona]}
              gradient={feature.gradient}
              delay={index * 0.1}
            />
          ))}
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 22,
          delay: 0.2
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { label: "Documents Processed", value: "0" },
          { label: "Flashcards Created", value: "0" },
          { label: "MCQs Generated", value: "0" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 p-6 text-center"
          >
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {stat.value}
            </div>
            <div className="text-sm text-slate-600">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
