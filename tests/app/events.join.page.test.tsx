// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import JoinEventPage from "@/app/events/[id]/join/page";
import { NOTIFICATIONS_REFRESH_EVENT } from "@/utils/notifications";

const fetchMock = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "event-1" }),
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams("token=invite-token"),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Join event page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("dispatches a notifications refresh event after joining successfully", async () => {
    localStorage.setItem("token", "jwt-token");

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const dispatchSpy = vi.spyOn(globalThis, "dispatchEvent");

    render(<JoinEventPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Rejoindre l'évènement" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/events/event-1/join"),
        expect.objectContaining({ method: "POST" })
      );
    });

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: NOTIFICATIONS_REFRESH_EVENT })
      );
    });
  });
});

