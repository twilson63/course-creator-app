/**
 * StepPreview Component
 *
 * Read-only preview of a course step with markdown content,
 * video preview, and checkpoint display.
 *
 * @module src/components/studio/StepPreview
 */

'use client';

import type { ReactElement } from 'react';
import type { CourseStep } from '@/types/course';
import { VideoPreview } from './VideoPreview';

export interface StepPreviewProps {
  /** Step to preview */
  step: CourseStep;
  /** Video URL for preview */
  videoUrl?: string;
}

/**
 * Render markdown content as paragraphs
 * (Simple implementation - can be enhanced with a proper markdown library)
 */
function renderMarkdown(content: string): ReactElement[] {
  const paragraphs = content.split(/\n\n+/).filter(Boolean);

  return paragraphs.map((paragraph, index) => (
    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
      {paragraph.split('\n').map((line, lineIndex, lines) => (
        <span key={lineIndex}>
          {line}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  ));
}

/**
 * StepPreview - Displays a course step with video and content
 */
export function StepPreview({ step, videoUrl }: StepPreviewProps) {
  return (
    <div className="space-y-6">
      {/* Video Preview */}
      {videoUrl && step.videoTimestamp && (
        <div className="mb-6">
          <VideoPreview videoUrl={videoUrl} timestamp={step.videoTimestamp} />
        </div>
      )}

      {/* Step Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {step.title}
        </h2>

        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          {step.videoTimestamp && (
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {step.videoTimestamp}
            </span>
          )}

          {step.estimatedTime && (
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {step.estimatedTime}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-gray max-w-none">
        {step.content ? (
          renderMarkdown(step.content)
        ) : (
          <p className="text-gray-400 italic">No content yet</p>
        )}
      </div>

      {/* Checkpoint */}
      {step.checkpoint && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <div>
              <h4 className="font-medium text-amber-900">
                {step.checkpoint.label}
              </h4>

              {step.checkpoint.hint && (
                <p className="text-sm text-amber-700 mt-1">
                  <span className="font-medium">Hint:</span> {step.checkpoint.hint}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}