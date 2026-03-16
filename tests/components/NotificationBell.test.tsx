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
