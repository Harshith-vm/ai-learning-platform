"use client";

import { motion } from "framer-motion";
import { 
  Lightbulb, 
  Sparkles, 
  BarChart3, 
  RefreshCw,
  Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeActionsProps {
  onExplain: () => void;
  onImprove: () => void;
  onAnalyzeComplexity: () => void;
  onRefactor: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function CodeActions({
  onExplain,
  onImprove,
  onAnalyzeComplexity,
  onRefactor,
  loading = false,
  disabled = false,
}: CodeActionsProps) {
  const actions = [
    {
      label: "Explain Code",
      icon: Lightbulb,
      onClick: onExplain,
      gradient: "from-blue-600 to-cyan-600",
      hoverGradient: "from-blue-700 to-cyan-700",
    },
    {
      label: "Improve Code",
      icon: Sparkles,
      onClick: onImprove,
      gradient: "from-purple-600 to-pink-600",
      hoverGradient: "from-purple-700 to-pink-700",
    },
    {
      label: "Analyze Complexity",
      icon: BarChart3,
      onClick: onAnalyzeComplexity,
      gradient: "from-emerald-600 to-teal-600",
      hoverGradient: "from-emerald-700 to-teal-700",
    },
    {
      label: "Refactor Code",
      icon: RefreshCw,
      onClick: onRefactor,
      gradient: "from-orange-600 to-red-600",
      hoverGradient: "from-orange-700 to-red-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 22,
              delay: index * 0.05
            }}
            onClick={action.onClick}
            disabled={disabled || loading}
            className={cn(
              "group relative px-6 py-4 rounded-xl font-medium text-sm transition-all",
              "border border-slate-700/50 hover:border-slate-600/50",
              "bg-gradient-to-br",
              action.gradient,
              "hover:shadow-lg hover:scale-[1.02]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            )}
          >
            <div className="flex items-center justify-center gap-2 text-white">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              )}
              <span>{action.label}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
