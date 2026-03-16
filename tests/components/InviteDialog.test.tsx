// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InviteDialog from "@/components/InviteDialog";

describe("InviteDialog", () => {
  const onClose = vi.fn();
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("returns null when closed", () => {
    const { container } = render(<InviteDialog isOpen={false} onClose={onClose} eventId="evt-1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders dialog content when open", () => {
    render(<InviteDialog isOpen={true} onClose={onClose} eventId="evt-1" />);
    expect(screen.getByText("Inviter un participant")).toBeInTheDocument();
    expect(screen.getByLabelText("Adresse Email")).toBeInTheDocument();
  });

  it("shows error when no token is available", async () => {
    render(<InviteDialog isOpen={true} onClose={onClose} eventId="evt-1" />);

    fireEvent.change(screen.getByLabelText("Adresse Email"), { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await waitFor(() => {
      expect(screen.getByText("Vous devez être connecté pour envoyer des invitations.")).toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows success message when invite request succeeds", async () => {
    localStorage.setItem("token", "jwt-token");
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<InviteDialog isOpen={true} onClose={onClose} eventId="evt-1" />);

    fireEvent.change(screen.getByLabelText("Adresse Email"), { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await waitFor(() => {
      expect(screen.getByText("Invitation envoyée à test@example.com !")).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows API error message when invite request fails", async () => {
    localStorage.setItem("token", "jwt-token");
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Email invalide" }),
    });

    render(<InviteDialog isOpen={true} onClose={onClose} eventId="evt-1" />);

    fireEvent.change(screen.getByLabelText("Adresse Email"), {
      target: { value: "bad@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await waitFor(() => {
      expect(screen.getByText("Email invalide")).toBeInTheDocument();
    });
  });

  it("calls onClose when close button is clicked", () => {
    render(<InviteDialog isOpen={true} onClose={onClose} eventId="evt-1" />);

    fireEvent.click(screen.getAllByRole("button", { name: "Fermer" })[1]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
