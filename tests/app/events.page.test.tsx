// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import EventsListPage from "@/app/events/page";

const fetchMock = vi.fn();

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Events page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("shows authentication error when token is missing", async () => {
    render(<EventsListPage />);

    await waitFor(() => {
      expect(screen.getByText("Vous devez être connecté pour voir vos évènements.")).toBeInTheDocument();
    });
  });

  it("shows events list when authenticated fetch succeeds", async () => {
    localStorage.setItem("token", "jwt-token");
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "evt-1",
            title: "Noel",
            description: "Fetes",
            eventDate: new Date("2026-12-24").toISOString(),
            budget: 25,
            createdAt: new Date("2026-01-01").toISOString(),
          },
        ],
      }),
    });

    render(<EventsListPage />);

    await waitFor(() => {
      expect(screen.getByText("Noel")).toBeInTheDocument();
    });
  });
});