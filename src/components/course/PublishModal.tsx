/**
 * PublishModal Component
 *
 * Modal for publishing courses with preview and progress.
 *
 * @module src/components/course/PublishModal
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { publishCourse, type PublishResult } from '@/lib/publish/zenbin';
import { ShareLink } from './ShareLink';
import type { CourseDefinition } from '@/types/course';

export interface PublishModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** HTML content to publish */
  html: string;
  /** Course being published */
  course: CourseDefinition;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when publish succeeds */
  onPublish: (result: PublishResult) => void;
}

type ModalState = 'preview' | 'publishing' | 'success' | 'error';

/**
 * PublishModal - Preview and publish course to ZenBin
 */
export function PublishModal({
  isOpen,
  html,
  course,
  onClose,
  onPublish,
}: PublishModalProps) {
  const [state, setState] = useState<ModalState>('preview');
  const [result, setResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setState('preview');
      setResult(null);
      setError(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handlePublish = useCallback(async () => {
    setState('publishing');
    setError(null);

    try {
      const publishResult = await publishCourse(html);
      setResult(publishResult);
      setState('success');
      onPublish(publishResult);
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Failed to publish');
    }
  }, [html, onPublish]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === modalRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Publish Course</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Preview State */}
          {state === 'preview' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{course.meta.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{course.meta.description}</p>
                <div className="mt-3 flex gap-4 text-sm text-gray-500">
                  <span>{course.steps.length} step{course.steps.length !== 1 ? 's' : ''}</span>
                  {course.meta.estimatedTime && <span>{course.meta.estimatedTime}</span>}
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Your course will be published to ZenBin and get a permanent, shareable link.
              </p>
            </div>
          )}

          {/* Publishing State */}
          {state === 'publishing' && (
            <div className="flex flex-col items-center py-8">
              <svg
                className="animate-spin h-12 w-12 text-blue-600 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-gray-600">Publishing your course...</p>
            </div>
          )}

          {/* Success State */}
          {state === 'success' && result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Published successfully!</span>
              </div>

              <ShareLink url={result.url} />
            </div>
          )}

          {/* Error State */}
          {state === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-medium">Failed to publish</span>
              </div>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          {state === 'preview' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Publish
              </button>
            </>
          )}

          {state === 'error' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePublish}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </>
          )}

          {state === 'success' && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}