"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function JoinEventPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token"); // Token d'invitation depuis l'URL

  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Construire l'URL de redirection avec le token d'invitation
  const redirectQuery = new URLSearchParams();
  if (inviteToken) {
    redirectQuery.set("token", inviteToken);
  }
  const redirectUrl = redirectQuery.toString()
    ? `/events/${id}/join?${redirectQuery.toString()}`
    : `/events/${id}/join`;

  useEffect(() => {
    const authToken = localStorage.getItem("token");
    setIsLoggedIn(!!authToken);
  }, []);

  const handleJoinEvent = async () => {
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      // Redirect to login, then come back with the invite token
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    setJoining(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/events/${id}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inviteToken ? { token: inviteToken } : {}),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          // Auth token expired or invalid
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          setIsLoggedIn(false);
          router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
          return;
        }
        throw new Error(data.message || "Erreur lors de la tentative de rejoindre l'évènement");
      }

      const message = data?.message || "Vous avez rejoint l'évènement avec succès !";
      const alreadyJoined = typeof message === "string" && message.includes("déjà rejoint");

      setSuccess(message);
      if (alreadyJoined) {
        router.push(`/events/${id}`);
        return;
      }

      // Redirect to event page after 2 seconds on fresh join
      setTimeout(() => {
        router.push(`/events/${id}`);
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue est survenue");
      }
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Rejoindre l&apos;évènement</h1>
          <p className="text-gray-600">Vous avez été invité à participer à un Secret Santa !</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        {!success && (
          <div className="space-y-4">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleJoinEvent}
                disabled={joining}
                className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {joining ? (
                  <span className="flex items-center justify-center">
                    <svg
                      aria-hidden="true"
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
                    En cours...
                  </span>
                ) : (
                  "Rejoindre l'évènement"
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Vous devez être connecté pour rejoindre cet évènement.
                </p>
                <Link
                  href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`}
                  className="block w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors text-center"
                >
                  Se connecter
                </Link>
                <Link
                  href={`/auth/signup?redirect=${encodeURIComponent(redirectUrl)}`}
                  className="block w-full py-3 px-4 bg-white text-red-600 font-semibold rounded-lg border border-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors text-center"
                >
                  Créer un compte
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
