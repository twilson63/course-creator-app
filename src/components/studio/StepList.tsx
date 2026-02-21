/**
 * StepList Component
 *
 * Displays a list of course steps with navigation.
 *
 * @module src/components/studio/StepList
 */

'use client';

import type { CourseStep } from '@/types/course';

export interface StepListProps {
  /** List of course steps */
  steps: CourseStep[];
  /** Currently active step ID */
  activeStepId: string | null;
  /** Callback when step is selected */
  onStepSelect: (stepId: string) => void;
}

/**
 * StepList - Renders a navigable list of course steps
 */
export function StepList({ steps, activeStepId, onStepSelect }: StepListProps) {
  if (steps.length === 0) {
    return (
      <div className="text-gray-500 text-sm py-4 text-center">
        No steps yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {steps.map((step, index) => (
        <button
          key={step.id}
          onClick={() => onStepSelect(step.id)}
          className={`
            w-full text-left px-3 py-2 rounded-lg transition-colors
            ${activeStepId === step.id
              ? 'bg-blue-50 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'}
          `}
        >
          <div className="flex items-center gap-3">
            <span className={`
              flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium
              ${activeStepId === step.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'}
            `}>
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{step.title}</div>
              {step.videoTimestamp && (
                <div className="text-xs text-gray-500">{step.videoTimestamp}</div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}