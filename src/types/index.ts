/**
 * Core type definitions for Course Creator App
 * @module types
 */

// Re-export course types from dedicated file
export type {
  CourseMeta,
  StepCheckpoint,
  CourseStep,
  CourseResource,
  CourseDefinition,
  ProcessedStep,
  ProcessedCourse,
  CourseProgress,
  CourseRecord,
} from './course';

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
 * Course status (deprecated - use CourseRecord from './course')
 */
export type CourseStatus = 'draft' | 'processing' | 'ready' | 'published';

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