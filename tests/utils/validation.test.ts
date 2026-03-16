import { validateEmail, validatePassword, validateUsername } from "@/utils/validation";

describe("validatePassword", () => {
  it("fails when password is shorter than 8 characters", () => {
    const result = validatePassword("Short1A");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must be at least 8 characters");
  });

  it("fails when missing uppercase, lowercase and number", () => {
    const result = validatePassword("aaaaaaaa");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Password must contain at least 1 uppercase letter (A-Z)");
    expect(result.errors).toContain("Password must contain at least 1 number (0-9)");
  });

  it("passes for a valid password", () => {
    const result = validatePassword("ValidPass123");
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe("validateUsername", () => {
  it("fails when username is shorter than 3 characters", () => {
    const result = validateUsername("ab");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Username must be at least 3 characters");
  });

  it("fails when username is longer than 50 characters", () => {
    const result = validateUsername("a".repeat(51));
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Username must not exceed 50 characters");
  });

  it("fails when username contains invalid chars", () => {
    const result = validateUsername("john-doe");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Username can only contain letters, numbers, and underscores"
    );
  });

  it("passes with letters, numbers and underscores", () => {
    const result = validateUsername("john_doe_123");
    expect(result.isValid).toBe(true);
  });
});

describe("validateEmail", () => {
  it("passes for valid email", () => {
    const result = validateEmail("user@example.com");
    expect(result.isValid).toBe(true);
  });

  it("fails for invalid email format", () => {
    const result = validateEmail("user@domain");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Invalid email address");
  });
});
