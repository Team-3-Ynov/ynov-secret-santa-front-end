'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import InviteDialog from '@/components/InviteDialog';

interface Event {
    id: string;
    title: string;
    description: string;
    eventDate: string;
    budget: number;
    ownerEmail: string;
    createdAt: string;
}

interface Participant {
    id: number;
    username: string;
    email: string;
}

export default function EventPage() {
    const { id } = useParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Non authentifié');
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
                    if (eventRes.status === 404) throw new Error('Évènement non trouvé');
                    throw new Error('Erreur lors du chargement de l\'évènement');
                }

                const eventData = await eventRes.json();
                setEvent(eventData.data);

                if (participantsRes.ok) {
                    const participantsData = await participantsRes.json();
                    setParticipants(participantsData.data || []);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEventData();
        }
    }, [id]);

    const handleCopyLink = () => {
        const url = window.location.href; // Or specific invite link if needed
        navigator.clipboard.writeText(url).then(() => {
            setCopySuccess('Lien copié !');
            setTimeout(() => setCopySuccess(''), 2000);
        });
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
                                    {new Date(event.eventDate).toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {event.budget}€
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">À propos de l'évènement</h2>
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
                                    La liste des participants apparaîtra ici une fois qu'ils auront accepté l'invitation.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {participants.map((participant) => (
                                        <div key={participant.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                <span className="text-red-600 font-semibold text-sm">
                                                    {participant.username.charAt(0).toUpperCase()}
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
                                        <div className="absolute top-full left-0 right-0 mt-2 text-center text-sm text-green-600 font-medium animate-fade-in-up">
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
