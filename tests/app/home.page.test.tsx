// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import Home from "@/app/page";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Home page", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders hero and guest call-to-action", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Secret Santa/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText("🚀 Commencer gratuitement")).toBeInTheDocument();
    expect(screen.getByText("Se connecter")).toBeInTheDocument();
  });

  it("renders logged-in call-to-action when token exists", async () => {
    localStorage.setItem("token", "jwt-token");

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("🎁 Créer un événement")).toBeInTheDocument();
    });
    expect(screen.getByText("📋 Voir mes événements")).toBeInTheDocument();
  });
});
