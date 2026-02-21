/**
 * Tests for Transcript Upload
 *
 * @module tests/lib/course/transcript.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateTranscriptFile,
  parseTranscript,
  formatTranscriptKey,
  TranscriptUploadError,
} from '@/lib/course/transcript';

describe('Transcript Upload', () => {
  describe('validateTranscriptFile', () => {
    it('should accept .txt files', () => {
      const file = new File(['transcript content'], 'transcript.txt', {
        type: 'text/plain',
      });
      const result = validateTranscriptFile(file);
      expect(result.valid).toBe(true);
    });

    it('should accept .md files', () => {
      const file = new File(['# Transcript', 'content'], 'transcript.md', {
        type: 'text/markdown',
      });
      const result = validateTranscriptFile(file);
      expect(result.valid).toBe(true);
    });

    it('should accept .json files', () => {
      const file = new File(['{"transcript": "content"}'], 'transcript.json', {
        type: 'application/json',
      });
      const result = validateTranscriptFile(file);
      expect(result.valid).toBe(true);
    });

    it('should reject unsupported file types', () => {
      const file = new File(['content'], 'transcript.pdf', {
        type: 'application/pdf',
      });
      const result = validateTranscriptFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported file type');
    });

    it('should reject files larger than 1MB', () => {
      // Create a file larger than 1MB
      const largeContent = 'x'.repeat(1024 * 1024 + 1);
      const file = new File([largeContent], 'transcript.txt', {
        type: 'text/plain',
      });
      const result = validateTranscriptFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File too large');
    });

    it('should accept files exactly 1MB', () => {
      const content = 'x'.repeat(1024 * 1024);
      const file = new File([content], 'transcript.txt', {
        type: 'text/plain',
      });
      const result = validateTranscriptFile(file);
      expect(result.valid).toBe(true);
    });

    it('should accept files without explicit MIME type', () => {
      const file = new File(['content'], 'transcript.txt');
      const result = validateTranscriptFile(file);
      expect(result.valid).toBe(true);
    });
  });

  describe('parseTranscript', () => {
    it('should parse plain text transcript', async () => {
      const content = 'This is a transcript.\nWith multiple lines.';
      const result = await parseTranscript(content, 'txt');
      expect(result).toBe(content);
    });

    it('should parse markdown transcript', async () => {
      const content = '# Title\n\nThis is a transcript.';
      const result = await parseTranscript(content, 'md');
      expect(result).toBe(content);
    });

    it('should parse JSON transcript', async () => {
      const content = '{"transcript": "This is a transcript."}';
      const result = await parseTranscript(content, 'json');
      expect(result).toBe('This is a transcript.');
    });

    it('should throw error for invalid JSON', async () => {
      const content = '{"invalid": json}';
      await expect(parseTranscript(content, 'json')).rejects.toThrow(
        TranscriptUploadError
      );
    });

    it('should handle JSON with text field', async () => {
      const content = '{"text": "This is the transcript text."}';
      const result = await parseTranscript(content, 'json');
      expect(result).toBe('This is the transcript text.');
    });

    it('should handle JSON with content field', async () => {
      const content = '{"content": "This is the transcript content."}';
      const result = await parseTranscript(content, 'json');
      expect(result).toBe('This is the transcript content.');
    });

    it('should return raw string for unknown JSON structure', async () => {
      const content = '{"data": "some data"}';
      const result = await parseTranscript(content, 'json');
      expect(result).toBe(content);
    });
  });

  describe('formatTranscriptKey', () => {
    it('should generate unique key with userId and courseId', () => {
      const key = formatTranscriptKey('user123', 'course456', 'transcript.txt');
      expect(key).toContain('user123');
      expect(key).toContain('course456');
      expect(key).toContain('transcript.txt');
    });

    it('should include timestamp for uniqueness', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T10:30:00Z'));

      const key = formatTranscriptKey('user123', 'course456', 'transcript.txt');
      expect(key).toMatch(/2024-01-15/);

      vi.useRealTimers();
    });

    it('should sanitize filename', () => {
      const key = formatTranscriptKey('user123', 'course456', 'my transcript file.txt');
      expect(key).not.toContain(' ');
    });
  });
});