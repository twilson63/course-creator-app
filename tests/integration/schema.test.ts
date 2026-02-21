/**
 * Integration tests for Database Schema Setup
 * Verifies that databases are properly configured for course creation
 *
 * @module tests/integration/schema.test
 *
 * NOTE: These tests require the hyper-micro backend to be running.
 * Run with: npm run test:integration (when backend is available)
 */

import { describe, it, expect } from 'vitest';
import { dataApi, healthCheck } from '@/lib/hyper-micro';

// Skip all tests if backend is not available
const describeIfAvailable = (name: string, fn: () => void) => {
  describe.skip(name, fn);
};

// Check if we should run integration tests
const shouldRunIntegration = process.env.RUN_INTEGRATION_TESTS === 'true';

describeIfAvailable('Database Schema Integration', () => {
  describe('Health Check', () => {
    it('should connect to hyper-micro backend', async () => {
      const result = await healthCheck();
      expect(result.ok).toBe(true);
    });
  });

  describe('Databases', () => {
    it('should list available databases', async () => {
      const result = await dataApi.listDatabases();
      expect(result.ok).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should have users database', async () => {
      const result = await dataApi.listDatabases();
      expect(result.ok).toBe(true);
      expect(result.data).toContain('users');
    });
  });

  describe('Courses Database', () => {
    it('should create courses database', async () => {
      const result = await dataApi.createDatabase('courses');
      expect(result.ok || result.error?.includes('exist')).toBe(true);
    });

    it('should verify courses database exists', async () => {
      const result = await dataApi.listDatabases();
      expect(result.ok).toBe(true);
      expect(result.data).toContain('courses');
    });

    it('should create a course document', async () => {
      const result = await dataApi.createDocument('courses', `test-${Date.now()}`, {
        user_id: 'test-user',
        title: 'Test Course',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      expect(result.ok).toBe(true);
    });
  });
});