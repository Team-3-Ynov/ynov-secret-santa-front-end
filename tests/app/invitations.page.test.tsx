// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import InvitationsPage from "@/app/invitations/page";

const mockPush = vi.fn();

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useTransition: () => [false, (callback: () => void) => callback()],
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
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
  });

  it("redirects to login when token is missing", async () => {
    render(<InvitationsPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/login?redirect=/invitations");
    });
  });

  it("shows invitations content when token exists", async () => {
    localStorage.setItem("token", "jwt-token");

    render(<InvitationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Vous avez reçu une invitation ?")).toBeInTheDocument();
    });
  });
});