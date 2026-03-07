'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authenticatedRequest } from '@/lib/api';
import { FileText, ArrowLeft, Calendar, Tag } from 'lucide-react';

interface DocumentSummaryDetail {
    id: number;
    document_id: string;
    title: string;
    summary_text: string;
    main_themes: string[] | null;
    created_at: string;
}

export default function DocumentSummaryDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [summary, setSummary] = useState<DocumentSummaryDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSummary();
    }, [id]);

    const fetchSummary = async () => {
        setIsLoading(true);
        setError('');

        try {
            const data = await authenticatedRequest<DocumentSummaryDetail>(
                `/history/document-summaries/${id}`
            );
            setSummary(data);
        } catch (err) {
            setError('Failed to load document summary. Please try again.');
        } finally {
            setIsLoading(false);
        }
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

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading document summary...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !summary) {
        return (
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => router.push('/history')}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to History
                </button>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-800">{error || 'Document summary not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => router.push('/history')}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to History
            </button>

            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {summary.title}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">Document ID:</span>
                                <span className="font-mono text-xs">{summary.document_id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(summary.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Themes Section */}
            {summary.main_themes && summary.main_themes.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-indigo-600" />
                        Main Themes
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {summary.main_themes.map((theme, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                            >
                                {theme}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Summary Text Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
                <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {summary.summary_text}
                    </p>
                </div>
            </div>
        </div>
    );
}
