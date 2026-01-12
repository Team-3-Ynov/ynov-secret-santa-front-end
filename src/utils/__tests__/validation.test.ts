import { validatePassword, validateUsername, validateEmail } from '../validation';

describe('validatePassword', () => {
    describe('length requirement (at least 8 characters)', () => {
        it('should fail for password shorter than 8 characters', () => {
            const result = validatePassword('Short1A');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must be at least 8 characters');
        });

        it('should pass for password with exactly 8 characters', () => {
            const result = validatePassword('Valid1Aa');
            expect(result.isValid).toBe(true);
        });

        it('should pass for password longer than 8 characters', () => {
            const result = validatePassword('ValidPassword1');
            expect(result.isValid).toBe(true);
        });
    });

    describe('uppercase requirement (at least 1 uppercase A-Z)', () => {
        it('should fail for password without uppercase', () => {
            const result = validatePassword('nouppercase1');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least 1 uppercase letter (A-Z)');
        });

        it('should pass for password with uppercase', () => {
            const result = validatePassword('Uppercase1a');
            expect(result.isValid).toBe(true);
        });
    });

    describe('lowercase requirement (at least 1 lowercase a-z)', () => {
        it('should fail for password without lowercase', () => {
            const result = validatePassword('NOLOWERCASE1');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least 1 lowercase letter (a-z)');
        });

        it('should pass for password with lowercase', () => {
            const result = validatePassword('Lowercase1');
            expect(result.isValid).toBe(true);
        });
    });

    describe('number requirement (at least 1 number 0-9)', () => {
        it('should fail for password without number', () => {
            const result = validatePassword('NoNumeralsHere');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least 1 number (0-9)');
        });

        it('should pass for password with number', () => {
            const result = validatePassword('WithNumber1');
            expect(result.isValid).toBe(true);
        });
    });

    describe('multiple requirements', () => {
        it('should return all errors for password failing multiple requirements', () => {
            const result = validatePassword('abc');
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1);
        });

        it('should pass for valid password meeting all requirements', () => {
            const result = validatePassword('ValidPass123');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });
});

describe('validateUsername', () => {
    describe('length requirement (3-50 characters)', () => {
        it('should fail for username shorter than 3 characters', () => {
            const result = validateUsername('ab');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Username must be at least 3 characters');
        });

        it('should pass for username with exactly 3 characters', () => {
            const result = validateUsername('abc');
            expect(result.isValid).toBe(true);
        });

        it('should pass for username with 50 characters', () => {
            const username = 'a'.repeat(50);
            const result = validateUsername(username);
            expect(result.isValid).toBe(true);
        });

        it('should fail for username longer than 50 characters', () => {
            const username = 'a'.repeat(51);
            const result = validateUsername(username);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Username must not exceed 50 characters');
        });
    });

    describe('character requirement (only letters, numbers, underscores)', () => {
        it('should pass for username with only letters', () => {
            const result = validateUsername('JohnDoe');
            expect(result.isValid).toBe(true);
        });

        it('should pass for username with letters and numbers', () => {
            const result = validateUsername('user123');
            expect(result.isValid).toBe(true);
        });

        it('should pass for username with letters, numbers, and underscores', () => {
            const result = validateUsername('john_doe_123');
            expect(result.isValid).toBe(true);
        });

        it('should fail for username with spaces', () => {
            const result = validateUsername('john doe');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Username can only contain letters, numbers, and underscores');
        });

        it('should fail for username with special characters', () => {
            const result = validateUsername('user@name');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Username can only contain letters, numbers, and underscores');
        });

        it('should fail for username with hyphens', () => {
            const result = validateUsername('john-doe');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Username can only contain letters, numbers, and underscores');
        });
    });
});

describe('validateEmail', () => {
    it('should pass for valid email', () => {
        const result = validateEmail('user@example.com');
        expect(result.isValid).toBe(true);
    });

    it('should fail for email without @', () => {
        const result = validateEmail('userexample.com');
        expect(result.isValid).toBe(false);
    });

    it('should fail for email without domain', () => {
        const result = validateEmail('user@');
        expect(result.isValid).toBe(false);
    });
});
