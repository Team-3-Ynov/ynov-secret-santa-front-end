// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import LoginPage from "@/app/auth/login/page";
import SignupPage from "@/app/auth/signup/page";

const mockPush = vi.fn();
const mockReplace = vi.fn();
const fetchMock = vi.fn();
const getSearchParam = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => ({ get: getSearchParam }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Auth pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    getSearchParam.mockReturnValue(null);
    vi.stubGlobal("fetch", fetchMock);
    vi.useRealTimers();
  });

  it("renders login form labels and submit action", () => {
    render(<LoginPage />);

    expect(screen.getByText("Connexion")).toBeInTheDocument();
    expect(screen.getByLabelText("Adresse email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Se connecter" })).toBeInTheDocument();
  });

  it("renders signup form fields and submit action", () => {
    render(<SignupPage />);

    expect(screen.getByText("Créer un compte")).toBeInTheDocument();
    expect(screen.getByLabelText("Adresse email")).toBeInTheDocument();
    expect(screen.getByLabelText("Nom d'utilisateur")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Créer mon compte" })).toBeInTheDocument();
  });

  it("submits login and redirects to events by default", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          accessToken: "access",
          refreshToken: "refresh",
          user: { id: 1, email: "user@example.com" },
        },
      }),
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Adresse email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/events");
    });
    expect(localStorage.getItem("token")).toBe("access");
    expect(localStorage.getItem("refreshToken")).toBe("refresh");
  });

  it("shows login API error messages", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: ["Email invalide", "Mot de passe requis"] }),
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Adresse email"), {
      target: { value: "bad@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "bad" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(screen.getByText("Email invalide, Mot de passe requis")).toBeInTheDocument();
    });
  });

  it("submits signup and redirects to login", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<SignupPage />);

    fireEvent.change(screen.getByLabelText("Adresse email"), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Nom d'utilisateur"), {
      target: { value: "new_user" },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));

    await waitFor(() => {
      expect(screen.getByText("Account created successfully! Redirecting to login...")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/auth/login");
      },
      { timeout: 2500 }
    );
  });

  it("shows signup validation errors from API", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ errors: [{ field: "email", message: "invalid" }] }),
    });

    render(<SignupPage />);

    fireEvent.change(screen.getByLabelText("Adresse email"), {
      target: { value: "bad@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Nom d'utilisateur"), {
      target: { value: "bad_user" },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));

    await waitFor(
      () => {
        expect(screen.getByText("email: invalid")).toBeInTheDocument();
      },
      { timeout: 2500 }
    );
  });
});
