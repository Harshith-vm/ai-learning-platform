"use client";

import { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">{children}</div>
    </main>
  );
}
