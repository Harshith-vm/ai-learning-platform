'use client';

import { useState, useEffect } from 'react';
import { authenticatedRequest } from '@/lib/api';
import { usePersona } from '@/contexts/PersonaContext';
import { User, Mail, BookOpen, Lock } from 'lucide-react';

interface ProfileData {
    email: string;
    persona: string;
    learning_style: string;
    preferred_language: string;
}

export default function ProfilePage() {
    const { refreshPersona } = usePersona();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [persona, setPersona] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Fetch profile data on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const data = await authenticatedRequest<ProfileData>('/auth/profile');
            setProfile(data);
            setPersona(data.persona);
        } catch (error) {
            setErrorMessage('Failed to load profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // Only validate password fields if user is trying to change password
        if (currentPassword || newPassword || confirmPassword) {
            if (!currentPassword) {
                errors.currentPassword = 'Current password is required';
            }
            if (!newPassword) {
                errors.newPassword = 'New password is required';
            } else if (newPassword.length < 8) {
                errors.newPassword = 'New password must be at least 8 characters';
            }
            if (!confirmPassword) {
                errors.confirmPassword = 'Please confirm your new password';
            } else if (newPassword !== confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveChanges = async () => {
        setSuccessMessage('');
        setErrorMessage('');
        setValidationErrors({});

        if (!validateForm()) {
            return;
        }

        setIsSaving(true);

        try {
            // Update persona
            await authenticatedRequest('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify({
                    persona,
                }),
            });

            // Refresh persona in context to update dashboard visibility
            await refreshPersona();

            // If password fields are filled, update password
            if (currentPassword && newPassword) {
                try {
                    await authenticatedRequest('/auth/change-password', {
                        method: 'PUT',
                        body: JSON.stringify({
                            current_password: currentPassword,
                            new_password: newPassword,
                        }),
                    });

                    // Clear password fields on success
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');

                    setSuccessMessage('Profile and password updated successfully');
                } catch (error) {
                    if (error instanceof Error) {
                        setErrorMessage(`Profile updated, but password change failed: ${error.message}`);
                    } else {
                        setErrorMessage('Profile updated, but password change failed');
                    }
                    return;
                }
            } else {
                setSuccessMessage('Profile updated successfully');
            }

            // Refresh profile data
            await fetchProfile();
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('Failed to update profile. Please try again.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
                        <p className="text-gray-600">Manage your account settings</p>
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm">{successMessage}</p>
                    </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">{errorMessage}</p>
                    </div>
                )}

                {/* Profile Form */}
                <div className="space-y-6">
                    {/* Email (Read-only) */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Mail className="w-4 h-4" />
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={profile?.email || ''}
                            readOnly
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    {/* Persona Dropdown */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <BookOpen className="w-4 h-4" />
                            Persona
                        </label>
                        <select
                            value={persona}
                            onChange={(e) => setPersona(e.target.value)}
                            disabled={isSaving}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                        >
                            <option value="beginner">Beginner</option>
                            <option value="student">Student</option>
                            <option value="senior_dev">Senior Developer</option>
                        </select>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
                        <p className="text-sm text-gray-600 mb-4">Leave blank if you don't want to change your password</p>
                    </div>

                    {/* Current Password */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Lock className="w-4 h-4" />
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            disabled={isSaving}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 ${validationErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter current password"
                        />
                        {validationErrors.currentPassword && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.currentPassword}</p>
                        )}
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Lock className="w-4 h-4" />
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={isSaving}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 ${validationErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter new password (min 8 characters)"
                        />
                        {validationErrors.newPassword && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.newPassword}</p>
                        )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Lock className="w-4 h-4" />
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isSaving}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Confirm new password"
                        />
                        {validationErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                                Saving...
                            </span>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
