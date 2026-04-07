"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  getInvitationJoinPath,
  NOTIFICATIONS_REFRESH_EVENT,
  type NotificationItem,
  type NotificationsResponse,
  type NotificationType,
  shouldDisplayNotification,
} from "@/utils/notifications";

interface UnreadCountResponse {
  success: boolean;
  unreadCount?: number;
}

const POLLING_INTERVAL_MS = 30000;

export default function NotificationBell() {
  const router = useRouter();
  const panelId = useId();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const clearAuthState = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUnreadCount(0);
    setNotifications([]);
    setIsOpen(false);
  }, []);

  const getAuthToken = useCallback(() => localStorage.getItem("token"), []);

  const getNotificationTarget = (notification: NotificationItem) => {
    if (notification.type === "invitation") {
      return getInvitationJoinPath(notification);
    }

    if (notification.metadata?.eventId) {
      return `/events/${notification.metadata.eventId}`;
    }

    return null;
  };

  const getNotificationIcon = (type: NotificationType) => {
    if (type === "draw_result") {
      return "🎅";
    }

    if (type === "invitation") {
      return "📬";
    }

    return "🔔";
  };

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

  const fetchUnreadCount = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        clearAuthState();
        return;
      }

      if (!res.ok) {
        return;
      }

      const data: UnreadCountResponse = await res.json();
      setUnreadCount(data.unreadCount ?? 0);
    } catch (error) {
      console.error("Erreur lors de la récupération du nombre de notifications:", error);
    }
  }, [apiUrl, clearAuthState, getAuthToken]);

  const fetchNotifications = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${apiUrl}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        clearAuthState();
        return;
      }

      if (!res.ok) {
        throw new Error("Impossible de charger les notifications.");
      }

      const data: NotificationsResponse = await res.json();
      setNotifications(Array.isArray(data.data) ? data.data : []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      setErrorMessage("Impossible de charger les notifications pour le moment.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, clearAuthState, getAuthToken]);

  const markAsRead = useCallback(
    async (notification: NotificationItem) => {
      const token = getAuthToken();
      if (!token || notification.is_read) {
        return false;
      }

      try {
        const res = await fetch(`${apiUrl}/api/notifications/${notification.id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          clearAuthState();
          return false;
        }

        if (!res.ok) {
          throw new Error("Impossible de marquer la notification comme lue.");
        }

        setNotifications((prev) =>
          prev.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        return true;
      } catch (error) {
        console.error("Erreur lors du marquage de la notification:", error);
        setErrorMessage("La notification n'a pas pu être marquée comme lue.");
        return false;
      }
    },
    [apiUrl, clearAuthState, getAuthToken]
  );

  const markAllAsRead = useCallback(async () => {
    const token = getAuthToken();
    if (!token || unreadCount === 0) {
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        clearAuthState();
        return;
      }

      if (!res.ok) {
        throw new Error("Impossible de marquer les notifications comme lues.");
      }

      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Erreur lors du marquage des notifications:", error);
      setErrorMessage("Le marquage global a échoué. Réessayez plus tard.");
    }
  }, [apiUrl, clearAuthState, getAuthToken, unreadCount]);

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.is_read) {
      await markAsRead(notification);
    }

    setIsOpen(false);

    const target = getNotificationTarget(notification);
    if (target) {
      router.push(target);
    }
  };

  const handleBellClick = () => {
    if (!isOpen) {
      void fetchNotifications();
    }

    setIsOpen((prev) => !prev);
  };

  const visibleNotifications = notifications.filter(shouldDisplayNotification);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    void fetchUnreadCount();

    const interval = window.setInterval(() => {
      void fetchUnreadCount();
    }, POLLING_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    const handleNotificationsRefresh = () => {
      void fetchUnreadCount();

      if (isOpen) {
        void fetchNotifications();
      }
    };

    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, handleNotificationsRefresh);
    return () =>
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, handleNotificationsRefresh);
  }, [fetchNotifications, fetchUnreadCount, isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleBellClick}
        className="relative rounded-full p-2 text-gray-600 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="dialog"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          role="img"
          aria-label="Notification bell"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-1 text-xs font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Panneau des notifications"
          className="absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="text-xs font-medium text-red-600 hover:text-red-800"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {errorMessage && (
              <div className="px-4 pt-3" role="status" aria-live="polite">
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <div className="flex items-center justify-between gap-3">
                    <span>{errorMessage}</span>
                    <button
                      type="button"
                      onClick={() => void fetchNotifications()}
                      className="shrink-0 font-medium underline hover:no-underline"
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="px-4 py-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-red-600"></div>
                <p className="mt-2 text-sm text-gray-500">Chargement...</p>
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <span className="text-4xl">🔔</span>
                <p className="mt-2 text-sm text-gray-500">Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {visibleNotifications.map((notification) => {
                  const target = getNotificationTarget(notification);

                  return (
                    <button
                      type="button"
                      key={notification.id}
                      onClick={() => void handleNotificationClick(notification)}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                        !notification.is_read ? "bg-red-50" : ""
                      }`}
                      aria-label={`Ouvrir la notification ${notification.title}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-medium ${
                              !notification.is_read ? "text-gray-900" : "text-gray-600"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500">{notification.message}</p>

                          {target && (
                            <p className="mt-2 text-xs font-medium text-red-600">
                              {notification.type === "invitation"
                                ? "Voir l'invitation"
                                : "Voir l'évènement"}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-gray-400">
                            {formatRelativeTime(notification.created_at)}
                          </p>
                        </div>

                        {!notification.is_read && (
                          <div className="flex-shrink-0">
                            <span
                              className="inline-block h-2 w-2 rounded-full bg-red-600"
                              aria-hidden="true"
                            ></span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
