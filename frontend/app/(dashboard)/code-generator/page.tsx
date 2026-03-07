"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Loader2, Copy, Download, RefreshCw, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/api";

const LANGUAGES = [
    "Python",
    "JavaScript",
    "TypeScript",
    "Java",
    "C++",
    "C#",
    "Go",
    "Rust",
    "Ruby",
    "PHP",
    "Swift",
    "Kotlin",
];

export default function CodeGeneratorPage() {
    const [problemDescription, setProblemDescription] = useState("");
    const [language, setLanguage] = useState("Python");
    const [constraints, setConstraints] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        // Validation
        if (!problemDescription.trim()) {
            setError("Please enter a problem description");
            return;
        }

        setLoading(true);
        setError("");
        setGeneratedCode("");

        try {
            const data = await apiRequest<{ generated_code: string }>("/code/generate", {
                method: "POST",
                body: JSON.stringify({
                    problem_description: problemDescription,
                    language: language,
                    constraints: constraints.trim() || null,
                }),
            });

            setGeneratedCode(data.generated_code);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to generate code"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleDownload = () => {
        const fileExtensions: Record<string, string> = {
            Python: "py",
            JavaScript: "js",
            TypeScript: "ts",
            Java: "java",
            "C++": "cpp",
            "C#": "cs",
            Go: "go",
            Rust: "rs",
            Ruby: "rb",
            PHP: "php",
            Swift: "swift",
            Kotlin: "kt",
        };

        const extension = fileExtensions[language] || "txt";
        const blob = new Blob([generatedCode], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `generated_code.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRegenerate = () => {
        handleGenerate();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-16 px-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <Code2 className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white">Code Generator</h1>
                    </div>
                    <p className="text-slate-300 max-w-2xl mx-auto">
                        Describe your coding problem and let AI generate the solution for you
                    </p>
                </motion.div>

                {/* Input Form */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-xl p-8 space-y-6"
                >
                    {/* Problem Description */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Problem Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={problemDescription}
                            onChange={(e) => setProblemDescription(e.target.value)}
                            placeholder="Describe the coding problem you want solved. Example: Write a function that finds the longest substring without repeating characters."
                            className="w-full h-40 px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                        />
                    </div>

                    {/* Language Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Programming Language <span className="text-red-400">*</span>
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                {LANGUAGES.map((lang) => (
                                    <option key={lang} value={lang}>
                                        {lang}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Constraints */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Constraints <span className="text-slate-500">(Optional)</span>
                            </label>
                            <textarea
                                value={constraints}
                                onChange={(e) => setConstraints(e.target.value)}
                                placeholder="Optional constraints: Time complexity O(n), Input size up to 10^5, Memory limits"
                                className="w-full h-[52px] px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !problemDescription.trim()}
                        className="w-full px-8 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating Code...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generate Code
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Generated Code Output */}
                {generatedCode && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Code2 className="w-5 h-5 text-orange-400" />
                                Generated Code
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all text-sm font-medium flex items-center gap-2"
                                >
                                    <Copy className="w-4 h-4" />
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all text-sm font-medium flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                                <button
                                    onClick={handleRegenerate}
                                    disabled={loading}
                                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                    Regenerate
                                </button>
                            </div>
                        </div>

                        {/* Code Block */}
                        <div className="p-6 bg-slate-950/50">
                            <pre className="text-sm text-slate-200 overflow-x-auto">
                                <code>{generatedCode}</code>
                            </pre>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
