// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import ProfilePage from "@/app/profile/page";

const mockPush = vi.fn();
const fetchMock = vi.fn();

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

describe("Profile page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("redirects to login when token is missing", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });
  });

  it("renders profile data when fetch succeeds", async () => {
    localStorage.setItem("token", "jwt-token");
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          user: {
            id: 1,
            email: "user@example.com",
            username: "user1",
            first_name: "Jean",
            last_name: "Dupont",
            created_at: new Date("2026-01-01").toISOString(),
          },
        },
      }),
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/Jean Dupont/i)).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalled();
  });
});