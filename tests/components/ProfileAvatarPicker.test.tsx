// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import ProfileAvatarPicker from "@/components/ProfileAvatarPicker";

describe("ProfileAvatarPicker", () => {
  it("renders all predefined avatar options", () => {
    render(<ProfileAvatarPicker value="" onChange={vi.fn()} />);

    expect(screen.getByRole("radio", { name: "Avatar 1" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Avatar 2" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Avatar 3" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Avatar 4" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Avatar 5" })).toBeInTheDocument();
  });

  it("calls onChange with selected avatar image path", () => {
    const onChange = vi.fn();
    render(<ProfileAvatarPicker value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole("radio", { name: "Avatar 4" }));

    expect(onChange).toHaveBeenCalledWith("/avatars/avatar-4.svg");
  });

  it("shows validation error when provided", () => {
    render(
      <ProfileAvatarPicker
        value=""
        onChange={vi.fn()}
        error="Veuillez sélectionner une image de profil."
      />
    );

    expect(screen.getByText("Veuillez sélectionner une image de profil.")).toBeInTheDocument();
  });
});

