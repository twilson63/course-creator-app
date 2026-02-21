/**
 * Course Generator Service
 *
 * Handles LLM-based course generation from transcripts.
 *
 * @module src/lib/course/generator
 */

import { llmClient, LLMError } from '@/lib/llm/client';
import type { CourseDefinition } from '@/types/course';
import { validateCourseDefinition } from './validation';

/**
 * Generator options
 */
export interface GeneratorOptions {
  /** Custom LLM client */
  llmClient?: typeof llmClient;
}

/**
 * Generator result
 */
export interface GeneratorResult {
  course: CourseDefinition;
  rawJSON: string;
}

/**
 * Course Generator class
 */
export class CourseGenerator {
  private client: typeof llmClient;

  constructor(options?: GeneratorOptions) {
    this.client = options?.llmClient || llmClient;
  }

  /**
   * Generate course JSON from a video transcript
   *
   * @param transcript - Video transcript text
   * @param videoUrl - Optional video URL
   * @returns Generated course definition
   * @throws Error if generation fails or JSON is invalid
   */
  async generateFromTranscript(
    transcript: string,
    videoUrl?: string
  ): Promise<CourseDefinition> {
    try {
      const course = await this.client.generateJSON(transcript, videoUrl);

      // Validate the generated JSON
      const validation = validateCourseDefinition(course);
      if (!validation.valid) {
        throw new Error(`Invalid course JSON: ${validation.errors.join(', ')}`);
      }

      return course;
    } catch (error) {
      if (error instanceof LLMError) {
        throw error;
      }
      throw new Error(
        error instanceof Error ? error.message : 'Failed to generate course'
      );
    }
  }

  /**
   * Generate HTML from a course definition
   *
   * @param course - Course definition
   * @returns HTML string
   * @throws Error if generation fails
   */
  async generateHTML(course: CourseDefinition): Promise<string> {
    try {
      const html = await this.client.generateHTML(course);
      return html;
    } catch (error) {
      if (error instanceof LLMError) {
        throw error;
      }
      throw new Error(
        error instanceof Error ? error.message : 'Failed to generate HTML'
      );
    }
  }

  /**
   * Refine an existing course based on user prompt
   *
   * @param course - Current course definition
   * @param prompt - User's refinement request
   * @returns Updated course definition
   * @throws Error if refinement fails or JSON is invalid
   */
  async refineCourse(
    course: CourseDefinition,
    prompt: string
  ): Promise<CourseDefinition> {
    try {
      const refined = await this.client.refineJSON(course, prompt);

      // Validate the refined JSON
      const validation = validateCourseDefinition(refined);
      if (!validation.valid) {
        throw new Error(`Invalid course JSON: ${validation.errors.join(', ')}`);
      }

      return refined;
    } catch (error) {
      if (error instanceof LLMError) {
        throw error;
      }
      throw new Error(
        error instanceof Error ? error.message : 'Failed to refine course'
      );
    }
  }
}

/**
 * Create a course generator instance
 */
export function createCourseGenerator(options?: GeneratorOptions): CourseGenerator {
  return new CourseGenerator(options);
}