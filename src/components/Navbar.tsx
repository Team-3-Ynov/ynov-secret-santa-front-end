'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [, startTransition] = useTransition();

    useEffect(() => {
        // Vérifier si l'utilisateur est connecté
        const token = localStorage.getItem('token');
        startTransition(() => {
            setIsLoggedIn(!!token);
        });
    }, [pathname]); // Re-vérifier à chaque changement de page

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        router.push('/');
    };

    const isActive = (path: string) => {
        return pathname === path ? 'text-red-600 font-semibold' : 'text-gray-600 hover:text-red-600';
    };

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="shrink-0 flex items-center">
                            <Link href="/" className="text-xl font-bold text-red-600">
                                🎅 Secret Santa
                            </Link>
                        </div>
                        {isLoggedIn && (
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    href="/secretsanta/create"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium ${isActive('/secretsanta/create')}`}
                                >
                                    Créer un événement
                                </Link>
                                <Link
                                    href="/events"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium ${isActive('/events')}`}
                                >
                                    Mes Évènements
                                </Link>
                                <Link
                                    href="/invitations"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium ${isActive('/invitations')}`}
                                >
                                    📬 Invitations
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
                        {isLoggedIn ? (
                            <>
                                <NotificationBell />
                                <Link
                                    href="/profile"
                                    className={`text-sm font-medium ${isActive('/profile')}`}
                                >
                                    👤 Profil
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className={`text-sm font-medium ${isActive('/auth/login')}`}
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Inscription
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
