"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  getInvitationJoinPath,
  isPendingInvitationNotification,
  NOTIFICATIONS_REFRESH_EVENT,
  type NotificationItem,
  type NotificationsResponse,
} from "@/utils/notifications";

export default function InvitationsPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [invitationNotifications, setInvitationNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [decliningByNotificationId, setDecliningByNotificationId] = useState<
    Record<string, boolean>
  >({});
  const [declineErrorByNotificationId, setDeclineErrorByNotificationId] = useState<
    Record<string, string>
  >({});
  const [, startTransition] = useTransition();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR");
  };

  const fetchInvitationNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setInvitationNotifications([]);
      return;
    }

    setLoadingNotifications(true);
    setNotificationsError(null);

    try {
      const res = await fetch(`${apiUrl}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        router.push("/auth/login?redirect=/invitations");
        return;
      }

      if (!res.ok) {
        setNotificationsError("Impossible de charger vos invitations pour le moment.");
        return;
      }

      const result: NotificationsResponse = await res.json();
      const items = Array.isArray(result.data) ? result.data : [];
      setInvitationNotifications(items.filter(isPendingInvitationNotification));
    } catch (error) {
      console.error("Erreur lors du chargement des invitations reçues:", error);
      setNotificationsError("Impossible de charger vos invitations pour le moment.");
    } finally {
      setLoadingNotifications(false);
    }
  }, [apiUrl, router]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login?redirect=/invitations");
      return;
    }
    startTransition(() => {
      setIsLoggedIn(true);
    });
  }, [router]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    void fetchInvitationNotifications();
  }, [fetchInvitationNotifications, isLoggedIn]);

  const handleDeclineInvitation = useCallback(
    async (notification: NotificationItem) => {
      const eventId = notification.metadata?.eventId;
      const invitationId = notification.metadata?.invitationId;

      if (!eventId || !invitationId) {
        setDeclineErrorByNotificationId((prev) => ({
          ...prev,
          [notification.id]: "Impossible de refuser cette invitation: identifiants manquants.",
        }));
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login?redirect=/invitations");
        return;
      }

      setDecliningByNotificationId((prev) => ({ ...prev, [notification.id]: true }));
      setDeclineErrorByNotificationId((prev) => {
        const next = { ...prev };
        delete next[notification.id];
        return next;
      });

      try {
        const res = await fetch(
          `${apiUrl}/api/events/${eventId}/invitations/${invitationId}/decline`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          router.push("/auth/login?redirect=/invitations");
          return;
        }

        if (!res.ok) {
          const errorData = (await res.json().catch(() => null)) as { message?: string } | null;
          throw new Error(errorData?.message || "Le refus de l'invitation a échoué.");
        }

        setInvitationNotifications((prev) => prev.filter((item) => item.id !== notification.id));
        globalThis.dispatchEvent(new CustomEvent(NOTIFICATIONS_REFRESH_EVENT));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Le refus de l'invitation a échoué.";
        setDeclineErrorByNotificationId((prev) => ({
          ...prev,
          [notification.id]: message,
        }));
      } finally {
        setDecliningByNotificationId((prev) => ({ ...prev, [notification.id]: false }));
      }
    },
    [apiUrl, router]
  );

  useEffect(() => {
    const handleNotificationsRefresh = () => {
      if (isLoggedIn) {
        void fetchInvitationNotifications();
      }
    };

    globalThis.addEventListener(NOTIFICATIONS_REFRESH_EVENT, handleNotificationsRefresh);
    return () =>
      globalThis.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, handleNotificationsRefresh);
  }, [fetchInvitationNotifications, isLoggedIn]);

  let invitationsContent: ReactNode = (
    <p className="mt-4 text-sm text-gray-500">Aucune invitation reçue pour le moment.</p>
  );

  if (loadingNotifications) {
    invitationsContent = (
      <p className="mt-4 text-sm text-gray-500">Chargement des invitations...</p>
    );
  } else if (invitationNotifications.length > 0) {
    invitationsContent = (
      <div className="mt-4 space-y-3">
        {invitationNotifications.map((notification) => {
          const joinPath = getInvitationJoinPath(notification);
          const canReply = joinPath !== null && joinPath !== "/invitations";
          const canDecline =
            typeof notification.metadata?.eventId === "string" &&
            notification.metadata.eventId.length > 0 &&
            typeof notification.metadata?.invitationId === "string" &&
            notification.metadata.invitationId.length > 0;
          const isDeclining = decliningByNotificationId[notification.id] === true;
          const declineError = declineErrorByNotificationId[notification.id];

          return (
            <div
              key={notification.id}
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
              <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs text-gray-400">
                    Reçue {formatRelativeTime(notification.created_at)}
                  </span>
                  {declineError && (
                    <p className="mt-1 text-xs text-red-600" role="status" aria-live="polite">
                      {declineError}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {canReply ? (
                    <Link
                      href={joinPath}
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Répondre à l&apos;invitation
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-500">
                      Lien d&apos;invitation indisponible
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleDeclineInvitation(notification)}
                    disabled={!canDecline || isDeclining}
                    className="text-sm font-medium text-gray-600 hover:text-gray-800 disabled:cursor-not-allowed disabled:text-gray-400"
                    aria-label={`Décliner l'invitation ${notification.title}`}
                  >
                    {isDeclining ? "Décliner..." : "Décliner"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

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
        <div className="mb-6 rounded-xl border border-red-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Invitations en attente de réponse</h2>
          <p className="mt-1 text-sm text-gray-600">
            Seules les invitations reçues qui n&apos;ont pas encore de réponse apparaissent ici.
          </p>

          {notificationsError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <div className="flex items-center justify-between gap-3">
                <span>{notificationsError}</span>
                <button
                  type="button"
                  onClick={() => void fetchInvitationNotifications()}
                  className="shrink-0 font-medium underline hover:no-underline"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {invitationsContent}
        </div>

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
              Les invitations aux événements Secret Santa sont envoyées par email. Cliquez sur le
              lien dans l&apos;email pour rejoindre l&apos;événement.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Comment ça marche ?</h3>
            <ol className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  1
                </span>
                <span>L&apos;organisateur vous envoie une invitation par email</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  2
                </span>
                <span>Cliquez sur le lien &quot;Rejoindre&quot; dans l&apos;email</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  3
                </span>
                <span>Connectez-vous ou créez un compte si nécessaire</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  4
                </span>
                <span>Vous êtes automatiquement ajouté à l&apos;événement !</span>
              </li>
            </ol>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Pas encore d&apos;invitation ?</h3>
            <p className="text-gray-600 mb-4">
              Demandez à l&apos;organisateur de vous envoyer une invitation, ou créez votre propre
              événement Secret Santa !
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
                Vérifiez votre dossier spam si vous n&apos;avez pas reçu l&apos;email
                d&apos;invitation. Les emails sont envoyés depuis notre plateforme Secret Santa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
