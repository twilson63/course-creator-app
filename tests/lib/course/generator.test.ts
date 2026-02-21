/**
 * Tests for Course Generator
 *
 * @module tests/lib/course/generator.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CourseGenerator, createCourseGenerator } from '@/lib/course/generator';
import type { CourseDefinition } from '@/types/course';
import { LLMError } from '@/lib/llm/client';

// Mock LLM client
const mockGenerateJSON = vi.fn();
const mockGenerateHTML = vi.fn();
const mockRefineJSON = vi.fn();

vi.mock('@/lib/llm/client', () => ({
  llmClient: {
    generateJSON: (...args: unknown[]) => mockGenerateJSON(...args),
    generateHTML: (...args: unknown[]) => mockGenerateHTML(...args),
    refineJSON: (...args: unknown[]) => mockRefineJSON(...args),
  },
  LLMError: class LLMError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'LLMError';
    }
  },
}));

describe('Course Generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('generateFromTranscript', () => {
    it('should generate course JSON from transcript', async () => {
      const mockCourse: CourseDefinition = {
        meta: {
          title: 'Test Course',
          description: 'A test course',
          author: 'Test Author',
          estimatedTime: '30 minutes',
          difficulty: 'beginner',
        },
        steps: [
          {
            id: 'step-1',
            title: 'Introduction',
            content: 'Welcome to the course',
            videoTimestamp: '0:00',
            estimatedTime: '5 minutes',
          },
        ],
        resources: [],
      };

      mockGenerateJSON.mockResolvedValueOnce(mockCourse);

      const generator = createCourseGenerator();
      const result = await generator.generateFromTranscript(
        'This is a transcript...',
        'https://youtube.com/watch?v=test'
      );

      expect(mockGenerateJSON).toHaveBeenCalledWith(
        'This is a transcript...',
        'https://youtube.com/watch?v=test'
      );
      expect(result).toEqual(mockCourse);
    });

    it('should validate generated JSON', async () => {
      const invalidCourse = {
        meta: {
          title: 'Test',
          // Missing description
        },
        steps: [],
      };

      mockGenerateJSON.mockResolvedValueOnce(invalidCourse);

      const generator = createCourseGenerator();

      await expect(
        generator.generateFromTranscript('transcript', 'https://youtube.com/watch?v=test')
      ).rejects.toThrow('Invalid course JSON');
    });

    it('should handle LLM errors', async () => {
      mockGenerateJSON.mockRejectedValueOnce(new LLMError('API error'));

      const generator = createCourseGenerator();

      await expect(
        generator.generateFromTranscript('transcript', 'https://youtube.com/watch?v=test')
      ).rejects.toThrow('API error');
    });
  });

  describe('generateHTML', () => {
    it('should generate HTML from course JSON', async () => {
      const course: CourseDefinition = {
        meta: { title: 'Test', description: 'Test' },
        steps: [{ id: '1', title: 'Step 1', content: 'Content' }],
      };

      const mockHTML = '<html><body><h1>Test Course</h1></body></html>';
      mockGenerateHTML.mockResolvedValueOnce(mockHTML);

      const generator = createCourseGenerator();
      const result = await generator.generateHTML(course);

      expect(mockGenerateHTML).toHaveBeenCalledWith(course);
      expect(result).toBe(mockHTML);
    });

    it('should handle HTML generation errors', async () => {
      mockGenerateHTML.mockRejectedValueOnce(new LLMError('Failed to generate HTML'));

      const generator = createCourseGenerator();
      const course: CourseDefinition = {
        meta: { title: 'Test', description: 'Test' },
        steps: [],
      };

      await expect(generator.generateHTML(course)).rejects.toThrow('Failed to generate HTML');
    });
  });

  describe('refineCourse', () => {
    it('should refine course based on user prompt', async () => {
      const currentCourse: CourseDefinition = {
        meta: { title: 'Old Title', description: 'Old description' },
        steps: [{ id: '1', title: 'Step 1', content: 'Content' }],
      };

      const refinedCourse: CourseDefinition = {
        meta: { title: 'New Title', description: 'Updated description' },
        steps: [{ id: '1', title: 'Step 1', content: 'Updated content' }],
      };

      mockRefineJSON.mockResolvedValueOnce(refinedCourse);

      const generator = createCourseGenerator();
      const result = await generator.refineCourse(currentCourse, 'Update the title');

      expect(mockRefineJSON).toHaveBeenCalledWith(currentCourse, 'Update the title');
      expect(result.meta.title).toBe('New Title');
    });

    it('should validate refined JSON', async () => {
      const currentCourse: CourseDefinition = {
        meta: { title: 'Test', description: 'Test' },
        steps: [],
      };

      const invalidCourse = {
        meta: { title: 'Test' },
      };

      mockRefineJSON.mockResolvedValueOnce(invalidCourse);

      const generator = createCourseGenerator();

      await expect(
        generator.refineCourse(currentCourse, 'Make changes')
      ).rejects.toThrow('Invalid course JSON');
    });
  });

  describe('createCourseGenerator', () => {
    it('should create a generator instance', () => {
      const generator = createCourseGenerator();
      expect(generator).toBeDefined();
      expect(generator.generateFromTranscript).toBeTypeOf('function');
      expect(generator.generateHTML).toBeTypeOf('function');
      expect(generator.refineCourse).toBeTypeOf('function');
    });
  });
});