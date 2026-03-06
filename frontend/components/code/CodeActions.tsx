"use client";

import { motion } from "framer-motion";
import {
  Lightbulb,
  Sparkles,
  BarChart3,
  RefreshCw,
  Loader2,
  ListOrdered,
  Building2,
  GitCompare,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeActionsProps {
  onExplain: () => void;
  onImprove: () => void;
  onAnalyzeComplexity: () => void;
  onRefactor: () => void;
  onStepwise: () => void;
  onArchitecture: () => void;
  onRefactorImpact: () => void;
  onQuality: () => void;
  loading?: boolean;
  disabled?: boolean;
  refactorComplete?: boolean;
}

export function CodeActions({
  onExplain,
  onImprove,
  onAnalyzeComplexity,
  onRefactor,
  onStepwise,
  onArchitecture,
  onRefactorImpact,
  onQuality,
  loading = false,
  disabled = false,
  refactorComplete = false,
}: CodeActionsProps) {
  const actions = [
    {
      label: "Explain Code",
      icon: Lightbulb,
      onClick: onExplain,
      gradient: "from-blue-600 to-cyan-600",
      disabled: false,
    },
    {
      label: "Improve Code",
      icon: Sparkles,
      onClick: onImprove,
      gradient: "from-purple-600 to-pink-600",
      disabled: false,
    },
    {
      label: "Analyze Complexity",
      icon: BarChart3,
      onClick: onAnalyzeComplexity,
      gradient: "from-emerald-600 to-teal-600",
      disabled: false,
    },
    {
      label: "Refactor Code",
      icon: RefreshCw,
      onClick: onRefactor,
      gradient: "from-orange-600 to-red-600",
      disabled: false,
    },
    {
      label: "Stepwise Explanation",
      icon: ListOrdered,
      onClick: onStepwise,
      gradient: "from-indigo-600 to-blue-600",
      disabled: false,
    },
    {
      label: "Architecture Analysis",
      icon: Building2,
      onClick: onArchitecture,
      gradient: "from-violet-600 to-purple-600",
      disabled: false,
    },
    {
      label: "Refactor Impact",
      icon: GitCompare,
      onClick: onRefactorImpact,
      gradient: "from-amber-600 to-orange-600",
      disabled: false,
    },
    {
      label: "Code Quality",
      icon: Award,
      onClick: onQuality,
      gradient: "from-green-600 to-emerald-600",
      disabled: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        const isDisabled = disabled || loading || action.disabled;

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
            disabled={isDisabled}
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
