/**
 * Core type definitions for Course Creator App
 * @module types
 */

// ============================================================================
// API Types
// ============================================================================

/**
 * Hyper-Micro API response wrapper
 */
export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

/**
 * Hyper-Micro document structure
 */
export interface HyperDocument<T = Record<string, unknown>> {
  key: string;
  value: T;
}

// ============================================================================
// User Types
// ============================================================================

/**
 * User record stored in database
 */
export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

/**
 * User session
 */
export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Signup data
 */
export interface SignupData {
  email: string;
  password: string;
}

// ============================================================================
// Course Types
// ============================================================================

/**
 * Course status
 */
export type CourseStatus = 'draft' | 'processing' | 'ready' | 'published';

/**
 * Course metadata
 */
export interface CourseMeta {
  title: string;
  description: string;
  author: string;
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Course checkpoint
 */
export interface CourseCheckpoint {
  label: string;
  hint?: string;
}

/**
 * Course step
 */
export interface CourseStep {
  id: string;
  title: string;
  videoUrl: string;
  videoTimestamp: string;
  videoEndTimestamp?: string;
  content: string;
  estimatedTime: string;
  checkpoint: CourseCheckpoint;
}

/**
 * Course resource
 */
export interface CourseResource {
  label: string;
  url: string;
}

/**
 * Full course JSON structure (from course-creator CLI)
 */
export interface CourseJSON {
  meta: CourseMeta;
  steps: CourseStep[];
  resources?: CourseResource[];
}

/**
 * Course record stored in database
 */
export interface Course {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  video_url: string;
  transcript_key?: string;
  course_json?: CourseJSON;
  generated_html?: string;
  zenbin_id?: string;
  zenbin_url?: string;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Create course input
 */
export interface CreateCourseInput {
  title: string;
  description?: string;
  video_url: string;
  transcript?: string;
}

// ============================================================================
// LLM Types
// ============================================================================

/**
 * LLM prompt types
 */
export type LLMPromptType = 'transcript-to-json' | 'json-to-html' | 'refine-json';

/**
 * LLM request
 */
export interface LLMRequest {
  prompt: string;
  type: LLMPromptType;
  context?: Record<string, unknown>;
}

/**
 * LLM response
 */
export interface LLMResponse {
  ok: boolean;
  content?: string;
  error?: string;
}

// ============================================================================
// Form Types
// ============================================================================

/**
 * Form field error
 */
export interface FormError {
  field: string;
  message: string;
}

/**
 * Form state
 */
export interface FormState<T> {
  data: T;
  errors: FormError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// ============================================================================
// UI Types
// ============================================================================

/**
 * Toast notification type
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

/**
 * Modal state
 */
export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}