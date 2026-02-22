/**
 * Tests for ZenBin Publishing Service
 *
 * @module tests/lib/publish/zenbin.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ZenBinClient, publishCourse, generateCourseId, encodeHTML } from '@/lib/publish/zenbin';

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('ZenBin Publishing', () => {
  const mockHTML = '<html><body><h1>Test Course</h1></body></html>';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateCourseId', () => {
    it('should generate a unique ID', () => {
      const id1 = generateCourseId();
      const id2 = generateCourseId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should generate ID with correct length', () => {
      const id = generateCourseId();
      // Base64 URL-safe ID (21 characters = ~128 bits)
      expect(id.length).toBeGreaterThanOrEqual(16);
    });

    it('should generate URL-safe IDs', () => {
      const id = generateCourseId();
      // Should only contain URL-safe characters
      expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe('encodeHTML', () => {
    it('should encode HTML to base64', () => {
      const encoded = encodeHTML(mockHTML);

      expect(encoded).toBeDefined();
      expect(typeof encoded).toBe('string');
      // Should be valid base64
      expect(encoded).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('should encode UTF-8 content correctly', () => {
      const utf8HTML = '<html><body>Héllo Wörld</body></html>';
      const encoded = encodeHTML(utf8HTML);

      // Should be able to decode back
      const decoded = atob(encoded);
      const decoder = new TextDecoder();
      const decodedUTF8 = decoder.decode(new Uint8Array([...decoded].map(c => c.charCodeAt(0))));

      expect(decodedUTF8).toBe(utf8HTML);
    });
  });

  describe('ZenBinClient', () => {
    const client = new ZenBinClient('https://zenbin.example.com');

    describe('publish', () => {
      it('should publish HTML content', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'abc123', url: 'https://zenbin.example.com/p/abc123' }),
        });

        const result = await client.publish(mockHTML);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringMatching(/^https:\/\/zenbin\.example\.com\/v1\/pages\//),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
        expect(result.id).toBe('abc123');
        expect(result.url).toBe('https://zenbin.example.com/p/abc123');
      });

      it('should send base64-encoded content', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'abc123', url: 'https://zenbin.example.com/abc123' }),
        });

        await client.publish(mockHTML);

        const call = mockFetch.mock.calls[0];
        const body = JSON.parse(call[1].body);

        expect(body.encoding).toBe('base64');
        expect(body.html).toBeDefined();
        expect(typeof body.html).toBe('string');
      });

      it('should retry on ID conflict', async () => {
        // First attempt: conflict
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 409,
          json: async () => ({ error: 'ID already exists' }),
        });

        // Second attempt: success
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'new-id', url: 'https://zenbin.example.com/new-id' }),
        });

        const result = await client.publish(mockHTML);

        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(result.id).toBe('new-id');
      });

      it('should fail after max retries on conflict', async () => {
        // Always conflict
        mockFetch.mockResolvedValue({
          ok: false,
          status: 409,
          json: async () => ({ error: 'ID already exists' }),
        });

        await expect(client.publish(mockHTML, { maxRetries: 3 })).rejects.toThrow();
      });

      it('should fail on server error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Internal server error' }),
        });

        await expect(client.publish(mockHTML)).rejects.toThrow();
      });
    });

    describe('get', () => {
      it('should fetch published content', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          text: async () => mockHTML,
        });

        const result = await client.get('abc123');

        expect(mockFetch).toHaveBeenCalledWith('https://zenbin.example.com/p/abc123/raw');
        expect(result.id).toBe('abc123');
        expect(result.content).toBe(mockHTML);
      });

      it('should return null for not found', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

        const result = await client.get('nonexistent');

        expect(result).toBeNull();
      });
    });
  });

  describe('publishCourse', () => {
    it('should publish and return URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'abc123', url: 'https://zenbin.org/p/abc123' }),
      });

      const result = await publishCourse(mockHTML);

      expect(result.url).toBe('https://zenbin.org/p/abc123');
      expect(result.id).toBe('abc123');
    });
  });
});
