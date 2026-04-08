// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
            profile_image: "/avatars/avatar-1.svg",
            created_at: new Date("2026-01-01").toISOString(),
          },
        },
      }),
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/Jean Dupont/i)).toBeInTheDocument();
    });
    expect(screen.getAllByAltText("Avatar 1")[0]).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalled();
  });

  it("handles 401 on profile fetch by clearing tokens and redirecting", async () => {
    localStorage.setItem("token", "jwt-token");
    localStorage.setItem("refreshToken", "refresh-token");

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Unauthorized" }),
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });

  it("shows error message when profile fetch fails", async () => {
    localStorage.setItem("token", "jwt-token");

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: "Boom" }),
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Erreur lors de la récupération du profil")).toBeInTheDocument();
    });
  });

  it("allows editing and saving profile", async () => {
    localStorage.setItem("token", "jwt-token");

    const initialProfileResponse = {
      ok: true,
      json: async () => ({
        data: {
          user: {
            id: 1,
            email: "user@example.com",
            username: "user1",
            first_name: "Jean",
            last_name: "Dupont",
            profile_image: "/avatars/avatar-1.svg",
            created_at: new Date("2026-01-01").toISOString(),
            stats: { eventsCreated: 1, participations: 2, giftsOffered: 3 },
          },
        },
      }),
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          user: {
            id: 1,
            email: "user@example.com",
            username: "user-updated",
            first_name: "Jeanne",
            last_name: "Durand",
            profile_image: "/avatars/avatar-2.svg",
            created_at: new Date("2026-01-01").toISOString(),
          },
        },
      }),
    });

    fetchMock
      .mockResolvedValueOnce(initialProfileResponse)
      .mockResolvedValueOnce(initialProfileResponse)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            user: {
              id: 1,
              email: "user@example.com",
              username: "user-updated",
              first_name: "Jeanne",
              last_name: "Durand",
              profile_image: "/avatars/avatar-2.svg",
              created_at: new Date("2026-01-01").toISOString(),
            },
          },
        }),
      });

    render(<ProfilePage />);

    await screen.findByText("Informations Personnelles");

    fireEvent.click(screen.getByText("Modifier"));

    fireEvent.change(screen.getByLabelText("Prénom"), {
      target: { value: "Jeanne" },
    });
    fireEvent.change(screen.getByLabelText("Nom"), {
      target: { value: "Durand" },
    });
    fireEvent.change(screen.getByLabelText("Nom d'utilisateur"), {
      target: { value: "user-updated" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Avatar 2" }));

    fireEvent.click(screen.getByText("Enregistrer"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/users/me"),
        expect.objectContaining({ method: "PUT" })
      );
    });

    const saveCall = fetchMock.mock.calls.find((call) =>
      String(call[0]).includes("/api/users/me")
    );
    expect(saveCall).toBeDefined();

    const requestBody = saveCall?.[1]?.body;
    expect(typeof requestBody).toBe("string");

    const payload = JSON.parse(requestBody as string);
    expect(payload.profile_image).toBe("/avatars/avatar-2.svg");
  });

  it("handles 401 while saving profile", async () => {
    localStorage.setItem("token", "jwt-token");
    localStorage.setItem("refreshToken", "refresh-token");

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            user: {
              id: 1,
              email: "user@example.com",
              username: "user1",
              first_name: "Jean",
              last_name: "Dupont",
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

    render(<ProfilePage />);

    await screen.findByText(/Jean Dupont/i);

    fireEvent.click(screen.getByText("Modifier"));
    fireEvent.click(screen.getByText("Enregistrer"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });

  it("logs out and redirects to home", async () => {
    localStorage.setItem("token", "jwt-token");
    localStorage.setItem("refreshToken", "refresh-token");
    localStorage.setItem("user", "{}");

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            user: {
              id: 1,
              email: "user@example.com",
              username: "user1",
              first_name: "Jean",
              last_name: "Dupont",
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<ProfilePage />);

    await screen.findByText(/Jean Dupont/i);

    fireEvent.click(screen.getByText("Déconnexion"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/logout"),
      expect.objectContaining({ method: "POST" })
    );
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("falls back to @username and email display when names are missing", async () => {
    localStorage.setItem("token", "jwt-token");

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          user: {
            id: 2,
            email: "fallback@example.com",
            username: "fallback-user",
            first_name: "",
            last_name: "",
            created_at: new Date("2026-02-01").toISOString(),
          },
        },
      }),
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("@fallback-user")).toBeInTheDocument();
    });
  });
});
