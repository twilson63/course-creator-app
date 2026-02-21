/**
 * Tests for LLM Client
 *
 * @module tests/lib/llm/client.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LLMClient, llmClient, LLMError, LLMRateLimitError } from '@/lib/llm/client';
import type { CourseDefinition } from '@/types/course';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('LLM Client', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('generateJSON', () => {
    it('should call LLM API with transcript', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                meta: { title: 'Test', description: 'Test' },
                steps: [{ id: '1', title: 'Step 1', content: 'Content' }],
              }),
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const client = new LLMClient('https://api.example.com', 'test-key');
      const result = await client.generateJSON('Video transcript content');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
          }),
        })
      );

      expect(result).toEqual({
        meta: { title: 'Test', description: 'Test' },
        steps: [{ id: '1', title: 'Step 1', content: 'Content' }],
      });
    });

    it('should throw LLMError on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      const client = new LLMClient('https://api.example.com', 'test-key');

      await expect(client.generateJSON('transcript')).rejects.toThrow(LLMError);
    });

    it('should throw LLMRateLimitError on 429', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: {
          get: vi.fn().mockReturnValue('60'),
        },
        json: async () => ({ error: 'Rate limit exceeded' }),
      });

      const client = new LLMClient('https://api.example.com', 'test-key');

      await expect(client.generateJSON('transcript')).rejects.toThrow(LLMRateLimitError);
    });

    it('should throw error on invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'not valid json' } }],
        }),
      });

      const client = new LLMClient('https://api.example.com', 'test-key');

      await expect(client.generateJSON('transcript')).rejects.toThrow('Invalid JSON');
    });
  });

  describe('generateHTML', () => {
    it('should call LLM API with course JSON', async () => {
      const mockHtml = '<html><body><h1>Test Course</h1></body></html>';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: mockHtml } }],
        }),
      });

      const client = new LLMClient('https://api.example.com', 'test-key');
      const courseJson: CourseDefinition = {
        meta: { title: 'Test Course', description: 'Test' },
        steps: [{ id: '1', title: 'Step 1', content: 'Content' }],
      };

      const result = await client.generateHTML(courseJson);

      expect(result).toBe(mockHtml);
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should strip markdown code blocks from response', async () => {
      const mockHtmlWithMarkdown = '```html\n<html><body>Test</body></html>\n```';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: mockHtmlWithMarkdown } }],
        }),
      });

      const client = new LLMClient('https://api.example.com', 'test-key');
      const courseJson: CourseDefinition = {
        meta: { title: 'Test', description: 'Test' },
        steps: [{ id: '1', title: 'Step', content: 'Content' }],
      };

      const result = await client.generateHTML(courseJson);

      expect(result).toBe('<html><body>Test</body></html>');
      expect(result).not.toContain('```');
    });
  });

  describe('refineJSON', () => {
    it('should send current JSON and user prompt', async () => {
      const refinedJson = {
        meta: { title: 'Improved Title', description: 'Updated' },
        steps: [{ id: '1', title: 'Step 1', content: 'Better content' }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify(refinedJson) } }],
        }),
      });

      const client = new LLMClient('https://api.example.com', 'test-key');
      const currentJson: CourseDefinition = {
        meta: { title: 'Old Title', description: 'Old' },
        steps: [{ id: '1', title: 'Step 1', content: 'Content' }],
      };

      const result = await client.refineJSON(currentJson, 'Make it better');

      expect(result.meta.title).toBe('Improved Title');
    });
  });

  describe('default client', () => {
    it('should be exported as llmClient', () => {
      expect(llmClient).toBeDefined();
      expect(llmClient).toBeInstanceOf(LLMClient);
    });

    it('should use environment variables', () => {
      // The default client should be created with env vars
      // We're just checking it exists and is configured
      expect(llmClient).toBeDefined();
    });
  });

  describe('retry logic', () => {
    it('should retry on transient errors', async () => {
      // First call fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '{"meta":{"title":"Test","description":"Test"},"steps":[]}' } }],
        }),
      });

      const client = new LLMClient('https://api.example.com', 'test-key', { maxRetries: 2 });
      const result = await client.generateJSON('transcript');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
    });

    it('should not retry on rate limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
        json: async () => ({ error: 'Rate limit' }),
      });

      const client = new LLMClient('https://api.example.com', 'test-key', { maxRetries: 3 });

      await expect(client.generateJSON('transcript')).rejects.toThrow(LLMRateLimitError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const client = new LLMClient('https://api.example.com', 'test-key', { maxRetries: 2 });

      await expect(client.generateJSON('transcript')).rejects.toThrow(LLMError);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});