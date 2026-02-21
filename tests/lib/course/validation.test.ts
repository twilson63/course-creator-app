/**
 * Tests for Course Type Validation
 *
 * @module tests/lib/course/validation.test
 */

import { describe, it, expect } from 'vitest';
import {
  validateCourseMeta,
  validateCourseStep,
  validateCourseDefinition,
  isValidVideoUrl,
  isValidTimestamp,
} from '@/lib/course/validation';
import type { CourseMeta, CourseStep, CourseDefinition } from '@/types/course';

describe('Course Validation', () => {
  describe('validateCourseMeta', () => {
    it('should accept valid meta with required fields', () => {
      const meta: CourseMeta = {
        title: 'Test Course',
        description: 'A test course',
      };
      const result = validateCourseMeta(meta);
      expect(result.valid).toBe(true);
    });

    it('should accept valid meta with all fields', () => {
      const meta: CourseMeta = {
        title: 'Test Course',
        description: 'A test course',
        author: 'Test Author',
        estimatedTime: '10 minutes',
        difficulty: 'intermediate',
        prerequisites: ['Basic knowledge'],
        icon: '📚',
      };
      const result = validateCourseMeta(meta);
      expect(result.valid).toBe(true);
    });

    it('should reject meta without title', () => {
      const meta = { description: 'A test course' } as CourseMeta;
      const result = validateCourseMeta(meta);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('title is required');
    });

    it('should reject meta without description', () => {
      const meta = { title: 'Test Course' } as CourseMeta;
      const result = validateCourseMeta(meta);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('description is required');
    });

    it('should reject invalid difficulty', () => {
      const meta: CourseMeta = {
        title: 'Test',
        description: 'Test',
        difficulty: 'expert' as 'beginner' | 'intermediate' | 'advanced',
      };
      const result = validateCourseMeta(meta);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('difficulty'))).toBe(true);
    });

    it('should reject title over 200 characters', () => {
      const meta: CourseMeta = {
        title: 'a'.repeat(201),
        description: 'Test',
      };
      const result = validateCourseMeta(meta);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('title'))).toBe(true);
    });
  });

  describe('validateCourseStep', () => {
    it('should accept valid step with required fields', () => {
      const step: CourseStep = {
        id: 'step-1',
        title: 'First Step',
        content: 'This is the content',
      };
      const result = validateCourseStep(step);
      expect(result.valid).toBe(true);
    });

    it('should accept step with all optional fields', () => {
      const step: CourseStep = {
        id: 'step-1',
        title: 'First Step',
        videoUrl: 'https://www.youtube.com/watch?v=abc123',
        videoTimestamp: '1:30',
        content: 'Content here',
        estimatedTime: '5 minutes',
        checkpoint: {
          label: 'I understand this step',
          hint: 'Check this box when done',
        },
      };
      const result = validateCourseStep(step);
      expect(result.valid).toBe(true);
    });

    it('should reject step without id', () => {
      const step = { title: 'Step', content: 'Content' } as CourseStep;
      const result = validateCourseStep(step);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('id is required');
    });

    it('should reject step without title', () => {
      const step = { id: 'step-1', content: 'Content' } as CourseStep;
      const result = validateCourseStep(step);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('title is required');
    });

    it('should reject step without content', () => {
      const step = { id: 'step-1', title: 'Step' } as CourseStep;
      const result = validateCourseStep(step);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('content is required');
    });

    it('should reject step with invalid videoUrl', () => {
      const step: CourseStep = {
        id: 'step-1',
        title: 'Step',
        content: 'Content',
        videoUrl: 'not-a-valid-url',
      };
      const result = validateCourseStep(step);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('videoUrl'))).toBe(true);
    });

    it('should reject step with invalid timestamp format', () => {
      const step: CourseStep = {
        id: 'step-1',
        title: 'Step',
        content: 'Content',
        videoTimestamp: 'invalid',
      };
      const result = validateCourseStep(step);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('videoTimestamp'))).toBe(true);
    });
  });

  describe('validateCourseDefinition', () => {
    it('should accept valid course definition', () => {
      const course: CourseDefinition = {
        meta: { title: 'Course', description: 'Description' },
        steps: [{ id: 'step-1', title: 'Step', content: 'Content' }],
      };
      const result = validateCourseDefinition(course);
      expect(result.valid).toBe(true);
    });

    it('should reject definition without steps', () => {
      const course = {
        meta: { title: 'Course', description: 'Description' },
      } as CourseDefinition;
      const result = validateCourseDefinition(course);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('steps'))).toBe(true);
    });

    it('should reject definition with empty steps', () => {
      const course: CourseDefinition = {
        meta: { title: 'Course', description: 'Description' },
        steps: [],
      };
      const result = validateCourseDefinition(course);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('steps must have at least one step');
    });

    it('should reject definition with duplicate step ids', () => {
      const course: CourseDefinition = {
        meta: { title: 'Course', description: 'Description' },
        steps: [
          { id: 'step-1', title: 'First', content: 'A' },
          { id: 'step-1', title: 'Second', content: 'B' },
        ],
      };
      const result = validateCourseDefinition(course);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('duplicate'))).toBe(true);
    });

    it('should validate resources if present', () => {
      const course: CourseDefinition = {
        meta: { title: 'Course', description: 'Description' },
        steps: [{ id: 'step-1', title: 'Step', content: 'Content' }],
        resources: [{ label: '', url: 'invalid' }],
      };
      const result = validateCourseDefinition(course);
      expect(result.valid).toBe(false);
    });
  });

  describe('isValidVideoUrl', () => {
    it('should accept YouTube URLs', () => {
      expect(isValidVideoUrl('https://www.youtube.com/watch?v=abc123')).toBe(true);
      expect(isValidVideoUrl('https://youtu.be/abc123')).toBe(true);
    });

    it('should accept Loom URLs', () => {
      expect(isValidVideoUrl('https://www.loom.com/share/abc123')).toBe(true);
    });

    it('should accept Vimeo URLs', () => {
      expect(isValidVideoUrl('https://vimeo.com/123456789')).toBe(true);
    });

    it('should accept Descript URLs', () => {
      expect(isValidVideoUrl('https://share.descript.com/view/abc123')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidVideoUrl('not-a-url')).toBe(false);
      expect(isValidVideoUrl('https://example.com/video')).toBe(false);
    });

    it('should accept undefined', () => {
      expect(isValidVideoUrl(undefined)).toBe(true);
    });
  });

  describe('isValidTimestamp', () => {
    it('should accept "M:SS" format', () => {
      expect(isValidTimestamp('1:30')).toBe(true);
      expect(isValidTimestamp('0:00')).toBe(true);
      expect(isValidTimestamp('10:45')).toBe(true);
    });

    it('should accept "H:MM:SS" format', () => {
      expect(isValidTimestamp('1:30:00')).toBe(true);
      expect(isValidTimestamp('2:15:30')).toBe(true);
    });

    it('should accept seconds as number string', () => {
      expect(isValidTimestamp('90')).toBe(true);
      expect(isValidTimestamp('0')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidTimestamp('1:60')).toBe(false); // 60 seconds invalid
      expect(isValidTimestamp('1:2')).toBe(false); // Needs leading zero
      expect(isValidTimestamp('abc')).toBe(false);
    });

    it('should accept undefined', () => {
      expect(isValidTimestamp(undefined)).toBe(true);
    });
  });
});