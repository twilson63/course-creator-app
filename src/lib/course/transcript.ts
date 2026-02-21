/**
 * Transcript Upload Utilities
 *
 * Handles file validation, parsing, and storage key generation for transcript files.
 *
 * @module src/lib/course/transcript
 */

/** Maximum file size in bytes (1MB) */
const MAX_FILE_SIZE = 1024 * 1024;

/** Allowed file extensions */
const ALLOWED_EXTENSIONS = ['txt', 'md', 'json'];

/** Allowed MIME types */
const ALLOWED_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'application/json',
  'text/x-markdown',
];

/**
 * Custom error for transcript upload issues
 */
export class TranscriptUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranscriptUploadError';
  }
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a transcript file
 *
 * @param file - File to validate
 * @returns Validation result
 */
export function validateTranscriptFile(file: File): ValidationResult {
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Unsupported file type: .${extension || 'unknown'}. Allowed: .txt, .md, .json`,
    };
  }

  // Check MIME type if provided
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type) && !file.type.startsWith('text/')) {
    // Allow if type starts with text/ (browsers may use different MIME types)
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Allowed: text files, markdown, JSON`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File too large: ${sizeMB}MB. Maximum size is 1MB.`,
    };
  }

  return { valid: true };
}

/**
 * Parse transcript content based on file type
 *
 * @param content - Raw file content
 * @param extension - File extension (txt, md, json)
 * @returns Parsed transcript text
 */
export async function parseTranscript(
  content: string,
  extension: string
): Promise<string> {
  const ext = extension.toLowerCase().replace('.', '');

  if (ext === 'txt' || ext === 'md') {
    return content;
  }

  if (ext === 'json') {
    try {
      const parsed = JSON.parse(content);

      // Try common field names for transcript content
      if (typeof parsed === 'string') {
        return parsed;
      }

      if (parsed.transcript) {
        return parsed.transcript;
      }

      if (parsed.text) {
        return parsed.text;
      }

      if (parsed.content) {
        return parsed.content;
      }

      // Return raw JSON string if no known field
      return content;
    } catch {
      throw new TranscriptUploadError('Invalid JSON format. Please check the file content.');
    }
  }

  return content;
}

/**
 * Format storage key for transcript file
 *
 * @param userId - User ID
 * @param courseId - Course ID
 * @param filename - Original filename
 * @returns Storage key
 */
export function formatTranscriptKey(
  userId: string,
  courseId: string,
  filename: string
): string {
  // Sanitize filename: remove spaces and special characters
  const sanitizedFilename = filename
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '');

  // Generate timestamp for uniqueness
  const timestamp = new Date().toISOString().split('T')[0];

  return `transcripts/${userId}/${courseId}/${timestamp}-${sanitizedFilename}`;
}

/**
 * Read file content as text
 *
 * @param file - File to read
 * @returns File content as string
 */
export function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new TranscriptUploadError('Failed to read file content'));
      }
    };
    reader.onerror = () => {
      reject(new TranscriptUploadError('Failed to read file'));
    };
    reader.readAsText(file);
  });
}

/**
 * Get file extension from filename
 *
 * @param filename - Filename
 * @returns Extension without dot
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}