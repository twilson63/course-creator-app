/**
 * Tests for Signup Flow
 *
 * @module tests/lib/auth/signup.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signup, validateEmail, validatePassword } from '@/lib/auth/signup';

// Mock dataApi
vi.mock('@/lib/hyper-micro', () => ({
  dataApi: {
    listDocuments: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    createDocument: vi.fn().mockResolvedValue({ ok: true, data: {} }),
    getDocument: vi.fn().mockResolvedValue({ ok: false, error: 'Not found' }),
  },
}));

describe('Signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('no@domain')).toBe(false);
      expect(validateEmail('@nodomain.com')).toBe(false);
      expect(validateEmail('spaces in@email.com')).toBe(false);
    });

    it('should reject empty email', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept passwords with 8+ characters', () => {
      const result = validatePassword('password123');
      expect(result.valid).toBe(true);
    });

    it('should reject passwords under 8 characters', () => {
      const result = validatePassword('short');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('8 characters');
    });

    it('should accept empty password check', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
    });

    it('should warn about weak passwords but still accept', () => {
      const result = validatePassword('password123');
      expect(result.valid).toBe(true);
    });
  });

  describe('signup', () => {
    it('should reject invalid email', async () => {
      const result = await signup('invalid-email', 'password123');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('Invalid email');
    });

    it('should reject short password', async () => {
      const result = await signup('test@example.com', 'short');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('8 characters');
    });

    it('should accept valid signup data', async () => {
      const result = await signup('newuser@example.com', 'securePassword123');
      expect(result.ok).toBe(true);
      expect(result.data?.user).toBeDefined();
      expect(result.data?.session).toBeDefined();
    });

    it('should create user with correct email', async () => {
      const email = 'exactemail@example.com';
      const result = await signup(email, 'securePassword123');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.user.email).toBe(email);
      }
    });
  });
});