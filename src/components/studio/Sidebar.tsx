/**
 * Sidebar Component
 *
 * Displays course metadata and step navigation.
 *
 * @module src/components/studio/Sidebar
 */

'use client';

import type { CourseDefinition } from '@/types/course';
import { StepList } from './StepList';

export interface SidebarProps {
  /** Course data */
  course: CourseDefinition;
  /** Currently active step ID */
  activeStepId: string | null;
  /** Callback when step is selected */
  onStepSelect: (stepId: string) => void;
}

/**
 * Difficulty badge colors
 */
const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

/**
 * Sidebar - Course metadata and step navigation
 */
export function Sidebar({ course, activeStepId, onStepSelect }: SidebarProps) {
  const { meta, steps } = course;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Course Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900 truncate">
          {meta.title}
        </h1>
        {meta.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {meta.description}
          </p>
        )}

        {/* Metadata badges */}
        <div className="mt-3 flex flex-wrap gap-2">
          {meta.difficulty && (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyColors[meta.difficulty] || 'bg-gray-100 text-gray-600'}`}>
              {meta.difficulty}
            </span>
          )}
          {meta.estimatedTime && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
              {meta.estimatedTime}
            </span>
          )}
        </div>

        {meta.author && (
          <p className="mt-2 text-xs text-gray-500">
            by {meta.author}
          </p>
        )}
      </div>

      {/* Steps Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-700">Steps</h2>
          <span className="text-xs text-gray-500">{steps.length} steps</span>
        </div>

        <StepList
          steps={steps}
          activeStepId={activeStepId}
          onStepSelect={onStepSelect}
        />
      </div>
    </aside>
  );
}