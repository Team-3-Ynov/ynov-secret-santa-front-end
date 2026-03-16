"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateSecretSantaPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [budget, setBudget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Format data for the backend API
    const eventData: {
      title: string;
      description?: string;
      eventDate: string;
      budget?: number;
    } = {
      title,
      eventDate: eventDate ? new Date(eventDate).toISOString() : "",
    };

    // Only add optional fields if they have values
    if (description.trim()) {
      eventData.description = description;
    }
    if (budget) {
      eventData.budget = Number(budget);
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous devez être connecté pour créer un événement.");
      router.push("/auth/login");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      const response = await fetch(`${apiUrl}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      const responseText = await response.text();
      // biome-ignore lint/suspicious/noImplicitAnyLet: JSON.parse returns any
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        console.error("Failed to parse JSON response:", responseText);
        throw new Error("Le serveur a retourné une réponse invalide.");
      }

      if (!response.ok) {
        const errorMessage = Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || "Une erreur inconnue est survenue.";
        setError(errorMessage);
      } else {
        // Redirect to my events page after successful creation
        router.push("/events");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue est survenue.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600">Créer un Secret Santa</h1>
          <p className="mt-2 text-gray-600">Que la magie de Noël commence !</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="p-4 text-green-800 bg-green-100 border border-green-200 rounded-md">
              {success}
            </div>
          )}
          {error && (
            <div className="p-4 text-red-800 bg-red-100 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Nom de l&apos;événement
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              placeholder="ex: Secret Santa du Bureau"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description (Optionnel)
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
              placeholder="ex: Notre échange de cadeaux annuel entre collègues."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="eventDate" className="text-sm font-medium text-gray-700">
                Date de l&apos;événement
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
                Budget (€, Optionnel)
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                placeholder="ex: 25"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Création en cours..." : "Créer l'événement"}
          </button>
        </form>
      </div>
    </div>
  );
}
