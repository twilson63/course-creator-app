/**
 * Tests for Refine Service
 *
 * @module tests/lib/course/refine.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectChanges, applyChanges, type DiffResult } from '@/lib/course/refine';
import type { CourseDefinition } from '@/types/course';

// We'll only test the synchronous functions directly
// The async refineCourse function uses createCourseGenerator internally
describe('Refine Service', () => {
  const originalCourse: CourseDefinition = {
    meta: {
      title: 'Original Title',
      description: 'Original description',
      author: 'Test Author',
    },
    steps: [
      { id: 'step-1', title: 'Step 1', content: 'Original content' },
      { id: 'step-2', title: 'Step 2', content: 'Content 2' },
    ],
    resources: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectChanges', () => {
    it('should detect title changes', () => {
      const modified: CourseDefinition = {
        ...originalCourse,
        meta: { ...originalCourse.meta, title: 'New Title' },
      };

      const changes = detectChanges(originalCourse, modified);

      expect(changes).toContainEqual(
        expect.objectContaining({
          type: 'meta',
          field: 'title',
          oldValue: 'Original Title',
          newValue: 'New Title',
        })
      );
    });

    it('should detect description changes', () => {
      const modified: CourseDefinition = {
        ...originalCourse,
        meta: { ...originalCourse.meta, description: 'New description' },
      };

      const changes = detectChanges(originalCourse, modified);

      expect(changes).toContainEqual(
        expect.objectContaining({
          type: 'meta',
          field: 'description',
          oldValue: 'Original description',
          newValue: 'New description',
        })
      );
    });

    it('should detect added steps', () => {
      const modified: CourseDefinition = {
        ...originalCourse,
        steps: [
          ...originalCourse.steps,
          { id: 'step-3', title: 'Step 3', content: 'New step' },
        ],
      };

      const changes = detectChanges(originalCourse, modified);

      expect(changes).toContainEqual(
        expect.objectContaining({
          type: 'step',
          action: 'added',
          stepId: 'step-3',
        })
      );
    });

    it('should detect removed steps', () => {
      const modified: CourseDefinition = {
        ...originalCourse,
        steps: [originalCourse.steps[0]],
      };

      const changes = detectChanges(originalCourse, modified);

      expect(changes).toContainEqual(
        expect.objectContaining({
          type: 'step',
          action: 'removed',
          stepId: 'step-2',
        })
      );
    });

    it('should detect modified step content', () => {
      const modified: CourseDefinition = {
        ...originalCourse,
        steps: [
          { id: 'step-1', title: 'Step 1', content: 'New content' },
          ...originalCourse.steps.slice(1),
        ],
      };

      const changes = detectChanges(originalCourse, modified);

      expect(changes).toContainEqual(
        expect.objectContaining({
          type: 'step',
          action: 'modified',
          stepId: 'step-1',
          field: 'content',
        })
      );
    });

    it('should return empty array for no changes', () => {
      const changes = detectChanges(originalCourse, originalCourse);
      expect(changes).toHaveLength(0);
    });
  });

  describe('applyChanges', () => {
    it('should apply changes to course', () => {
      const changes: DiffResult[] = [
        { type: 'meta', field: 'title', oldValue: 'Original Title', newValue: 'New Title' },
      ];

      const result = applyChanges(originalCourse, changes);

      expect(result.meta.title).toBe('New Title');
    });

    it('should not modify original course', () => {
      const changes: DiffResult[] = [
        { type: 'meta', field: 'title', oldValue: 'Original Title', newValue: 'New Title' },
      ];

      const result = applyChanges(originalCourse, changes);

      expect(originalCourse.meta.title).toBe('Original Title');
      expect(result.meta.title).toBe('New Title');
    });
  });
});