'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authenticatedRequest } from '@/lib/api';
import { Code, ArrowLeft, Calendar, FileCode } from 'lucide-react';

interface CodeAnalysisDetail {
    id: number;
    analysis_type: string;
    language: string;
    session_id: string;
    input_code: string;
    result_output: string;
    created_at: string;
}

export default function CodeAnalysisDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [analysis, setAnalysis] = useState<CodeAnalysisDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalysis();
    }, [id]);

    const fetchAnalysis = async () => {
        setIsLoading(true);
        setError('');

        try {
            const data = await authenticatedRequest<CodeAnalysisDetail>(
                `/history/code-analyses/${id}`
            );
            setAnalysis(data);
        } catch (err) {
            setError('Failed to load code analysis. Please try again.');
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

    const formatAnalysisType = (type: string) => {
        return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading code analysis...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !analysis) {
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
                    <p className="text-red-800">{error || 'Code analysis not found'}</p>
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
                        <Code className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {formatAnalysisType(analysis.analysis_type)}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <FileCode className="w-4 h-4" />
                                <span>Language: <span className="font-semibold text-indigo-600">{analysis.language}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(analysis.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Input Code Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Input Code</h2>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap break-words">
                        <code>{analysis.input_code}</code>
                    </pre>
                </div>
            </div>

            {/* Result Output Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Result</h2>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <pre className="text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap break-words">
                        <code>{analysis.result_output}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
}
