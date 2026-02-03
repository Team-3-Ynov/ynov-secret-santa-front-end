'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
    id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    createdAt?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                router.push('/auth/login');
                return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const res = await fetch(`${apiUrl}/api/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        router.push('/auth/login');
                        return;
                    }
                    throw new Error('Erreur lors de la récupération du profil');
                }

                const result = await res.json();
                const userData = result.data?.user || result.data || result;
                setUser(userData);
                // Update stored user data
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Une erreur inconnue est survenue');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');

            if (token && refreshToken) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                // Call logout endpoint
                await fetch(`${apiUrl}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refreshToken })
                }).catch(() => {
                    // Ignore errors, we'll clear local storage anyway
                });
            }
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            router.push('/');
        }
    };

    const getInitials = (user: User) => {
        if (user.firstName && user.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        }
        if (user.username) {
            return user.username.substring(0, 2).toUpperCase();
        }
        return user.email.substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-32 bg-linear-to-r from-red-600 to-red-800 relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="h-24 w-24 rounded-full bg-white p-1 shadow-lg">
                                <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-600">
                                    {user && getInitials(user)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-16 pb-6 px-8 flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {user?.username || user?.firstName ? (
                                    <span>{user.firstName} {user.lastName} <span className="text-gray-400 font-normal">(@{user.username})</span></span>
                                ) : (
                                    user?.email
                                )}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Membre depuis le {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '-'}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center px-4 py-2 border border-red-200 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Déconnexion
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column - User Info */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Personal Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Informations Personnelles</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Nom d&apos;utilisateur
                                        </label>
                                        <div className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            {user?.username || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Email
                                        </label>
                                        <div className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            {user?.email || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Prénom
                                        </label>
                                        <div className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            {user?.firstName || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Nom
                                        </label>
                                        <div className="text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            {user?.lastName || '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats & Actions */}
                    <div className="space-y-8">
                        {/* Stats Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900">Statistiques</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center p-4 bg-red-50 rounded-xl border border-red-100">
                                        <span className="text-2xl mr-4">🎄</span>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Événements</p>
                                            <p className="text-xl font-bold text-gray-900">-</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-4 bg-green-50 rounded-xl border border-green-100">
                                        <span className="text-2xl mr-4">🎁</span>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Participations</p>
                                            <p className="text-xl font-bold text-gray-900">-</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900">Navigation</h3>
                            </div>
                            <div className="p-6 space-y-3">
                                <Link
                                    href="/events"
                                    className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <span className="flex items-center">
                                        <span className="mr-3 text-lg">📅</span>
                                        Mes Événements
                                    </span>
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/invitations"
                                    className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <span className="flex items-center">
                                        <span className="mr-3 text-lg">📬</span>
                                        Invitations
                                    </span>
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/secretsanta/create"
                                    className="w-full flex items-center justify-between p-3 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
                                >
                                    <span className="flex items-center">
                                        <span className="mr-3 text-lg">🎅</span>
                                        Créer un Secret Santa
                                    </span>
                                    <svg className="w-5 h-5 text-red-400 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
