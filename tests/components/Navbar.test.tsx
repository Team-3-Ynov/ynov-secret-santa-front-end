// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "@/components/Navbar";

const mockPush = vi.fn();
const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUsePathname.mockReturnValue("/");
  });

  it("renders guest links when user is not logged in", async () => {
    render(<Navbar />);

    await waitFor(() => {
      expect(screen.getByText("Connexion")).toBeInTheDocument();
      expect(screen.getByText("Inscription")).toBeInTheDocument();
    });
    expect(screen.queryByText("Déconnexion")).not.toBeInTheDocument();
  });

  it("renders authenticated links when token exists", async () => {
    localStorage.setItem("token", "abc");
    mockUsePathname.mockReturnValue("/events");

    render(<Navbar />);

    await waitFor(() => {
      expect(screen.getByText("Déconnexion")).toBeInTheDocument();
    });
    expect(screen.getByText("Mes Évènements")).toBeInTheDocument();
    expect(screen.getByText("👤 Profil")).toBeInTheDocument();
  });

  it("logs out and redirects to home", async () => {
    localStorage.setItem("token", "abc");
    localStorage.setItem("user", "{}");

    render(<Navbar />);

    const logoutButton = await screen.findByText("Déconnexion");
    fireEvent.click(logoutButton);

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
