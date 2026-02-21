/**
 * Tests for Course Generation Pipeline
 *
 * @module tests/lib/course/pipeline.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CoursePipeline,
  createPipeline,
  PipelineStatus,
  PipelineError,
} from '@/lib/course/pipeline';
import type { CourseDefinition } from '@/types/course';

// Mock the generator
const mockGenerateFromTranscript = vi.fn();
const mockGenerateHTML = vi.fn();
const mockRefineCourse = vi.fn();

vi.mock('@/lib/course/generator', () => ({
  createCourseGenerator: () => ({
    generateFromTranscript: (...args: unknown[]) => mockGenerateFromTranscript(...args),
    generateHTML: (...args: unknown[]) => mockGenerateHTML(...args),
    refineCourse: (...args: unknown[]) => mockRefineCourse(...args),
  }),
}));

describe('Course Pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('run', () => {
    it('should run full pipeline successfully', async () => {
      const mockCourse: CourseDefinition = {
        meta: {
          title: 'Test Course',
          description: 'A test course',
        },
        steps: [
          {
            id: 'step-1',
            title: 'Introduction',
            content: 'Welcome',
          },
        ],
      };

      const mockHTML = '<html><body><h1>Test Course</h1></body></html>';

      mockGenerateFromTranscript.mockResolvedValueOnce(mockCourse);
      mockGenerateHTML.mockResolvedValueOnce(mockHTML);

      const pipeline = createPipeline();
      const result = await pipeline.run({
        transcript: 'This is a transcript...',
        videoUrl: 'https://youtube.com/watch?v=test',
      });

      expect(result.status).toBe('completed');
      expect(result.course).toEqual(mockCourse);
      expect(result.html).toBe(mockHTML);
    });

    it('should track pipeline status through stages', async () => {
      const mockCourse: CourseDefinition = {
        meta: { title: 'Test', description: 'Test' },
        steps: [],
      };
      const mockHTML = '<html></html>';

      mockGenerateFromTranscript.mockResolvedValueOnce(mockCourse);
      mockGenerateHTML.mockResolvedValueOnce(mockHTML);

      const statuses: PipelineStatus[] = [];
      const pipeline = createPipeline({
        onStatusChange: (status) => statuses.push(status),
      });

      await pipeline.run({
        transcript: 'transcript',
        videoUrl: 'https://youtube.com/watch?v=test',
      });

      expect(statuses).toContain('generating-json');
      expect(statuses).toContain('validating-json');
      expect(statuses).toContain('generating-html');
      expect(statuses).toContain('completed');
    });

    it('should handle JSON generation failure', async () => {
      mockGenerateFromTranscript.mockRejectedValueOnce(new Error('LLM failed'));

      const pipeline = createPipeline();

      await expect(
        pipeline.run({
          transcript: 'transcript',
          videoUrl: 'https://youtube.com/watch?v=test',
        })
      ).rejects.toThrow(PipelineError);
    });

    it('should handle HTML generation failure', async () => {
      const mockCourse: CourseDefinition = {
        meta: { title: 'Test', description: 'Test' },
        steps: [],
      };

      mockGenerateFromTranscript.mockResolvedValueOnce(mockCourse);
      mockGenerateHTML.mockRejectedValueOnce(new Error('HTML generation failed'));

      const pipeline = createPipeline();

      await expect(
        pipeline.run({
          transcript: 'transcript',
          videoUrl: 'https://youtube.com/watch?v=test',
        })
      ).rejects.toThrow(PipelineError);
    });

    it('should handle empty transcript', async () => {
      const pipeline = createPipeline();

      await expect(
        pipeline.run({
          transcript: '',
          videoUrl: 'https://youtube.com/watch?v=test',
        })
      ).rejects.toThrow('Transcript is required');
    });
  });

  describe('refine', () => {
    it('should refine an existing course', async () => {
      const currentCourse: CourseDefinition = {
        meta: { title: 'Old', description: 'Old' },
        steps: [],
      };

      const refinedCourse: CourseDefinition = {
        meta: { title: 'New', description: 'New' },
        steps: [],
      };

      mockRefineCourse.mockResolvedValueOnce(refinedCourse);

      const pipeline = createPipeline();
      const result = await pipeline.refine(currentCourse, 'Update title');

      expect(result).toEqual(refinedCourse);
    });

    it('should handle refinement failure', async () => {
      mockRefineCourse.mockRejectedValueOnce(new Error('Refinement failed'));

      const pipeline = createPipeline();
      const course: CourseDefinition = {
        meta: { title: 'Test', description: 'Test' },
        steps: [],
      };

      await expect(pipeline.refine(course, 'Make changes')).rejects.toThrow(PipelineError);
    });
  });

  describe('status', () => {
    it('should start with idle status', () => {
      const pipeline = createPipeline();
      expect(pipeline.getStatus()).toBe('idle');
    });

    it('should update status during pipeline run', async () => {
      const mockCourse: CourseDefinition = {
        meta: { title: 'Test', description: 'Test' },
        steps: [],
      };

      mockGenerateFromTranscript.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockCourse), 50))
      );
      mockGenerateHTML.mockResolvedValueOnce('<html></html>');

      const pipeline = createPipeline();

      const runPromise = pipeline.run({
        transcript: 'transcript',
        videoUrl: 'https://youtube.com/watch?v=test',
      });

      // Check status during run
      expect(['generating-json', 'idle']).toContain(pipeline.getStatus());

      await runPromise;

      expect(pipeline.getStatus()).toBe('completed');
    });
  });

  describe('PipelineError', () => {
    it('should include stage information', () => {
      const error = new PipelineError('Test error', 'generating-json');
      expect(error.stage).toBe('generating-json');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('PipelineError');
    });

    it('should include original error', () => {
      const originalError = new Error('Original');
      const error = new PipelineError('Test error', 'generating-html', originalError);
      expect(error.cause).toBe(originalError);
    });
  });
});