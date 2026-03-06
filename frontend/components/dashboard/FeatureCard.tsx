"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
  route: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  delay = 0,
  route,
}: FeatureCardProps) {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push(route);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group relative"
    >
      <div
        className={cn(
          "h-full bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-700 p-6",
          "shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300",
          "focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900"
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
            "bg-gradient-to-br",
            gradient
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          {description}
        </p>

        {/* CTA Button */}
        <button
          onClick={handleGetStarted}
          className={cn(
            "w-full px-4 py-2 rounded-lg text-sm font-medium",
            "bg-gradient-to-r from-indigo-500 to-purple-600",
            "hover:from-indigo-600 hover:to-purple-700",
            "text-white shadow-lg",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          )}
        >
          Get Started
        </button>

        {/* Hover Accent */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 h-1 rounded-b-xl",
            "bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity",
            gradient
          )}
        />
      </div>
    </motion.div>
  );
}
