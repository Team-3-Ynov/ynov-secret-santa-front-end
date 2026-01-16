'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import InviteDialog from '@/components/InviteDialog';

interface Event {
    id: string;
    title: string;
    description: string;
    eventDate: string;
    budget: number;
    ownerId: string;
    createdAt: string;
    drawDone?: boolean;
}

interface Participant {
    id: number;
    username: string;
    email: string;
}

interface Assignment {
    recipientId: string;
    recipientUsername: string;
    recipientEmail: string;
}

export default function EventPage() {
    const { id } = useParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
    const [drawLoading, setDrawLoading] = useState(false);
    const [drawError, setDrawError] = useState('');
    const [drawSuccess, setDrawSuccess] = useState('');

    const fetchEventData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Non authentifié');
                setLoading(false);
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            // Fetch event and participants in parallel
            const [eventRes, participantsRes] = await Promise.all([
                fetch(`${apiUrl}/api/events/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${apiUrl}/api/events/${id}/participants`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (!eventRes.ok) {
                if (eventRes.status === 404) {
                    setError('Évènement non trouvé');
                } else {
                    setError('Erreur lors du chargement de l\'évènement');
                }
                setLoading(false);
                return;
            }

            const eventResult = await eventRes.json();
            const eventData = eventResult.data || eventResult;
            setEvent(eventData);

            if (participantsRes.ok) {
                const participantsResult = await participantsRes.json();
                setParticipants(participantsResult.data || participantsResult || []);
            }

            // Fetch my assignment if draw is done
            if (eventData.drawDone) {
                try {
                    const assignmentRes = await fetch(`${apiUrl}/api/events/${id}/my-assignment`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (assignmentRes.ok) {
                        const assignmentResult = await assignmentRes.json();
                        setAssignment(assignmentResult.data || assignmentResult);
                    }
                } catch {
                    // Assignment fetch failed, not critical
                }
            }
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

    useEffect(() => {
        if (id) {
            fetchEventData();
        }
    }, [id]);

    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setCopySuccess('Lien copié !');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    const handleDraw = async () => {
        setDrawLoading(true);
        setDrawError('');
        setDrawSuccess('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setDrawError('Non authentifié');
                return;
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/api/events/${id}/draw`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erreur lors du tirage au sort');
            }

            setDrawSuccess('🎉 Tirage au sort effectué avec succès !');
            // Refresh event data to show assignment
            fetchEventData();
        } catch (err) {
            if (err instanceof Error) {
                setDrawError(err.message);
            } else {
                setDrawError('Une erreur inconnue est survenue');
            }
        } finally {
            setDrawLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Oups !</h2>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!event) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="relative h-48 bg-gradient-to-r from-red-600 to-red-500">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute bottom-0 left-0 p-8 text-white">
                            <h1 className="text-4xl font-bold tracking-tight mb-2">{event.title}</h1>
                            <div className="flex items-center space-x-4 text-red-50">
                                <span className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {new Date(event.eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                {event.budget && (
                                    <span className="flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {event.budget}€
                                    </span>
                                )}
                                {event.drawDone && (
                                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                        ✓ Tirage effectué
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assignment Section - Show if draw is done */}
                {assignment && (
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-8 text-white">
                        <div className="text-center">
                            <span className="text-5xl mb-4 block">🎁</span>
                            <h2 className="text-2xl font-bold mb-2">Votre personne à gâter</h2>
                            <p className="text-green-100 mb-4">Vous devez offrir un cadeau à :</p>
                            <div className="bg-white/20 rounded-xl p-6 inline-block">
                                <p className="text-3xl font-bold">{assignment.recipientUsername}</p>
                                <p className="text-green-100">{assignment.recipientEmail}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">À propos de l&apos;évènement</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {event.description || "Aucune description fournie pour cet évènement."}
                            </p>
                        </div>

                        {/* Participants Section */}
                        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Participants ({participants.length})
                            </h2>
                            {participants.length === 0 ? (
                                <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center text-gray-500">
                                    La liste des participants apparaîtra ici une fois qu&apos;ils auront accepté l&apos;invitation.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {participants.map((participant) => (
                                        <div key={participant.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                <span className="text-red-600 font-semibold text-sm">
                                                    {participant.username?.charAt(0).toUpperCase() || '?'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{participant.username}</p>
                                                <p className="text-sm text-gray-500">{participant.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar / Actions */}
                    <div className="space-y-6">
                        {/* Section Tirage au sort */}
                        {!event.drawDone && participants.length >= 2 && (
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎲 Tirage au sort</h3>
                                {drawError && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                        {drawError}
                                    </div>
                                )}
                                {drawSuccess && (
                                    <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                                        {drawSuccess}
                                    </div>
                                )}
                                <p className="text-sm text-gray-500 mb-4">
                                    {participants.length} participants prêts. Lancez le tirage pour assigner les cadeaux !
                                </p>
                                <button
                                    onClick={handleDraw}
                                    disabled={drawLoading}
                                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {drawLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    ) : (
                                        <span className="mr-2">🎲</span>
                                    )}
                                    Lancer le tirage au sort
                                </button>
                            </div>
                        )}

                        {/* Section Modifier l'événement */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gérer l&apos;événement</h3>
                            <Link
                                href={`/secretsanta/edit/${id}`}
                                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-sm"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modifier l&apos;événement
                            </Link>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inviter des amis</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowInviteDialog(true)}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-sm"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Envoyer une invitation
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={handleCopyLink}
                                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copier le lien
                                    </button>
                                    {copySuccess && (
                                        <div className="absolute top-full left-0 right-0 mt-2 text-center text-sm text-green-600 font-medium">
                                            {copySuccess}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <InviteDialog
                isOpen={showInviteDialog}
                onClose={() => setShowInviteDialog(false)}
                eventId={id as string}
            />
        </div>
    );
}
