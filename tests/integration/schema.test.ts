/**
 * Integration tests for Database Schema Setup
 * Verifies that databases and storage buckets are properly configured
 *
 * @module tests/integration/schema.test
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { dataApi, storageApi, healthCheck } from '@/lib/hyper-micro';

describe('Database Schema Integration', () => {
  describe('Health Check', () => {
    it('should connect to hyper-micro backend', async () => {
      const result = await healthCheck();
      expect(result.ok).toBe(true);
    });
  });

  describe('Databases', () => {
    it('should have users database', async () => {
      const result = await dataApi.listDatabases();
      expect(result.ok).toBe(true);
      expect(result.data).toContain('users');
    });

    it('should have courses database', async () => {
      const result = await dataApi.listDatabases();
      expect(result.ok).toBe(true);
      expect(result.data).toContain('courses');
    });

    it('should be able to create a test user', async () => {
      const result = await dataApi.createDocument('users', 'test-user-1', {
        email: 'test@example.com',
        password_hash: 'test-hash',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      expect(result.ok).toBe(true);
    });

    it('should be able to retrieve test user', async () => {
      const result = await dataApi.getDocument('users', 'test-user-1');
      expect(result.ok).toBe(true);
      expect(result.data?.email).toBe('test@example.com');
    });

    it('should be able to create a test course', async () => {
      const result = await dataApi.createDocument('courses', 'test-course-1', {
        user_id: 'test-user-1',
        title: 'Test Course',
        video_url: 'https://youtube.com/watch?v=test',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      expect(result.ok).toBe(true);
    });

    it('should be able to retrieve test course', async () => {
      const result = await dataApi.getDocument('courses', 'test-course-1');
      expect(result.ok).toBe(true);
      expect(result.data?.title).toBe('Test Course');
    });
  });

  describe('Storage Buckets', () => {
    it('should have transcripts bucket', async () => {
      const result = await storageApi.listBuckets();
      expect(result.ok).toBe(true);
      expect(result.data).toContain('transcripts');
    });

    it('should have generated-html bucket', async () => {
      const result = await storageApi.listBuckets();
      expect(result.ok).toBe(true);
      expect(result.data).toContain('generated-html');
    });

    it('should be able to upload a transcript', async () => {
      const result = await storageApi.upload(
        'transcripts',
        'test-transcript.txt',
        'This is a test transcript.',
        'text/plain'
      );
      expect(result.ok).toBe(true);
    });

    it('should be able to download the transcript', async () => {
      const result = await storageApi.download('transcripts', 'test-transcript.txt');
      expect(result.ok).toBe(true);
    });

    it('should be able to list files in transcripts bucket', async () => {
      const result = await storageApi.listFiles('transcripts');
      expect(result.ok).toBe(true);
      expect(result.data).toContain('test-transcript.txt');
    });
  });

  // Cleanup test data
  describe('Cleanup', () => {
    it('should delete test data', async () => {
      // Delete test course
      await dataApi.deleteDocument('courses', 'test-course-1');
      // Delete test user
      await dataApi.deleteDocument('users', 'test-user-1');
      // Delete test transcript
      await storageApi.delete('transcripts', 'test-transcript.txt');

      // Verify deletion
      const userResult = await dataApi.getDocument('users', 'test-user-1');
      expect(userResult.ok).toBe(false);

      const courseResult = await dataApi.getDocument('courses', 'test-course-1');
      expect(courseResult.ok).toBe(false);
    });
  });
});