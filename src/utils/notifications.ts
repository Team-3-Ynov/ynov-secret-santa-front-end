export const NOTIFICATIONS_REFRESH_EVENT = "notifications:refresh";

export interface NotificationMetadata {
  eventId?: string;
  invitationId?: string;
  token?: string;
  invitationToken?: string;
  invitationStatus?: "pending" | "accepted" | "declined" | string;
  status?: "pending" | "accepted" | "declined" | string;
  respondedAt?: string;
  isResponded?: boolean;
  invitedEmail?: string;
  receiverUsername?: string;
}

export type NotificationType = "draw_result" | "invitation" | "generic" | string;

export interface NotificationItem {
  id: string;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  metadata?: NotificationMetadata;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  unreadCount?: number;
  data?: NotificationItem[];
}

export const isInvitationNotification = (notification: NotificationItem) =>
  notification.type === "invitation";

export const isPendingInvitationNotification = (notification: NotificationItem) => {
  if (!isInvitationNotification(notification)) {
    return false;
  }

  const status = notification.metadata?.invitationStatus ?? notification.metadata?.status;
  if (status === "accepted" || status === "declined") {
    return false;
  }

  if (notification.metadata?.isResponded) {
    return false;
  }

  if (
    typeof notification.metadata?.respondedAt === "string" &&
    notification.metadata.respondedAt.trim() !== ""
  ) {
    return false;
  }

  return true;
};

export const shouldDisplayNotification = (notification: NotificationItem) =>
  isInvitationNotification(notification)
    ? isPendingInvitationNotification(notification)
    : !notification.is_read;

export const getInvitationJoinPath = (notification: NotificationItem) => {
  if (notification.type !== "invitation") {
    return null;
  }

  const eventId = notification.metadata?.eventId;
  if (!eventId) {
    return "/invitations";
  }

  const inviteKey = notification.metadata?.token ?? notification.metadata?.invitationToken;
  if (inviteKey) {
    return `/events/${eventId}/join?token=${encodeURIComponent(inviteKey)}`;
  }

  if (notification.metadata?.invitationId) {
    return `/events/${eventId}/join?invitationId=${encodeURIComponent(notification.metadata.invitationId)}`;
  }

  return "/invitations";
};
