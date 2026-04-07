"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type AffinityValue = "avoid" | "neutral" | "favorable";

interface Participant {
  id: number;
  username: string;
  email: string;
}

const AFFINITY_OPTIONS: {
  value: AffinityValue;
  label: string;
  description: string;
  icon: string;
  activeClass: string;
  inactiveClass: string;
}[] = [
  {
    value: "avoid",
    label: "Éviter",
    description: "Je préfère ne pas lui offrir un cadeau",
    icon: "🚫",
    activeClass: "bg-red-600 text-white border-red-600 shadow-md",
    inactiveClass: "bg-white text-red-600 border-red-300 hover:bg-red-50",
  },
  {
    value: "neutral",
    label: "Neutre",
    description: "Aucune préférence particulière",
    icon: "○",
    activeClass: "bg-gray-600 text-white border-gray-600 shadow-md",
    inactiveClass: "bg-white text-gray-600 border-gray-300 hover:bg-gray-50",
  },
  {
    value: "favorable",
    label: "Favorable",
    description: "Je serais ravi(e) de lui offrir un cadeau",
    icon: "✓",
    activeClass: "bg-green-600 text-white border-green-600 shadow-md",
    inactiveClass: "bg-white text-green-600 border-green-300 hover:bg-green-50",
  },
];

export default function AffinityPage() {
  const params = useParams();
  const eventId = typeof params.id === "string" ? params.id : undefined;
  const participantId = typeof params.participantId === "string" ? params.participantId : undefined;
  const router = useRouter();

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [currentAffinity, setCurrentAffinity] = useState<AffinityValue>("neutral");
  const [drawDone, setDrawDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!eventId || !participantId) return;

    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      let myId: number | null = null;

      try {
        const [eventRes, participantsRes, affinitiesRes, meRes] = await Promise.all([
          fetch(`${apiUrl}/api/events/${eventId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/api/events/${eventId}/participants`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/api/events/${eventId}/affinities`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (meRes.status === 401) {
          localStorage.removeItem("token");
          router.push("/auth/login");
          return;
        }
        if (meRes.ok) {
          const meData = await meRes.json();
          myId = meData?.data?.user?.id ?? meData?.user?.id ?? meData?.id ?? null;
        }

        if (!eventRes.ok) {
          setError("Événement non trouvé.");
          setLoading(false);
          return;
        }

        const eventResult = await eventRes.json();
        const eventData = eventResult?.data || eventResult;
        setDrawDone(!!eventData?.drawDone);

        if (!participantsRes.ok) {
          setError("Impossible de charger ce participant pour cet événement.");
          setLoading(false);
          return;
        }

        const list: Participant[] = (await participantsRes.json()).data || [];
        const found = list.find((p) => p.id === Number(participantId));
        if (!found) {
          setError("Participant non trouvé dans cet événement.");
          setLoading(false);
          return;
        }
        // Guard: cannot set affinity for yourself
        if (myId !== null && found.id === myId) {
          setError("Vous ne pouvez pas définir une affinité envers vous-même.");
          setLoading(false);
          return;
        }
        setParticipant(found);

        if (affinitiesRes.ok) {
          const list = (await affinitiesRes.json()).data || [];
          const existing = list.find(
            (a: { target_id: number; affinity: AffinityValue }) =>
              a.target_id === Number(participantId)
          );
          if (existing) {
            setCurrentAffinity(existing.affinity);
          }
        }
      } catch {
        setError("Une erreur est survenue lors du chargement.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [eventId, participantId, router]);

  const handleSelect = async (value: AffinityValue) => {
    if (drawDone || saving) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setSaving(true);
    setSuccessMessage("");
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/events/${eventId}/affinities/${participantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ affinity: value }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erreur lors de la mise à jour.");
      }

      setCurrentAffinity(value);
      setSuccessMessage("Affinité enregistrée !");
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
      </div>
    );
  }

  if (error && !participant) {
    const normalizedError = error.toLowerCase();
    const isNotParticipant =
      normalizedError.includes("participant") || normalizedError.includes("accepté");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-4xl">{isNotParticipant ? "🚪" : "⚠️"}</div>
          <p className="text-gray-800 font-medium">
            {isNotParticipant
              ? "Vous devez rejoindre cet événement pour définir des affinités."
              : error}
          </p>
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
          >
            ← Retour à l&apos;événement
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Back link */}
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
        >
          <svg
            aria-hidden="true"
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Retour à l&apos;événement
        </Link>

        {/* Participant card */}
        {participant && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-red-600 font-bold text-3xl">
                  {participant.username?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{participant.username}</h1>
              <p className="text-gray-500 text-sm mt-1">{participant.email}</p>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-base font-semibold text-gray-700 mb-1 text-center">
                Définir votre affinité
              </h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                {drawDone
                  ? "Le tirage a déjà été effectué. Les affinités ne peuvent plus être modifiées."
                  : "Cette préférence guide le tirage au sort (contrainte douce)."}
              </p>

              {drawDone ? (
                <div className="flex items-center justify-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-yellow-600 text-sm font-medium">
                    🔒 Tirage effectué — lecture seule
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {AFFINITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      disabled={saving}
                      onClick={() => handleSelect(option.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                        currentAffinity === option.value ? option.activeClass : option.inactiveClass
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Description of current selection */}
              {!drawDone && (
                <p className="text-center text-sm text-gray-500 mt-4 min-h-[1.25rem]">
                  {AFFINITY_OPTIONS.find((o) => o.value === currentAffinity)?.description}
                </p>
              )}

              {/* Feedback messages */}
              {successMessage && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">
                  {successMessage}
                </div>
              )}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info box */}
        {!drawDone && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-medium mb-1">Comment fonctionnent les affinités ?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>
                <strong>Éviter</strong> : Le tirage essaiera de ne pas vous assigner cette personne.
              </li>
              <li>
                <strong>Neutre</strong> : Aucune préférence, résultat purement aléatoire.
              </li>
              <li>
                <strong>Favorable</strong> : Le tirage favorisera cette assignation.
              </li>
            </ul>
            <p className="mt-2 text-blue-500 text-xs">
              Les préférences sont des contraintes douces : si trop de participants ont des
              affinités &quot;Éviter&quot; mutuelles, certaines peuvent être ignorées pour garantir
              un tirage valide.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
