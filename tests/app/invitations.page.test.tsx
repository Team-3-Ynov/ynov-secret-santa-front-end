// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import InvitationsPage from "@/app/invitations/page";

const mockPush = vi.fn();
const fetchMock = vi.fn();
const mockRouter = { push: mockPush };

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useTransition: () => [false, (callback: () => void) => callback()],
  };
});


vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Invitations page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("redirects to login when token is missing", async () => {
    render(<InvitationsPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/login?redirect=/invitations");
    });
  });

  it("shows invitations content when token exists", async () => {
    localStorage.setItem("token", "jwt-token");

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            id: "notif-invite",
            user_id: 1,
            type: "invitation",
            title: "Invitation - Mon Event",
            message: "X vous a invité(e)",
            is_read: true,
            metadata: { eventId: "event-1", invitationId: "inv-1" },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        unreadCount: 0,
      }),
    });

    render(<InvitationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Invitations en attente de réponse")).toBeInTheDocument();
      expect(screen.getByText("Invitation - Mon Event")).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: "Répondre à l'invitation" })).toHaveAttribute(
      "href",
      "/events/event-1/join?invitationId=inv-1"
    );
  });

  it("hides invitations that are already responded", async () => {
    localStorage.setItem("token", "jwt-token");

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            id: "notif-answered",
            user_id: 1,
            type: "invitation",
            title: "Invitation déjà répondue",
            message: "Vous avez déjà répondu",
            is_read: true,
            metadata: {
              eventId: "event-2",
              invitationId: "inv-2",
              invitationStatus: "accepted",
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      }),
    });

    render(<InvitationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Aucune invitation reçue pour le moment.")).toBeInTheDocument();
    });

    expect(screen.queryByText("Invitation déjà répondue")).not.toBeInTheDocument();
  });

  it("declines an invitation and removes it from the list", async () => {
    localStorage.setItem("token", "jwt-token");

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: "notif-invite",
              user_id: 1,
              type: "invitation",
              title: "Invitation à refuser",
              message: "Vous pouvez décliner",
              is_read: false,
              metadata: { eventId: "event-1", invitationId: "inv-1" },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, invitationId: "inv-1" }),
      });

    render(<InvitationsPage />);

    expect(await screen.findByText("Invitation à refuser")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Décliner l'invitation Invitation à refuser" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/events/event-1/invitations/inv-1/decline"),
        expect.objectContaining({ method: "PATCH" })
      );
    });

    await waitFor(() => {
      expect(screen.queryByText("Invitation à refuser")).not.toBeInTheDocument();
    });
  });

  it("shows a local error when decline fails", async () => {
    localStorage.setItem("token", "jwt-token");

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: "notif-invite-error",
              user_id: 1,
              type: "invitation",
              title: "Invitation en erreur",
              message: "Test erreur",
              is_read: false,
              metadata: { eventId: "event-2", invitationId: "inv-2" },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: "Impossible de refuser" }),
      });

    render(<InvitationsPage />);

    expect(await screen.findByText("Invitation en erreur")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Décliner l'invitation Invitation en erreur" })
    );

    expect(await screen.findByText("Impossible de refuser")).toBeInTheDocument();
    expect(screen.getByText("Invitation en erreur")).toBeInTheDocument();
  });
});
