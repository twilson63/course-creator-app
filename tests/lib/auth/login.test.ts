/**
 * Tests for Login Flow
 *
 * @module tests/lib/auth/login.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { login } from '@/lib/auth/login';
import { verifyPassword } from '@/lib/auth/password';
import { dataApi } from '@/lib/hyper-micro';

// Mocks
vi.mock('@/lib/hyper-micro', () => ({
  dataApi: {
    getDocument: vi.fn(),
  },
}));

vi.mock('@/lib/auth/password', () => ({
  verifyPassword: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  createSession: vi.fn().mockReturnValue({ ok: true, data: { token: 'test-token', userId: 'user-123' } }),
}));

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should reject invalid email format', async () => {
      const result = await login('invalid', 'password123');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('Invalid email');
    });

    it('should reject empty password', async () => {
      const result = await login('test@example.com', '');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('Password is required');
    });

    it('should fail for non-existent user', async () => {
      vi.mocked(dataApi.getDocument).mockResolvedValueOnce({ ok: false, error: 'Not found' });

      const result = await login('nonexistent@example.com', 'password123');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('Invalid credentials');
    });

    it('should fail for wrong password', async () => {
      vi.mocked(dataApi.getDocument).mockResolvedValueOnce({
        ok: true,
        data: { id: 'user-1', email: 'test@example.com', password_hash: 'stored-hash' },
      });
      vi.mocked(verifyPassword).mockResolvedValueOnce(false);

      const result = await login('test@example.com', 'wrongpassword');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('Invalid credentials');
    });

    it('should succeed with correct credentials', async () => {
      vi.mocked(dataApi.getDocument).mockResolvedValueOnce({
        ok: true,
        data: { id: 'user-1', email: 'test@example.com', password_hash: 'stored-hash' },
      });
      vi.mocked(verifyPassword).mockResolvedValueOnce(true);

      const result = await login('test@example.com', 'correctpassword');
      expect(result.ok).toBe(true);
      expect(result.data?.user.email).toBe('test@example.com');
      expect(result.data?.session).toBeDefined();
    });

    it('should normalize email to lowercase', async () => {
      vi.mocked(dataApi.getDocument).mockResolvedValueOnce({
        ok: true,
        data: { id: 'user-1', email: 'test@example.com', password_hash: 'stored-hash' },
      });
      vi.mocked(verifyPassword).mockResolvedValueOnce(true);

      await login('TEST@EXAMPLE.COM', 'password');
      // Check that email was normalized
      expect(dataApi.getDocument).toHaveBeenCalledWith('users', 'test@example.com');
    });
  });
});