"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SummaryData {
    title: string;
    summary: string;
    main_themes: string[];
    key_points?: string[];
}

interface Flashcard {
    question: string;
    answer: string;
}

interface MCQOptionData {
    option: string;
    is_correct: boolean;
}

interface MCQ {
    question: string;
    options: MCQOptionData[];
    difficulty: "easy" | "medium" | "hard";
    explanation: string;
}

interface DocumentContextType {
    documentId: string | null;
    documentName: string | null;
    summary: SummaryData | null;
    flashcards: Flashcard[] | null;
    mcqs: MCQ[] | null;
    learningGainState: {
        preTestCompleted: boolean;
        preTestScore: number | null;
        postTestCompleted: boolean;
        postTestScore: number | null;
        learningGain: number | null;
    };
    setDocumentId: (id: string | null) => void;
    setDocumentName: (name: string | null) => void;
    setSummary: (summary: SummaryData | null) => void;
    setFlashcards: (flashcards: Flashcard[] | null) => void;
    setMcqs: (mcqs: MCQ[] | null) => void;
    setLearningGainState: (state: Partial<DocumentContextType['learningGainState']>) => void;
    clearDocument: () => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
    const [documentId, setDocumentIdState] = useState<string | null>(null);
    const [documentName, setDocumentNameState] = useState<string | null>(null);
    const [summary, setSummaryState] = useState<SummaryData | null>(null);
    const [flashcards, setFlashcardsState] = useState<Flashcard[] | null>(null);
    const [mcqs, setMcqsState] = useState<MCQ[] | null>(null);
    const [learningGainState, setLearningGainStateInternal] = useState({
        preTestCompleted: false,
        preTestScore: null as number | null,
        postTestCompleted: false,
        postTestScore: null as number | null,
        learningGain: null as number | null,
    });
    const [isHydrated, setIsHydrated] = useState(false);

    // Load from sessionStorage on mount (client-side only)
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                // Version check - clear old data if version mismatch
                const storageVersion = sessionStorage.getItem("storageVersion");
                const CURRENT_VERSION = "3.0";

                if (storageVersion !== CURRENT_VERSION) {
                    console.log("Storage version mismatch, clearing old data");
                    sessionStorage.clear();
                    sessionStorage.setItem("storageVersion", CURRENT_VERSION);
                    setIsHydrated(true);
                    return;
                }

                const savedDocumentId = sessionStorage.getItem("documentId");
                const savedDocumentName = sessionStorage.getItem("documentName");
                const savedSummary = sessionStorage.getItem("summary");
                const savedFlashcards = sessionStorage.getItem("flashcards");
                const savedMcqs = sessionStorage.getItem("mcqs");
                const savedLearningGainState = sessionStorage.getItem("learningGainState");

                if (savedDocumentId) setDocumentIdState(savedDocumentId);
                if (savedDocumentName) setDocumentNameState(savedDocumentName);
                if (savedSummary) {
                    try {
                        setSummaryState(JSON.parse(savedSummary));
                    } catch (e) {
                        console.error("Failed to parse summary from sessionStorage", e);
                    }
                }
                if (savedFlashcards) {
                    try {
                        setFlashcardsState(JSON.parse(savedFlashcards));
                    } catch (e) {
                        console.error("Failed to parse flashcards from sessionStorage", e);
                    }
                }
                if (savedMcqs) {
                    try {
                        setMcqsState(JSON.parse(savedMcqs));
                    } catch (e) {
                        console.error("Failed to parse mcqs from sessionStorage", e);
                    }
                }
                if (savedLearningGainState) {
                    try {
                        setLearningGainStateInternal(JSON.parse(savedLearningGainState));
                    } catch (e) {
                        console.error("Failed to parse learningGainState from sessionStorage", e);
                    }
                }
            } catch (error) {
                console.error("Error loading from sessionStorage:", error);
            } finally {
                setIsHydrated(true);
            }
        }
    }, []);

    // Wrapper functions that also persist to sessionStorage
    const setDocumentId = (id: string | null) => {
        setDocumentIdState(id);
        if (typeof window !== "undefined") {
            try {
                if (id) {
                    sessionStorage.setItem("documentId", id);
                } else {
                    sessionStorage.removeItem("documentId");
                }
            } catch (error) {
                console.error("Error saving documentId to sessionStorage:", error);
            }
        }
    };

    const setDocumentName = (name: string | null) => {
        setDocumentNameState(name);
        if (typeof window !== "undefined") {
            try {
                if (name) {
                    sessionStorage.setItem("documentName", name);
                } else {
                    sessionStorage.removeItem("documentName");
                }
            } catch (error) {
                console.error("Error saving documentName to sessionStorage:", error);
            }
        }
    };

    const setSummary = (summaryData: SummaryData | null) => {
        setSummaryState(summaryData);
        if (typeof window !== "undefined") {
            try {
                if (summaryData) {
                    sessionStorage.setItem("summary", JSON.stringify(summaryData));
                } else {
                    sessionStorage.removeItem("summary");
                }
            } catch (error) {
                console.error("Error saving summary to sessionStorage:", error);
            }
        }
    };

    const setFlashcards = (flashcardsData: Flashcard[] | null) => {
        setFlashcardsState(flashcardsData);
        if (typeof window !== "undefined") {
            try {
                if (flashcardsData) {
                    sessionStorage.setItem("flashcards", JSON.stringify(flashcardsData));
                } else {
                    sessionStorage.removeItem("flashcards");
                }
            } catch (error) {
                console.error("Error saving flashcards to sessionStorage:", error);
            }
        }
    };

    const setMcqs = (mcqsData: MCQ[] | null) => {
        setMcqsState(mcqsData);
        if (typeof window !== "undefined") {
            try {
                if (mcqsData) {
                    sessionStorage.setItem("mcqs", JSON.stringify(mcqsData));
                } else {
                    sessionStorage.removeItem("mcqs");
                }
            } catch (error) {
                console.error("Error saving mcqs to sessionStorage:", error);
            }
        }
    };

    const setLearningGainState = (state: Partial<typeof learningGainState>) => {
        const newState = { ...learningGainState, ...state };
        setLearningGainStateInternal(newState);
        if (typeof window !== "undefined") {
            try {
                sessionStorage.setItem("learningGainState", JSON.stringify(newState));
            } catch (error) {
                console.error("Error saving learningGainState to sessionStorage:", error);
            }
        }
    };

    const clearDocument = () => {
        setDocumentIdState(null);
        setDocumentNameState(null);
        setSummaryState(null);
        setFlashcardsState(null);
        setMcqsState(null);
        setLearningGainStateInternal({
            preTestCompleted: false,
            preTestScore: null,
            postTestCompleted: false,
            postTestScore: null,
            learningGain: null,
        });

        if (typeof window !== "undefined") {
            try {
                sessionStorage.removeItem("documentId");
                sessionStorage.removeItem("documentName");
                sessionStorage.removeItem("summary");
                sessionStorage.removeItem("flashcards");
                sessionStorage.removeItem("mcqs");
                sessionStorage.removeItem("learningGainState");
            } catch (error) {
                console.error("Error clearing sessionStorage:", error);
            }
        }
    };

    return (
        <DocumentContext.Provider
            value={{
                documentId,
                documentName,
                summary,
                flashcards,
                mcqs,
                learningGainState,
                setDocumentId,
                setDocumentName,
                setSummary,
                setFlashcards,
                setMcqs,
                setLearningGainState,
                clearDocument,
            }}
        >
            {children}
        </DocumentContext.Provider>
    );
}

export function useDocument() {
    const context = useContext(DocumentContext);
    if (context === undefined) {
        throw new Error("useDocument must be used within a DocumentProvider");
    }
    return context;
}
