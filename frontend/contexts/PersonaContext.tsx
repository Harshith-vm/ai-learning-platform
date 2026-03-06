"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

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

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<PersonaType>("student");

  const value = {
    persona,
    setPersona,
    config: personaConfigs[persona],
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
