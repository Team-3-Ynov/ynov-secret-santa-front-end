// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import NotificationBell from "@/components/NotificationBell";

const mockPush = vi.fn();
const fetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("does not fetch unread count when token is missing", async () => {
    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows unread badge and empty state dropdown", async () => {
    localStorage.setItem("token", "jwt");

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unreadCount: 3 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], unreadCount: 0 }),
      });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      expect(screen.getByText("Aucune notification")).toBeInTheDocument();
    });
  });

  it("marks unread notification as read and redirects to event", async () => {
    localStorage.setItem("token", "jwt");

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unreadCount: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "notif-1",
              user_id: 1,
              type: "draw_result",
              title: "Tirage effectué",
              message: "Vous avez un destinataire",
              is_read: false,
              metadata: { eventId: "42" },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          unreadCount: 1,
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

    render(<NotificationBell />);

    fireEvent.click(screen.getByLabelText("Notifications"));

    const row = await screen.findByText("Tirage effectué");
    fireEvent.click(row);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/events/42");
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/notifications/notif-1/read"),
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("marks all notifications as read", async () => {
    localStorage.setItem("token", "jwt");

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unreadCount: 2 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "notif-1",
              user_id: 1,
              type: "generic",
              title: "Notification 1",
              message: "Message 1",
              is_read: false,
              metadata: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: "notif-2",
              user_id: 1,
              type: "generic",
              title: "Notification 2",
              message: "Message 2",
              is_read: false,
              metadata: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          unreadCount: 2,
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

    render(<NotificationBell />);

    fireEvent.click(screen.getByLabelText("Notifications"));

    const markAllButton = await screen.findByText("Tout marquer comme lu");
    fireEvent.click(markAllButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/notifications/read-all"),
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  it("redirects invitation notifications to invitations when no event is provided", async () => {
    localStorage.setItem("token", "jwt");

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unreadCount: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "notif-invite",
              user_id: 1,
              type: "invitation",
              title: "Invitation à rejoindre l'évènement",
              message: "Vous avez reçu une invitation.",
              is_read: false,
              metadata: { invitationId: "invite-1" },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          unreadCount: 1,
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

    render(<NotificationBell />);

    fireEvent.click(screen.getByLabelText("Notifications"));

    const row = await screen.findByText("Invitation à rejoindre l'évènement");
    fireEvent.click(row);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/invitations");
    });
  });

  it("redirects invitation notifications to join page when event id is provided", async () => {
    localStorage.setItem("token", "jwt");

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unreadCount: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "notif-invite-join",
              user_id: 1,
              type: "invitation",
              title: "Invitation à un évènement",
              message: "Cliquez pour répondre",
              is_read: false,
              metadata: { eventId: "event-123", invitationId: "inv-123" },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          unreadCount: 1,
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

    render(<NotificationBell />);

    fireEvent.click(screen.getByLabelText("Notifications"));

    fireEvent.click(await screen.findByText("Invitation à un évènement"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/events/event-123/join?invitationId=inv-123");
    });
  });

  it("keeps only pending invitations visible while hiding read generic and answered invitations", async () => {
    localStorage.setItem("token", "jwt");

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unreadCount: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            {
              id: "notif-read",
              user_id: 1,
              type: "generic",
              title: "Notification déjà traitée",
              message: "Déjà lue",
              is_read: true,
              metadata: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: "notif-unread",
              user_id: 1,
              type: "generic",
              title: "Notification active",
              message: "À traiter",
              is_read: false,
              metadata: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: "notif-invite-read",
              user_id: 1,
              type: "invitation",
              title: "Invitation déjà lue",
              message: "Toujours accessible",
              is_read: true,
              metadata: { eventId: "evt-1" },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: "notif-invite-answered",
              user_id: 1,
              type: "invitation",
              title: "Invitation répondue",
              message: "Ne doit plus apparaître",
              is_read: true,
              metadata: { eventId: "evt-2", invitationStatus: "declined" },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          unreadCount: 1,
        }),
      });

    render(<NotificationBell />);

    fireEvent.click(screen.getByLabelText("Notifications"));

    expect(await screen.findByText("Notification active")).toBeInTheDocument();
    expect(screen.getByText("Invitation déjà lue")).toBeInTheDocument();
    expect(screen.queryByText("Invitation répondue")).not.toBeInTheDocument();
    expect(screen.queryByText("Notification déjà traitée")).not.toBeInTheDocument();
  });

  it("shows a non-blocking error and allows retrying the notifications fetch", async () => {
    localStorage.setItem("token", "jwt");

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unreadCount: 2 }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "boom" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [],
          unreadCount: 2,
        }),
      });

    render(<NotificationBell />);

    fireEvent.click(screen.getByLabelText("Notifications"));

    expect(
      await screen.findByText("Impossible de charger les notifications pour le moment.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Réessayer"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });

  it("closes dropdown when clicking outside", async () => {
    localStorage.setItem("token", "jwt");

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ unreadCount: 1 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], unreadCount: 0 }),
      });

    render(<NotificationBell />);

    fireEvent.click(screen.getByLabelText("Notifications"));

    await screen.findByText("Aucune notification");

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText("Aucune notification")).not.toBeInTheDocument();
    });
  });
});
