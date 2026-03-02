"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  delay = 0,
}: FeatureCardProps) {
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
          "h-full bg-white rounded-xl border border-slate-200 p-6",
          "shadow-sm hover:shadow-lg transition-all duration-300",
          "focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2"
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
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          {description}
        </p>

        {/* CTA Button */}
        <button
          className={cn(
            "w-full px-4 py-2 rounded-lg text-sm font-medium",
            "bg-slate-50 text-slate-700 border border-slate-200",
            "hover:bg-slate-100 hover:border-slate-300",
            "transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
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
