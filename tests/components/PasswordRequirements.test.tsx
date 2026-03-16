import { renderToStaticMarkup } from "react-dom/server";
import PasswordRequirements from "@/components/PasswordRequirements";

describe("PasswordRequirements", () => {
  it("renders requirement labels", () => {
    const html = renderToStaticMarkup(<PasswordRequirements password="" />);

    expect(html).toContain("Au moins 8 caractères");
    expect(html).toContain("Au moins une majuscule (A-Z)");
    expect(html).toContain("Au moins une minuscule (a-z)");
    expect(html).toContain("Au moins un chiffre (0-9)");
  });

  it("marks all requirements as valid for a strong password", () => {
    const html = renderToStaticMarkup(<PasswordRequirements password="ValidPass123" />);

    expect((html.match(/text-green-700/g) || []).length).toBe(4);
  });

  it("keeps some requirements invalid for a weak password", () => {
    const html = renderToStaticMarkup(<PasswordRequirements password="abc" />);

    expect(html).toContain("text-gray-500");
  });
});
