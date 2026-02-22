/**
 * Course Type Definitions
 *
 * Types for course data structures, matching the course-creator CLI schema.
 *
 * @module src/types/course
 */

/**
 * Course metadata
 */
export interface CourseMeta {
  /** Course title */
  title: string;
  /** Course description */
  description: string;
  /** Author name */
  author?: string;
  /** Estimated time to complete (e.g., "15 minutes") */
  estimatedTime?: string;
  /** Difficulty level */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  /** Prerequisites for the course */
  prerequisites?: string[];
  /** Icon/emoji for the course */
  icon?: string;
}

/**
 * Step checkpoint for progress tracking
 */
export interface StepCheckpoint {
  /** Label for the checkpoint (e.g., "I understand this concept") */
  label: string;
  /** Optional hint text */
  hint?: string;
}

/**
 * Individual step in a course
 */
export interface CourseStep {
  /** Unique step identifier */
  id: string;
  /** Step title */
  title: string;
  /** Video URL (YouTube, Loom, Vimeo, Descript) */
  videoUrl?: string;
  /** Video timestamp (e.g., "1:30" or "90" seconds) */
  videoTimestamp?: string;
  /** Step content (markdown text or path to markdown file) */
  content: string;
  /** Estimated time for this step */
  estimatedTime?: string;
  /** Optional checkpoint for progress tracking */
  checkpoint?: StepCheckpoint;
}

/**
 * External resource link
 */
export interface CourseResource {
  /** Resource label */
  label: string;
  /** Resource URL */
  url: string;
  /** Optional description */
  description?: string;
}

/**
 * Published URL history entry
 */
export interface PublishHistoryEntry {
  /** ZenBin published ID */
  zenbin_id: string;
  /** ZenBin published URL */
  zenbin_url: string;
  /** Publish timestamp */
  published_at: string;
}

/**
 * Full course definition (source format)
 */
export interface CourseDefinition {
  /** Course metadata */
  meta: CourseMeta;
  /** Course steps */
  steps: CourseStep[];
  /** Optional transcript file path */
  transcript?: string;
  /** Optional external resources */
  resources?: CourseResource[];
}

/**
 * Processed step (ready for rendering)
 */
export interface ProcessedStep {
  /** Step ID */
  id: string;
  /** Step title */
  title: string;
  /** Embedded video URL (converted for embedding) */
  videoEmbedUrl?: string;
  /** HTML content from markdown */
  contentHtml: string;
  /** Estimated time */
  estimatedTime?: string;
  /** Checkpoint */
  checkpoint?: StepCheckpoint;
}

/**
 * Processed course (ready for rendering)
 */
export interface ProcessedCourse {
  /** Course metadata */
  meta: CourseMeta;
  /** Processed steps */
  steps: ProcessedStep[];
  /** External resources */
  resources?: CourseResource[];
}

/**
 * Course progress tracking (stored in localStorage)
 */
export interface CourseProgress {
  /** Course ID */
  courseId: string;
  /** Current step index */
  currentStepIndex: number;
  /** IDs of completed steps */
  completedStepIds: string[];
  /** When progress started */
  startedAt: string;
  /** Last visit timestamp */
  lastVisitedAt: string;
}

/**
 * Course record stored in database
 */
export interface CourseRecord {
  /** Unique course ID */
  id: string;
  /** Owner user ID */
  user_id: string;
  /** Course title (duplicate for querying) */
  title: string;
  /** Course description */
  description?: string;
  /** Video URL */
  video_url?: string;
  /** Transcript storage key */
  transcript_key?: string;
  /** Course JSON (full CourseDefinition) */
  course_json?: CourseDefinition;
  /** Legacy course definition key (backward compatibility) */
  definition?: CourseDefinition;
  /** Generated HTML for publishing */
  generated_html?: string;
  /** ZenBin published ID */
  zenbin_id?: string;
  /** ZenBin published URL */
  zenbin_url?: string;
  /** Publish history (new URL each publish) */
  publish_history?: PublishHistoryEntry[];
  /** Course status */
  status: 'draft' | 'processing' | 'ready' | 'published';
  /** Created timestamp */
  created_at: string;
  /** Updated timestamp */
  updated_at: string;
}
