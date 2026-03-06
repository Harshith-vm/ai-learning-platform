"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authenticatedRequest } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

export type PersonaType = "beginner" | "student" | "senior";

interface PersonaConfig {
  tone: string;
  density: "spacious" | "balanced" | "compact";
  defaultExpansion: boolean;
}

interface PersonaContextType {
  persona: PersonaType;
  setPersona: (persona: PersonaType) => void;
  config: PersonaConfig;
  isLoading: boolean;
  refreshPersona: () => Promise<void>;
}

const personaConfigs: Record<PersonaType, PersonaConfig> = {
  beginner: {
    tone: "friendly",
    density: "spacious",
    defaultExpansion: true,
  },
  student: {
    tone: "academic",
    density: "balanced",
    defaultExpansion: true,
  },
  senior: {
    tone: "professional",
    density: "compact",
    defaultExpansion: false,
  },
};

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

/**
 * Map backend persona values to frontend PersonaType
 */
const mapBackendPersona = (backendPersona: string): PersonaType => {
  if (backendPersona === "senior_dev") return "senior";
  if (backendPersona === "beginner") return "beginner";
  return "student"; // default
};

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaType>("student");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch persona from backend on mount
  const fetchPersona = async () => {
    if (!isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    try {
      const profile = await authenticatedRequest<{ persona: string }>("/auth/profile");
      const mappedPersona = mapBackendPersona(profile.persona);
      setPersonaState(mappedPersona);
    } catch (error) {
      console.error("Failed to fetch persona:", error);
      // Keep default persona on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPersona();
  }, []);

  // Custom setter that updates both local state and context
  const setPersona = (newPersona: PersonaType) => {
    setPersonaState(newPersona);
  };

  // Function to refresh persona from backend
  const refreshPersona = async () => {
    await fetchPersona();
  };

  const value = {
    persona,
    setPersona,
    config: personaConfigs[persona],
    isLoading,
    refreshPersona,
  };

  return (
    <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error("usePersona must be used within a PersonaProvider");
  }
  return context;
}
