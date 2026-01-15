'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateSecretSantaPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [budget, setBudget] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Convert date to ISO string format for the backend
    const eventData = {
      title,
      description,
      eventDate: eventDate ? new Date(eventDate).toISOString() : '',
      budget: budget ? Number(budget) : undefined,
      ownerEmail,
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(eventData),
      });

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse JSON response:", responseText);
        throw new Error("The server returned an invalid response. Check the console for more details.");
      }


      if (!response.ok) {
        // Assuming the backend returns a message or an array of messages
        const errorMessage = Array.isArray(result.message) ? result.message.join(', ') : result.message || 'An unknown error occurred.';
        setError(errorMessage);
      } else {
        // Redirect to edit page where they can now invite participants
        const eventId = result.data?.id;
        if (eventId) {
          router.push(`/secretsanta/edit/${eventId}`);
        } else {
          setSuccess('Event created successfully! You can now edit it and invite participants.');
        }
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600">Create a Secret Santa</h1>
          <p className="mt-2 text-gray-600">Let the festive fun begin!</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && <div className="p-4 text-green-800 bg-green-100 border border-green-200 rounded-md">{success}</div>}
          {error && <div className="p-4 text-red-800 bg-red-100 border border-red-200 rounded-md">{error}</div>}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Event Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              placeholder="e.g., Office Christmas Party"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              placeholder="e.g., A little get-together to celebrate the holidays."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="eventDate" className="text-sm font-medium text-gray-700">
                Event Date
              </label>
              <input
                type="date"
                id="eventDate"
                name="eventDate"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="budget" className="text-sm font-medium text-gray-700">
                Budget (€, Optional)
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                placeholder="e.g., 20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="ownerEmail" className="text-sm font-medium text-gray-700">
              Your Email (as Organizer)
            </label>
            <input
              type="email"
              id="ownerEmail"
              name="ownerEmail"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Event & Invite Participants'}
          </button>
        </form>
      </div>
    </div>
  );
}
