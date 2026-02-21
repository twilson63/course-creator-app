/**
 * PublishButton Component
 *
 * Button to publish HTML content to ZenBin with loading and error states.
 *
 * @module src/components/course/PublishButton
 */

'use client';

import { useState, useCallback } from 'react';
import { publishCourse, type PublishResult } from '@/lib/publish/zenbin';

export interface PublishButtonProps {
  /** HTML content to publish */
  html: string;
  /** Callback when publish succeeds */
  onPublish: (result: PublishResult) => void;
  /** Button label */
  label?: string;
  /** Disable the button */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

type PublishState = 'idle' | 'publishing' | 'success' | 'error';

/**
 * PublishButton - Publish HTML to ZenBin
 */
export function PublishButton({
  html,
  onPublish,
  label = 'Publish',
  disabled = false,
  className = '',
}: PublishButtonProps) {
  const [state, setState] = useState<PublishState>('idle');
  const [result, setResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleRetry = useCallback(() => {
    handlePublish();
  }, [handlePublish]);

  // Success state
  if (state === 'success' && result) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex items-center gap-2 text-green-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Published successfully!</span>
        </div>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          {result.url}
        </a>
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex items-center gap-2 text-red-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Failed to publish: {error}</span>
        </div>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Publishing state
  if (state === 'publishing') {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-lg cursor-wait ${className}`}
      >
        <svg
          className="animate-spin h-5 w-5"
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
        Publishing...
      </button>
    );
  }

  // Idle state
  return (
    <button
      onClick={handlePublish}
      disabled={disabled}
      className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {label}
    </button>
  );
}