"use client";

import { useRef, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
}

export function CodeEditor({ 
  value, 
  onChange, 
  language = "javascript",
  height = "70vh" 
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom dark theme matching platform design
    monaco.editor.defineTheme("ai-learning-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6B7280", fontStyle: "italic" },
        { token: "keyword", foreground: "A78BFA" },
        { token: "string", foreground: "34D399" },
        { token: "number", foreground: "F59E0B" },
        { token: "function", foreground: "60A5FA" },
        { token: "variable", foreground: "E5E7EB" },
        { token: "type", foreground: "C084FC" },
        { token: "operator", foreground: "94A3B8" },
      ],
      colors: {
        "editor.background": "#0f172a",
        "editor.foreground": "#e5e7eb",
        "editor.lineHighlightBackground": "#1e293b",
        "editor.selectionBackground": "#3730a380",
        "editorCursor.foreground": "#a78bfa",
        "editorLineNumber.foreground": "#475569",
        "editorLineNumber.activeForeground": "#94a3b8",
        "editor.inactiveSelectionBackground": "#1e293b",
        "editorIndentGuide.background": "#1e293b",
        "editorIndentGuide.activeBackground": "#334155",
        "editorWhitespace.foreground": "#1e293b",
      },
    });

    // Apply the custom theme
    monaco.editor.setTheme("ai-learning-dark");
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(value) => onChange(value || "")}
        onMount={handleEditorDidMount}
        theme="ai-learning-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          lineNumbers: "on",
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          padding: { top: 16, bottom: 16 },
          lineDecorationsWidth: 8,
          lineNumbersMinChars: 3,
          glyphMargin: false,
          folding: true,
          renderLineHighlight: "all",
          selectOnLineNumbers: true,
          tabSize: 2,
          insertSpaces: true,
          bracketPairColorization: {
            enabled: true,
          },
        }}
      />
    </div>
  );
}
