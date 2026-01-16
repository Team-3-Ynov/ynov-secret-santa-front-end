'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InvitationsPage() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [, startTransition] = useTransition();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login?redirect=/invitations');
            return;
        }
        startTransition(() => {
            setIsLoggedIn(true);
        });
    }, [router]);

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">📬 Invitations</h1>
                    <p className="mt-2 text-gray-600">Comment rejoindre un Secret Santa</p>
                </div>

                {/* Explication */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">✉️</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Vous avez reçu une invitation ?
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Les invitations aux événements Secret Santa sont envoyées par email.
                            Cliquez sur le lien dans l&apos;email pour rejoindre l&apos;événement.
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <h3 className="font-semibold text-gray-900 mb-4">Comment ça marche ?</h3>
                        <ol className="space-y-4 text-gray-600">
                            <li className="flex items-start">
                                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">1</span>
                                <span>L&apos;organisateur vous envoie une invitation par email</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">2</span>
                                <span>Cliquez sur le lien &quot;Rejoindre&quot; dans l&apos;email</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">3</span>
                                <span>Connectez-vous ou créez un compte si nécessaire</span>
                            </li>
                            <li className="flex items-start">
                                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">4</span>
                                <span>Vous êtes automatiquement ajouté à l&apos;événement !</span>
                            </li>
                        </ol>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Pas encore d&apos;invitation ?</h3>
                        <p className="text-gray-600 mb-4">
                            Demandez à l&apos;organisateur de vous envoyer une invitation,
                            ou créez votre propre événement Secret Santa !
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/events"
                                className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                📋 Voir mes événements
                            </Link>
                            <Link
                                href="/secretsanta/create"
                                className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                🎄 Créer un événement
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Info supplémentaire */}
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">💡</span>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-sm font-medium text-yellow-800">Conseil</h4>
                            <p className="mt-1 text-sm text-yellow-700">
                                Vérifiez votre dossier spam si vous n&apos;avez pas reçu l&apos;email d&apos;invitation.
                                Les emails sont envoyés depuis notre plateforme Secret Santa.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
