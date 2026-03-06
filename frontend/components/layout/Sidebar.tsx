"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Code2,
  Lightbulb,
  Menu,
  X,
  Sparkles,
  Upload,
  TrendingUp,
  Layers,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload", href: "/upload", icon: Upload },
  { label: "Summarize", href: "/summarize", icon: FileText },
  { label: "Flashcards", href: "/flashcards", icon: Layers },
  { label: "MCQs", href: "/mcqs", icon: HelpCircle },
  { label: "Learning Gain", href: "/learning-gain", icon: TrendingUp },
  { label: "Code", href: "/code", icon: Code2 },
  { label: "Code Generator", href: "/code-generator", icon: Wand2 },
  { label: "Simplify", href: "/simplify", icon: Lightbulb },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 0 : 256,
          x: isCollapsed ? -256 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-50",
          "lg:relative lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full w-64">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-slate-900">
                AI Learn
              </span>
            </Link>
            <button
              onClick={() => setIsCollapsed(true)}
              className="lg:hidden p-1 hover:bg-slate-100 rounded"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1" role="navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                    isActive
                      ? "bg-primary-50 text-primary-700 border border-primary-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 text-center">
              v1.0.0 • AI Learning Platform
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(false)}
        className={cn(
          "fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-lg border border-slate-200",
          "lg:hidden",
          !isCollapsed && "hidden"
        )}
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
}
