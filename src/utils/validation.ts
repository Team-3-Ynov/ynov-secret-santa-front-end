// Validation utilities for signup form

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validates a password against the following rules:
 * - At least 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 */
export function validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least 1 uppercase letter (A-Z)');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least 1 lowercase letter (a-z)');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least 1 number (0-9)');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validates a username against the following rules:
 * - 3-50 characters
 * - Only letters, numbers, and underscores
 */
export function validateUsername(username: string): ValidationResult {
    const errors: string[] = [];

    if (username.length < 3) {
        errors.push('Username must be at least 3 characters');
    }

    if (username.length > 50) {
        errors.push('Username must not exceed 50 characters');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push('Username can only contain letters, numbers, and underscores');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validates an email address
 */
export function validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        errors.push('Invalid email address');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
