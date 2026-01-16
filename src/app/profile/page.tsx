'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
                const userData = result.data || result;
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

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-red-50 to-green-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-red-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Header du profil */}
                    <div className="bg-linear-to-r from-red-600 to-red-700 px-6 py-8">
                        <div className="flex items-center justify-center">
                            <div className="bg-white rounded-full p-4 shadow-lg">
                                <span className="text-5xl">👤</span>
                            </div>
                        </div>
                        <h1 className="mt-4 text-center text-2xl font-bold text-white">
                            Mon Profil
                        </h1>
                    </div>

                    {/* Contenu du profil */}
                    <div className="px-6 py-8">
                        {error && (
                            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        {user && (
                            <div className="space-y-6">
                                {user.username && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Nom d&apos;utilisateur
                                        </label>
                                        <p className="text-lg font-medium text-gray-900">
                                            {user.username}
                                        </p>
                                    </div>
                                )}

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Email
                                    </label>
                                    <p className="text-lg font-medium text-gray-900">
                                        {user.email}
                                    </p>
                                </div>

                                {user.firstName && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Prénom
                                        </label>
                                        <p className="text-lg font-medium text-gray-900">
                                            {user.firstName}
                                        </p>
                                    </div>
                                )}

                                {user.lastName && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Nom
                                        </label>
                                        <p className="text-lg font-medium text-gray-900">
                                            {user.lastName}
                                        </p>
                                    </div>
                                )}

                                {user.createdAt && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Membre depuis
                                        </label>
                                        <p className="text-lg font-medium text-gray-900">
                                            {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => router.push('/events')}
                                    className="flex-1 inline-flex justify-center items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                >
                                    🎁 Mes Événements
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                >
                                    🚪 Déconnexion
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats rapides */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-md p-6 text-center">
                        <span className="text-3xl">🎄</span>
                        <p className="mt-2 text-2xl font-bold text-gray-900">-</p>
                        <p className="text-sm text-gray-500">Événements créés</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 text-center">
                        <span className="text-3xl">🎁</span>
                        <p className="mt-2 text-2xl font-bold text-gray-900">-</p>
                        <p className="text-sm text-gray-500">Participations</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 text-center">
                        <span className="text-3xl">❄️</span>
                        <p className="mt-2 text-2xl font-bold text-gray-900">-</p>
                        <p className="text-sm text-gray-500">Cadeaux offerts</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
