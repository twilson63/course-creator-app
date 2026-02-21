/**
 * Course Refinement Service
 *
 * Handles course refinement via natural language prompts,
 * change detection, and applying changes.
 *
 * @module src/lib/course/refine
 */

import { createCourseGenerator } from './generator';
import type { CourseDefinition, CourseStep } from '@/types/course';

/**
 * Result of change detection between two courses
 */
export interface DiffResult {
  /** Type of change */
  type: 'meta' | 'step' | 'resource';
  /** Field that changed (for meta) */
  field?: string;
  /** Old value */
  oldValue?: string;
  /** New value */
  newValue?: string;
  /** Action (for steps/resources) */
  action?: 'added' | 'removed' | 'modified';
  /** Step ID */
  stepId?: string;
  /** Step title */
  stepTitle?: string;
}

/**
 * Detect changes between two course definitions
 *
 * @param original - Original course
 * @param modified - Modified course
 * @returns Array of detected changes
 */
export function detectChanges(
  original: CourseDefinition,
  modified: CourseDefinition
): DiffResult[] {
  const changes: DiffResult[] = [];

  // Detect meta changes
  const metaFields = ['title', 'description', 'author', 'estimatedTime', 'difficulty'] as const;

  for (const field of metaFields) {
    const oldValue = original.meta[field];
    const newValue = modified.meta[field];

    if (oldValue !== newValue) {
      changes.push({
        type: 'meta',
        field,
        oldValue: oldValue?.toString(),
        newValue: newValue?.toString(),
      });
    }
  }

  // Detect step changes
  const originalSteps = new Map(original.steps.map((s) => [s.id, s]));
  const modifiedSteps = new Map(modified.steps.map((s) => [s.id, s]));

  // Check for removed steps
  for (const [id, step] of originalSteps) {
    if (!modifiedSteps.has(id)) {
      changes.push({
        type: 'step',
        action: 'removed',
        stepId: id,
        stepTitle: step.title,
      });
    }
  }

  // Check for added or modified steps
  for (const [id, step] of modifiedSteps) {
    const originalStep = originalSteps.get(id);

    if (!originalStep) {
      changes.push({
        type: 'step',
        action: 'added',
        stepId: id,
        stepTitle: step.title,
      });
    } else {
      // Check for content changes
      const fields = ['title', 'content', 'videoTimestamp', 'estimatedTime'] as const;

      for (const field of fields) {
        if (originalStep[field] !== step[field]) {
          changes.push({
            type: 'step',
            action: 'modified',
            stepId: id,
            stepTitle: step.title,
            field,
            oldValue: originalStep[field]?.toString(),
            newValue: step[field]?.toString(),
          });
        }
      }
    }
  }

  // Detect resource changes
  const originalResources = new Set(original.resources?.map((r) => r.url) || []);
  const modifiedResources = new Set(modified.resources?.map((r) => r.url) || []);

  for (const url of originalResources) {
    if (!modifiedResources.has(url)) {
      changes.push({
        type: 'resource',
        action: 'removed',
        oldValue: url,
      });
    }
  }

  for (const url of modifiedResources) {
    if (!originalResources.has(url)) {
      changes.push({
        type: 'resource',
        action: 'added',
        newValue: url,
      });
    }
  }

  return changes;
}

/**
 * Refine a course using natural language prompt
 *
 * @param course - Current course definition
 * @param prompt - User's refinement prompt
 * @returns Refined course definition (or original on error)
 */
export async function refineCourse(
  course: CourseDefinition,
  prompt: string
): Promise<CourseDefinition> {
  try {
    const generator = createCourseGenerator();
    const refined = await generator.refineCourse(course, prompt);
    return refined;
  } catch (error) {
    console.error('Failed to refine course:', error);
    // Return original on failure
    return course;
  }
}

/**
 * Apply detected changes to a course
 *
 * @param course - Original course
 * @param changes - Changes to apply
 * @returns New course with changes applied
 */
export function applyChanges(
  course: CourseDefinition,
  changes: DiffResult[]
): CourseDefinition {
  // Start with a deep copy
  const result: CourseDefinition = JSON.parse(JSON.stringify(course));

  for (const change of changes) {
    if (change.type === 'meta' && change.field) {
      // Apply meta changes
      (result.meta as Record<string, unknown>)[change.field] = change.newValue;
    } else if (change.type === 'step') {
      if (change.action === 'added') {
        // Find the step in modified version (this is a simplified implementation)
        // In practice, you'd need the full step data
        const newStep: CourseStep = {
          id: change.stepId!,
          title: change.stepTitle || 'New Step',
          content: '',
        };
        result.steps.push(newStep);
      } else if (change.action === 'removed') {
        result.steps = result.steps.filter((s) => s.id !== change.stepId);
      } else if (change.action === 'modified' && change.field) {
        const step = result.steps.find((s) => s.id === change.stepId);
        if (step) {
          (step as Record<string, unknown>)[change.field] = change.newValue;
        }
      }
    } else if (change.type === 'resource') {
      if (!result.resources) {
        result.resources = [];
      }

      if (change.action === 'removed' && change.oldValue) {
        result.resources = result.resources.filter((r) => r.url !== change.oldValue);
      } else if (change.action === 'added' && change.newValue) {
        result.resources.push({ label: 'Resource', url: change.newValue });
      }
    }
  }

  return result;
}