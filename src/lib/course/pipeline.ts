/**
 * Course Generation Pipeline
 *
 * Orchestrates the end-to-end course creation flow.
 *
 * @module src/lib/course/pipeline
 */

import { createCourseGenerator, CourseGenerator } from './generator';
import type { CourseDefinition } from '@/types/course';

/**
 * Pipeline status stages
 */
export type PipelineStatus =
  | 'idle'
  | 'generating-json'
  | 'validating-json'
  | 'generating-html'
  | 'completed'
  | 'failed';

/**
 * Pipeline input
 */
export interface PipelineInput {
  transcript: string;
  videoUrl?: string;
}

/**
 * Pipeline result
 */
export interface PipelineResult {
  status: 'completed' | 'failed';
  course?: CourseDefinition;
  html?: string;
  error?: string;
}

/**
 * Pipeline options
 */
export interface PipelineOptions {
  /** Status change callback */
  onStatusChange?: (status: PipelineStatus) => void;
  /** Custom generator */
  generator?: CourseGenerator;
}

/**
 * Pipeline error with stage information
 */
export class PipelineError extends Error {
  constructor(
    message: string,
    public readonly stage: PipelineStatus,
    cause?: Error
  ) {
    super(message);
    this.name = 'PipelineError';
    this.cause = cause;
  }
}

/**
 * Course Pipeline class
 */
export class CoursePipeline {
  private status: PipelineStatus = 'idle';
  private generator: CourseGenerator;
  private onStatusChange?: (status: PipelineStatus) => void;

  constructor(options?: PipelineOptions) {
    this.generator = options?.generator || createCourseGenerator();
    this.onStatusChange = options?.onStatusChange;
  }

  /**
   * Update status and notify listener
   */
  private setStatus(status: PipelineStatus): void {
    this.status = status;
    this.onStatusChange?.(status);
  }

  /**
   * Get current pipeline status
   */
  getStatus(): PipelineStatus {
    return this.status;
  }

  /**
   * Run the full pipeline
   *
   * 1. Generate JSON from transcript
   * 2. Validate JSON
   * 3. Generate HTML from JSON
   *
   * @param input - Pipeline input
   * @returns Pipeline result
   */
  async run(input: PipelineInput): Promise<PipelineResult> {
    // Validate input
    if (!input.transcript || input.transcript.trim() === '') {
      throw new PipelineError('Transcript is required', 'idle');
    }

    try {
      // Stage 1: Generate JSON from transcript
      this.setStatus('generating-json');
      const course = await this.generator.generateFromTranscript(
        input.transcript,
        input.videoUrl
      );

      // Stage 2: Validate JSON (done in generator, but we track status)
      this.setStatus('validating-json');
      // Validation already happened in generateFromTranscript

      // Stage 3: Generate HTML from JSON
      this.setStatus('generating-html');
      const html = await this.generator.generateHTML(course);

      // Complete
      this.setStatus('completed');

      return {
        status: 'completed',
        course,
        html,
      };
    } catch (error) {
      this.setStatus('failed');

      const message =
        error instanceof Error ? error.message : 'Pipeline failed';

      throw new PipelineError(message, this.status, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Refine an existing course
   *
   * @param course - Current course definition
   * @param prompt - User's refinement request
   * @returns Updated course definition
   */
  async refine(course: CourseDefinition, prompt: string): Promise<CourseDefinition> {
    try {
      this.setStatus('generating-json');
      const refined = await this.generator.refineCourse(course, prompt);
      this.setStatus('completed');
      return refined;
    } catch (error) {
      this.setStatus('failed');

      const message =
        error instanceof Error ? error.message : 'Refinement failed';

      throw new PipelineError(message, this.status, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Reset pipeline to idle state
   */
  reset(): void {
    this.setStatus('idle');
  }
}

/**
 * Create a pipeline instance
 */
export function createPipeline(options?: PipelineOptions): CoursePipeline {
  return new CoursePipeline(options);
}