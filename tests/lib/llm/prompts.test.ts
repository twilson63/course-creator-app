/**
 * Tests for LLM Prompts
 *
 * @module tests/lib/llm/prompts.test
 */

import { describe, it, expect } from 'vitest';
import {
  TRANSCRIPT_TO_JSON_PROMPT,
  JSON_TO_HTML_PROMPT,
  REFINE_COURSE_PROMPT,
  REFINE_USER_TEMPLATE,
  formatTranscriptPrompt,
  formatHtmlPrompt,
  formatRefinePrompt,
} from '@/lib/llm/prompts';

describe('LLM Prompts', () => {
  describe('TRANSCRIPT_TO_JSON_PROMPT', () => {
    it('should contain instructions for JSON structure', () => {
      expect(TRANSCRIPT_TO_JSON_PROMPT).toContain('JSON');
      expect(TRANSCRIPT_TO_JSON_PROMPT).toContain('meta');
      expect(TRANSCRIPT_TO_JSON_PROMPT).toContain('steps');
      expect(TRANSCRIPT_TO_JSON_PROMPT).toContain('resources');
    });

    it('should ask for valid JSON only', () => {
      expect(TRANSCRIPT_TO_JSON_PROMPT).toContain('ONLY valid JSON');
    });

    it('should mention timestamps', () => {
      expect(TRANSCRIPT_TO_JSON_PROMPT).toContain('timestamp');
    });
  });

  describe('JSON_TO_HTML_PROMPT', () => {
    it('should contain instructions for HTML generation', () => {
      expect(JSON_TO_HTML_PROMPT).toContain('HTML');
      expect(JSON_TO_HTML_PROMPT).toContain('responsive');
    });

    it('should mention Tailwind CSS', () => {
      expect(JSON_TO_HTML_PROMPT).toContain('Tailwind');
    });

    it('should mention video player', () => {
      expect(JSON_TO_HTML_PROMPT).toContain('video');
    });

    it('should ask for HTML only', () => {
      expect(JSON_TO_HTML_PROMPT).toContain('ONLY the HTML');
    });
  });

  describe('REFINE_COURSE_PROMPT', () => {
    it('should contain instructions for refining', () => {
      expect(REFINE_COURSE_PROMPT).toContain('refine');
      expect(REFINE_COURSE_PROMPT).toContain('JSON');
    });

    it('should use placeholder in user template', () => {
      expect(REFINE_USER_TEMPLATE).toContain('{user_prompt}');
    });
  });

  describe('formatTranscriptPrompt', () => {
    it('should format prompt with video URL and transcript', () => {
      const videoUrl = 'https://youtube.com/watch?v=test';
      const transcript = 'This is a transcript.';

      const result = formatTranscriptPrompt(videoUrl, transcript);

      expect(result).toContain(videoUrl);
      expect(result).toContain(transcript);
      expect(result).toContain('Transcript:');
    });

    it('should handle empty transcript', () => {
      const result = formatTranscriptPrompt('https://youtube.com/watch?v=test', '');

      expect(result).toContain('Video URL');
    });

    it('should handle long transcript', () => {
      const longTranscript = 'a'.repeat(10000);
      const result = formatTranscriptPrompt('https://youtube.com/watch?v=test', longTranscript);

      expect(result).toContain(longTranscript);
    });
  });

  describe('formatHtmlPrompt', () => {
    it('should format prompt with course JSON', () => {
      const courseJson = {
        meta: { title: 'Test Course', description: 'Test' },
        steps: [{ id: '1', title: 'Step 1', content: 'Content' }],
      };

      const result = formatHtmlPrompt(courseJson);

      expect(result).toContain('Test Course');
      expect(result).toContain('Step 1');
    });

    it('should handle complex course JSON', () => {
      const courseJson = {
        meta: {
          title: 'Advanced Course',
          description: 'Complex description',
          author: 'Test Author',
          estimatedTime: '30 minutes',
          difficulty: 'advanced',
        },
        steps: [
          { id: '1', title: 'Step 1', content: 'Content 1' },
          { id: '2', title: 'Step 2', content: 'Content 2' },
        ],
        resources: [
          { label: 'Resource 1', url: 'https://example.com' },
        ],
      };

      const result = formatHtmlPrompt(courseJson);

      expect(result).toContain('Advanced Course');
      expect(result).toContain('Test Author');
      expect(result).toContain('30 minutes');
      expect(result).toContain('Resource 1');
    });
  });

  describe('formatRefinePrompt', () => {
    it('should format prompt with current JSON and user request', () => {
      const courseJson = {
        meta: { title: 'Test Course', description: 'Test' },
        steps: [{ id: '1', title: 'Step 1', content: 'Content' }],
      };
      const userPrompt = 'Make the title more exciting';

      const result = formatRefinePrompt(courseJson, userPrompt);

      expect(result).toContain('Test Course');
      expect(result).toContain('Make the title more exciting');
      expect(result).toContain('ONLY valid JSON');
    });

    it('should handle complex refinement requests', () => {
      const courseJson = {
        meta: { title: 'Course', description: 'Desc' },
        steps: [{ id: '1', title: 'Step', content: 'Content' }],
      };
      const userPrompt = 'Add a step about authentication and update the description to mention security';

      const result = formatRefinePrompt(courseJson, userPrompt);

      expect(result).toContain('authentication');
      expect(result).toContain('security');
    });
  });
});