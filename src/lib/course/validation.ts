/**
 * Course Validation
 *
 * Validation functions for course data structures.
 *
 * @module src/lib/course/validation
 */

import type {
  CourseMeta,
  CourseStep,
  CourseDefinition,
  CourseResource,
} from '@/types/course';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Supported video platforms
 */
const VIDEO_PLATFORMS = [
  'youtube.com',
  'youtu.be',
  'loom.com',
  'vimeo.com',
  'descript.com',
];

/**
 * Validate course metadata
 *
 * @param meta - Course metadata to validate
 * @returns Validation result with errors if any
 */
export function validateCourseMeta(meta: Partial<CourseMeta>): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!meta.title?.trim()) {
    errors.push('title is required');
  } else if (meta.title.length > 200) {
    errors.push('title must be 200 characters or less');
  }

  if (!meta.description?.trim()) {
    errors.push('description is required');
  } else if (meta.description.length > 2000) {
    errors.push('description must be 2000 characters or less');
  }

  // Optional fields
  if (meta.author && meta.author.length > 100) {
    errors.push('author must be 100 characters or less');
  }

  if (meta.estimatedTime && meta.estimatedTime.length > 50) {
    errors.push('estimatedTime must be 50 characters or less');
  }

  if (meta.difficulty) {
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(meta.difficulty)) {
      errors.push('difficulty must be beginner, intermediate, or advanced');
    }
  }

  if (meta.prerequisites && !Array.isArray(meta.prerequisites)) {
    errors.push('prerequisites must be an array');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a course step
 *
 * @param step - Step to validate
 * @param index - Step index for error messages
 * @returns Validation result with errors if any
 */
export function validateCourseStep(step: Partial<CourseStep>, index?: number): ValidationResult {
  const errors: string[] = [];
  const prefix = index !== undefined ? `step ${index + 1}: ` : '';

  // Required fields
  if (!step.id?.trim()) {
    errors.push(`${prefix}id is required`);
  } else if (!/^[a-zA-Z0-9_-]+$/.test(step.id)) {
    errors.push(`${prefix}id must contain only letters, numbers, hyphens, and underscores`);
  }

  if (!step.title?.trim()) {
    errors.push(`${prefix}title is required`);
  } else if (step.title.length > 200) {
    errors.push(`${prefix}title must be 200 characters or less`);
  }

  if (!step.content?.trim()) {
    errors.push(`${prefix}content is required`);
  }

  // Optional fields
  if (!isValidVideoUrl(step.videoUrl)) {
    errors.push(`${prefix}videoUrl must be a valid YouTube, Loom, Vimeo, or Descript URL`);
  }

  if (!isValidTimestamp(step.videoTimestamp)) {
    errors.push(`${prefix}videoTimestamp must be in format "M:SS", "H:MM:SS", or seconds`);
  }

  if (step.checkpoint) {
    if (!step.checkpoint.label?.trim()) {
      errors.push(`${prefix}checkpoint.label is required`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a course resource
 *
 * @param resource - Resource to validate
 * @returns Validation result with errors if any
 */
export function validateCourseResource(resource: Partial<CourseResource>): ValidationResult {
  const errors: string[] = [];

  if (!resource.label?.trim()) {
    errors.push('resource label is required');
  }

  if (!resource.url?.trim()) {
    errors.push('resource url is required');
  } else {
    try {
      new URL(resource.url);
    } catch {
      errors.push('resource url must be a valid URL');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a complete course definition
 *
 * @param course - Course definition to validate
 * @returns Validation result with errors if any
 */
export function validateCourseDefinition(course: Partial<CourseDefinition>): ValidationResult {
  const errors: string[] = [];

  // Validate meta
  if (!course.meta) {
    errors.push('meta is required');
  } else {
    const metaResult = validateCourseMeta(course.meta);
    errors.push(
      ...metaResult.errors.map((e) => `meta.${e}`)
    );
  }

  // Validate steps
  if (!course.steps) {
    errors.push('steps is required');
  } else if (!Array.isArray(course.steps)) {
    errors.push('steps must be an array');
  } else if (course.steps.length === 0) {
    errors.push('steps must have at least one step');
  } else {
    // Check for duplicate IDs
    const stepIds = new Set<string>();
    course.steps.forEach((step, index) => {
      const stepResult = validateCourseStep(step, index);
      errors.push(...stepResult.errors);

      if (step.id) {
        if (stepIds.has(step.id)) {
          errors.push(`duplicate step id: ${step.id}`);
        }
        stepIds.add(step.id);
      }
    });
  }

  // Validate resources if present
  if (course.resources) {
    if (!Array.isArray(course.resources)) {
      errors.push('resources must be an array');
    } else {
      course.resources.forEach((resource, index) => {
        const resourceResult = validateCourseResource(resource);
        errors.push(
          ...resourceResult.errors.map((e) => `resource ${index + 1}: ${e}`)
        );
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if URL is from a supported video platform
 *
 * @param url - URL to check
 * @returns true if valid video URL or undefined
 */
export function isValidVideoUrl(url?: string): boolean {
  if (!url) return true;

  try {
    const parsed = new URL(url);
    return VIDEO_PLATFORMS.some((platform) => parsed.hostname.includes(platform));
  } catch {
    return false;
  }
}

/**
 * Validate timestamp format
 *
 * Accepts:
 * - "M:SS" (e.g., "1:30")
 * - "H:MM:SS" (e.g., "1:30:00")
 * - Seconds as number string (e.g., "90")
 *
 * @param timestamp - Timestamp to validate
 * @returns true if valid format or undefined
 */
export function isValidTimestamp(timestamp?: string): boolean {
  if (!timestamp) return true;

  // Check if it's a simple number (seconds)
  if (/^\d+$/.test(timestamp)) {
    return true;
  }

  // Check "M:SS" format (0-999 minutes, 00-59 seconds)
  if (/^\d{1,3}:[0-5]\d$/.test(timestamp)) {
    return true;
  }

  // Check "H:MM:SS" format (0-99 hours, 00-59 minutes, 00-59 seconds)
  if (/^\d{1,2}:[0-5]\d:[0-5]\d$/.test(timestamp)) {
    return true;
  }

  return false;
}