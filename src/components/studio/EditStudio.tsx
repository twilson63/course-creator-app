/**
 * EditStudio Component
 *
 * Main editing interface for courses with sidebar navigation,
 * step preview, and prompt-based refinement.
 *
 * @module src/components/studio/EditStudio
 */

'use client';

import { useState, useCallback } from 'react';
import type { CourseDefinition } from '@/types/course';
import { Sidebar } from './Sidebar';

export interface EditStudioProps {
  /** Course data */
  course: CourseDefinition;
  /** Callback when course is updated */
  onCourseUpdate?: (course: CourseDefinition) => void;
}

/**
 * EditStudio - Main course editing interface
 */
export function EditStudio({ course, onCourseUpdate }: EditStudioProps) {
  const [activeStepId, setActiveStepId] = useState<string | null>(
    course.steps[0]?.id ?? null
  );
  const [prompt, setPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const activeStep = course.steps.find((s) => s.id === activeStepId);

  const handleStepSelect = useCallback((stepId: string) => {
    setActiveStepId(stepId);
  }, []);

  const handleRefine = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsRefining(true);
    try {
      // TODO: Implement refinement via pipeline
      console.log('Refine with prompt:', prompt);
      // For now, just clear the prompt
      setPrompt('');
    } finally {
      setIsRefining(false);
    }
  }, [prompt]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleRefine();
      }
    },
    [handleRefine]
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        course={course}
        activeStepId={activeStepId}
        onStepSelect={handleStepSelect}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeStep ? (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {activeStep.title}
              </h2>

              {activeStep.videoTimestamp && (
                <p className="text-sm text-gray-500 mb-4">
                  Timestamp: {activeStep.videoTimestamp}
                </p>
              )}

              <div className="prose prose-gray max-w-none">
                {activeStep.content.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {activeStep.checkpoint && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-yellow-800">
                    {activeStep.checkpoint.label}
                  </h3>
                  {activeStep.checkpoint.hint && (
                    <p className="text-sm text-yellow-700 mt-1">
                      Hint: {activeStep.checkpoint.hint}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a step to view its content
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe changes you want to make..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={isRefining}
              />
              <button
                onClick={handleRefine}
                disabled={!prompt.trim() || isRefining}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRefining ? 'Applying...' : 'Apply'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press ⌘+Enter to apply changes
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}