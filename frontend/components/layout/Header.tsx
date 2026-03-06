"use client";

import { usePersona } from "@/contexts/PersonaContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ChevronDown, User, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { persona, setPersona } = usePersona();
  const { theme, toggleTheme } = useTheme();

  const personaLabels: Record<typeof persona, string> = {
    beginner: "Beginner",
    student: "Student",
    senior: "Senior",
  };

  const personaColors: Record<typeof persona, string> = {
    beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
    student: "bg-primary-100 text-primary-700 border-primary-200",
    senior: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <header className="sticky top-0 z-20 bg-background border-b border-border shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Page Title */}
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-card hover:bg-accent border border-border transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-foreground" />
            ) : (
              <Sun className="w-5 h-5 text-foreground" />
            )}
          </button>

          {/* Persona Indicator */}
          <div className="relative group">
            <button
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                personaColors[persona]
              )}
              aria-label="Change persona"
            >
              <span>{personaLabels[persona]}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-40 bg-card rounded-lg shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {(["beginner", "student", "senior"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPersona(p)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm hover:bg-accent first:rounded-t-lg last:rounded-b-lg transition-colors text-foreground",
                    persona === p && "bg-accent font-medium"
                  )}
                >
                  {personaLabels[p]}
                </button>
              ))}
            </div>
          </div>

          {/* User Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
