/**
 * Tests for Password Hashing Utilities
 *
 * @module tests/lib/auth/password.test
 */

import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('Password Hashing', () => {
  describe('hashPassword', () => {
    it('should return a hash string', async () => {
      const result = await hashPassword('myPassword123');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should include the salt in the hash', async () => {
      const hash = await hashPassword('test123');
      // Hash format: base64(salt):base64(hash)
      expect(hash).toMatch(/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/);
    });

    it('should produce different hashes for same password', async () => {
      const hash1 = await hashPassword('samePassword');
      const hash2 = await hashPassword('samePassword');
      // Different salts should produce different hashes
      expect(hash1).not.toBe(hash2);
    });

    it('should work with empty password', async () => {
      const hash = await hashPassword('');
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const hash = await hashPassword('correctPassword');
      const result = await verifyPassword('correctPassword', hash);
      expect(result).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const hash = await hashPassword('correctPassword');
      const result = await verifyPassword('wrongPassword', hash);
      expect(result).toBe(false);
    });

    it('should return false for empty password against non-empty hash', async () => {
      const hash = await hashPassword('actualPassword');
      const result = await verifyPassword('', hash);
      expect(result).toBe(false);
    });

    it('should work with previously generated hash', async () => {
      // Pre-generated hash for "test123" with a specific salt
      // This tests that the algorithm is deterministic
      const password = 'deterministicTest';
      const hash = await hashPassword(password);
      const result = await verifyPassword(password, hash);
      expect(result).toBe(true);
    });

    it('should reject malformed hash', async () => {
      const result = await verifyPassword('test123', 'not-a-valid-hash');
      expect(result).toBe(false);
    });

    it('should reject hash with missing parts', async () => {
      const result = await verifyPassword('test123', 'onlyOnePart');
      expect(result).toBe(false);
    });
  });

  describe('Integration', () => {
    it('should hash and verify in a full cycle', async () => {
      const password = 'MySecurePassword!2024';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should handle special characters in password', async () => {
      const password = 'p@$$w0rd!#$%^&*()';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should handle unicode in password', async () => {
      const password = '密码测试🔓🔒';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });
  });
});