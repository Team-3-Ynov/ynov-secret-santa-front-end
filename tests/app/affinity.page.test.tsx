// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import AffinityPage from "@/app/events/[id]/participants/[participantId]/page";

const fetchMock = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "event-42", participantId: "99" }),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

/** Builds a resolved fetch mock for the initial 4-call Promise.all:
 *  [event, participants, affinities, me]
 */
function mockInitialLoad({
  drawDone = false,
  participants = [{ id: 99, username: "Alice", email: "alice@example.com" }],
  affinities = [] as { target_id: number; affinity: string }[],
  myId = 1,
  meStatus = 200,
}: {
  drawDone?: boolean;
  participants?: { id: number; username: string; email: string }[];
  affinities?: { target_id: number; affinity: string }[];
  myId?: number;
  meStatus?: number;
} = {}) {
  fetchMock
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { id: "event-42", name: "Test Event", drawDone } }),
    })
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: participants }),
    })
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: affinities }),
    })
    .mockResolvedValueOnce({
      ok: meStatus === 401 ? false : true,
      status: meStatus,
      json: async () => ({ data: { user: { id: myId } } }),
    });
}

describe("AffinityPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("redirects to login when no token is present", async () => {
    render(<AffinityPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redirects to login and clears token when /api/auth/me returns 401", async () => {
    localStorage.setItem("token", "expired-token");
    mockInitialLoad({ meStatus: 401 });

    render(<AffinityPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("shows participant name and affinity buttons after a successful load", async () => {
    localStorage.setItem("token", "valid-token");
    mockInitialLoad();

    render(<AffinityPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /Éviter/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Neutre/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Favorable/i })).toBeInTheDocument();
  });

  it("pre-selects the existing affinity returned from the API", async () => {
    localStorage.setItem("token", "valid-token");
    mockInitialLoad({ affinities: [{ target_id: 99, affinity: "favorable" }] });

    render(<AffinityPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    // The "Favorable" button should carry its active style class
    const favorableBtn = screen.getByRole("button", { name: /Favorable/i });
    expect(favorableBtn.className).toMatch(/bg-green-600/);
  });

  it("shows a read-only banner and hides the buttons when draw is done", async () => {
    localStorage.setItem("token", "valid-token");
    mockInitialLoad({ drawDone: true });

    render(<AffinityPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    expect(screen.getByText(/Tirage effectué — lecture seule/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Éviter/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Neutre/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Favorable/i })).not.toBeInTheDocument();
  });

  it("shows a self-affinity error when the target participant is the current user", async () => {
    localStorage.setItem("token", "valid-token");
    // myId matches participantId (99)
    mockInitialLoad({ myId: 99 });

    render(<AffinityPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Vous ne pouvez pas définir une affinité envers vous-même.")
      ).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: /Favorable/i })).not.toBeInTheDocument();
  });

  it("shows ⚠️ for generic errors (not the join-event prompt)", async () => {
    localStorage.setItem("token", "valid-token");
    // Participants list does not include participantId 99
    mockInitialLoad({ participants: [{ id: 55, username: "Bob", email: "bob@example.com" }] });

    render(<AffinityPage />);

    await waitFor(() => {
      expect(screen.getByText("Participant non trouvé dans cet événement.")).toBeInTheDocument();
    });

    expect(screen.getByText("⚠️")).toBeInTheDocument();
    // Must NOT show the join-event prompt
    expect(
      screen.queryByText("Vous devez rejoindre cet événement pour définir des affinités.")
    ).not.toBeInTheDocument();
  });

  it("shows 🚪 and join prompt for membership errors", async () => {
    localStorage.setItem("token", "valid-token");
    mockInitialLoad();

    render(<AffinityPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    // Simulate PUT returning a membership error
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        message: "Vous n'êtes pas un participant accepté de cet événement.",
      }),
    });

    fireEvent.click(screen.getByRole("button", { name: /Favorable/i }));

    // The inline error appears beneath the buttons (participant is still set)
    await waitFor(() => {
      expect(
        screen.getByText("Vous n'êtes pas un participant accepté de cet événement.")
      ).toBeInTheDocument();
    });
  });

  it("saves the affinity and shows a success message on a successful PUT", async () => {
    localStorage.setItem("token", "valid-token");
    mockInitialLoad();

    render(<AffinityPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });

    fireEvent.click(screen.getByRole("button", { name: /Favorable/i }));

    await waitFor(() => {
      expect(screen.getByText("Affinité enregistrée !")).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/events/event-42/affinities/99"),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ affinity: "favorable" }),
      })
    );
  });

  it("shows an inline error message when the PUT request fails", async () => {
    localStorage.setItem("token", "valid-token");
    mockInitialLoad();

    render(<AffinityPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: "Erreur serveur inattendue." }),
    });

    fireEvent.click(screen.getByRole("button", { name: /Éviter/i }));

    await waitFor(() => {
      expect(screen.getByText("Erreur serveur inattendue.")).toBeInTheDocument();
    });

    // The affinity page should still be displayed (not replaced by an error screen)
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("handles participants returned as a top-level array (no data wrapper)", async () => {
    localStorage.setItem("token", "valid-token");

    // Override to return participants as a bare array instead of { data: [...] }
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { id: "event-42", drawDone: false } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [{ id: 99, username: "Alice", email: "alice@example.com" }],
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: { user: { id: 1 } } }),
      });

    render(<AffinityPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });
  });
});
