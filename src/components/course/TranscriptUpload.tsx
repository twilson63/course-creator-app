/**
 * Transcript Upload Component
 *
 * File upload component for course transcripts.
 * Supports .txt, .md, and .json files up to 1MB.
 *
 * @module src/components/course/TranscriptUpload
 */

'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  validateTranscriptFile,
  readFileContent,
  parseTranscript,
  getFileExtension,
} from '@/lib/course/transcript';

/**
 * Props for TranscriptUpload
 */
interface TranscriptUploadProps {
  /** Callback when transcript is uploaded */
  onUpload: (content: string, filename: string) => void | Promise<void>;
  /** Current transcript content (for display) */
  currentTranscript?: string;
  /** Whether upload is disabled */
  disabled?: boolean;
  /** Loading state for parent component */
  isLoading?: boolean;
}

/**
 * Transcript upload component with drag-and-drop support
 */
export function TranscriptUpload({
  onUpload,
  currentTranscript,
  disabled = false,
  isLoading = false,
}: TranscriptUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection
   */
  async function handleFile(file: File) {
    setError(null);

    // Validate file
    const validation = validateTranscriptFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setUploading(true);
    try {
      // Read file content
      const content = await readFileContent(file);
      const extension = getFileExtension(file.name);

      // Parse based on file type
      const transcript = await parseTranscript(content, extension);

      // Call upload callback
      await onUpload(transcript, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload transcript');
    } finally {
      setUploading(false);
    }
  }

  /**
   * Handle file input change
   */
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  /**
   * Handle drag enter
   */
  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isLoading) {
      setIsDragging(true);
    }
  }

  /**
   * Handle drag leave
   */
  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  /**
   * Handle drop
   */
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isLoading) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }

  /**
   * Handle click on drop zone
   */
  function handleClick() {
    if (!disabled && !isLoading) {
      fileInputRef.current?.click();
    }
  }

  const isDisabled = disabled || isLoading || uploading;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragEnter}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.json"
          onChange={handleChange}
          disabled={isDisabled}
          className="hidden"
        />

        <div className="space-y-2">
          <div className="text-4xl">📄</div>
          <div className="text-gray-600">
            {uploading ? (
              'Uploading...'
            ) : (
              <>
                <span className="font-medium text-blue-600">Click to upload</span>
                {' '}or drag and drop
              </>
            )}
          </div>
          <div className="text-sm text-gray-500">
            .txt, .md, or .json (max 1MB)
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Current Transcript Preview */}
      {currentTranscript && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Current Transcript
          </h4>
          <p className="text-sm text-gray-600 line-clamp-3">
            {currentTranscript.substring(0, 200)}
            {currentTranscript.length > 200 && '...'}
          </p>
        </div>
      )}
    </div>
  );
}