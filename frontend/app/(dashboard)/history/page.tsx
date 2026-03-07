'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authenticatedRequest } from '@/lib/api';
import { History, FileText, HelpCircle, Code, Trash2, Eye, Calendar } from 'lucide-react';

type TabType = 'summaries' | 'mcqs' | 'code-analysis';

interface Summary {
    id: number;
    document_id: string;
    title: string;
    summary_text: string;
    created_at: string;
}

interface MCQ {
    id: number;
    document_id: number;
    test_type: string;
    score: number;
    total_questions: number;
    created_at: string;
}

interface CodeAnalysis {
    id: number;
    analysis_type: string;
    language: string;
    session_id: string;
    input_code: string;
    created_at: string;
}

export default function HistoryPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('summaries');
    const [summaries, setSummaries] = useState<Summary[]>([]);
    const [mcqs, setMcqs] = useState<MCQ[]>([]);
    const [codeAnalyses, setCodeAnalyses] = useState<CodeAnalysis[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: number; type: TabType } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        setError('');

        try {
            if (activeTab === 'summaries') {
                const data = await authenticatedRequest<Summary[]>('/history/document-summaries');
                setSummaries(data);
            } else if (activeTab === 'mcqs') {
                const data = await authenticatedRequest<MCQ[]>('/history/mcqs');
                setMcqs(data);
            } else if (activeTab === 'code-analysis') {
                const data = await authenticatedRequest<CodeAnalysis[]>('/history/code-analyses');
                setCodeAnalyses(data);
            }
        } catch (err) {
            setError('Failed to load history. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number, type: TabType) => {
        setItemToDelete({ id, type });
        setShowDeleteModal(true);
        setDeleteError('');
    };

    const handleView = (id: number, type: TabType) => {
        if (type === 'code-analysis') {
            router.push(`/history/code-analysis/${id}`);
        } else if (type === 'summaries') {
            router.push(`/history/document-summary/${id}`);
        }
        // Add handlers for other types if needed in the future
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        setDeleteError('');

        try {
            const endpoint = itemToDelete.type === 'code-analysis' ? 'code-analyses' : itemToDelete.type === 'summaries' ? 'document-summaries' : itemToDelete.type;
            await authenticatedRequest(`/history/${endpoint}/${itemToDelete.id}`, {
                method: 'DELETE',
            });

            // Remove from UI
            if (itemToDelete.type === 'summaries') {
                setSummaries(summaries.filter((item) => item.id !== itemToDelete.id));
            } else if (itemToDelete.type === 'mcqs') {
                setMcqs(mcqs.filter((item) => item.id !== itemToDelete.id));
            } else if (itemToDelete.type === 'code-analysis') {
                setCodeAnalyses(codeAnalyses.filter((item) => item.id !== itemToDelete.id));
            }

            // Close modal
            setShowDeleteModal(false);
            setItemToDelete(null);
        } catch (err) {
            setDeleteError('Failed to delete history item. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
        setDeleteError('');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const tabs = [
        { id: 'summaries' as TabType, label: 'Summaries', icon: FileText },
        { id: 'mcqs' as TabType, label: 'MCQ Sessions', icon: HelpCircle },
        { id: 'code-analysis' as TabType, label: 'Code Analysis', icon: Code },
    ];

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <History className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">History</h1>
                    <p className="text-gray-600">View your past activities</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="flex border-b border-gray-200">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === tab.id
                                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading history...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Summaries Tab */}
                    {activeTab === 'summaries' && (
                        <div className="space-y-4">
                            {summaries.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">No history found.</p>
                                </div>
                            ) : (
                                summaries.map((summary) => (
                                    <div
                                        key={summary.id}
                                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {summary.title || 'Document Summary'}
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-2">
                                                    Document ID: <span className="font-mono text-xs">{summary.document_id}</span>
                                                </p>
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                    {summary.summary_text}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(summary.created_at)}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => handleView(summary.id, 'summaries')}
                                                    className="flex items-center gap-1 px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(summary.id, 'summaries')}
                                                    className="flex items-center gap-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* MCQs Tab */}
                    {activeTab === 'mcqs' && (
                        <div className="space-y-4">
                            {mcqs.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                    <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">No history found.</p>
                                </div>
                            ) : (
                                mcqs.map((mcq) => (
                                    <div
                                        key={mcq.id}
                                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {mcq.test_type} Test
                                                </h3>
                                                <div className="space-y-1 mb-3">
                                                    <p className="text-sm text-gray-600">
                                                        Score: <span className="font-semibold text-indigo-600">{mcq.score}</span> / {mcq.total_questions}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Total Questions: {mcq.total_questions}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(mcq.created_at)}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    className="flex items-center gap-1 px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(mcq.id, 'mcqs')}
                                                    className="flex items-center gap-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Code Analysis Tab */}
                    {activeTab === 'code-analysis' && (
                        <div className="space-y-4">
                            {codeAnalyses.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                    <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">No history found.</p>
                                </div>
                            ) : (
                                codeAnalyses.map((analysis) => (
                                    <div
                                        key={analysis.id}
                                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {analysis.analysis_type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                                </h3>
                                                <div className="space-y-1 mb-3">
                                                    <p className="text-sm text-gray-600">
                                                        Language: <span className="font-semibold text-indigo-600">{analysis.language}</span>
                                                    </p>
                                                    <p className="text-sm text-gray-600 line-clamp-1">
                                                        Code: {analysis.input_code}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(analysis.created_at)}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => handleView(analysis.id, 'code-analysis')}
                                                    className="flex items-center gap-1 px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(analysis.id, 'code-analysis')}
                                                    className="flex items-center gap-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Confirm Delete</h3>
                        </div>

                        {/* Modal Body */}
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this history item? This action cannot be undone.
                        </p>

                        {/* Error Message */}
                        {deleteError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800 text-sm">{deleteError}</p>
                            </div>
                        )}

                        {/* Modal Actions */}
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={cancelDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <svg
                                            className="animate-spin h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
