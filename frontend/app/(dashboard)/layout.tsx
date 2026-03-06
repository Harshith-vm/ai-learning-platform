"use client";

import { PersonaProvider } from "@/contexts/PersonaContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DocumentProvider } from "@/contexts/DocumentContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MainContent } from "@/components/layout/MainContent";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/upload": "Upload Document",
  "/summarize": "Summarize Documents",
  "/flashcards": "Flashcards",
  "/mcqs": "Generate MCQs",
  "/code": "Code Intelligence",
  "/simplify": "Simplify Concepts",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Handle dynamic routes
  let title = "Dashboard";
  if (pathname.startsWith("/summarize/")) {
    title = "Document Summary";
  } else if (pathname.startsWith("/flashcards/")) {
    title = "Flashcards";
  } else if (pathname.startsWith("/mcqs/")) {
    title = "MCQs";
  } else if (pathname.startsWith("/learning-gain/")) {
    title = "Learning Gain";
  } else {
    title = pageTitles[pathname] || "Dashboard";
  }

  return (
    <ThemeProvider>
      <PersonaProvider>
        <DocumentProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1">
              <Header title={title} />
              <MainContent>{children}</MainContent>
            </div>
          </div>
        </DocumentProvider>
      </PersonaProvider>
    </ThemeProvider>
  );
}
