/**
 * Tests for Course Delete Service
 *
 * @module tests/lib/course/delete.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteCourse, archiveCourse } from '@/lib/course/delete';

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Course Delete Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deleteCourse', () => {
    it('should delete course by ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await deleteCourse('course-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/courses/course-123'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      });

      const result = await deleteCourse('nonexistent');

      expect(result).toBe(false);
    });

    it('should throw on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(deleteCourse('course-123')).rejects.toThrow('Network error');
    });
  });

  describe('archiveCourse', () => {
    it('should archive course by ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, archived: true }),
      });

      const result = await archiveCourse('course-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/courses/course-123/archive'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await archiveCourse('course-123');

      expect(result).toBe(false);
    });
  });
});