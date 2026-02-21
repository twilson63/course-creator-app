/**
 * DiffPreview Component
 *
 * Displays detected changes before applying them.
 *
 * @module src/components/studio/DiffPreview
 */

import type { DiffResult } from '@/lib/course/refine';

export interface DiffPreviewProps {
  /** Detected changes */
  changes: DiffResult[];
  /** Callback when user accepts changes */
  onAccept: () => void;
  /** Callback when user rejects changes */
  onReject: () => void;
  /** Whether currently processing */
  isProcessing?: boolean;
}

/**
 * Get icon for change type
 */
function ChangeIcon({ change }: { change: DiffResult }) {
  if (change.type === 'meta') {
    return (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    );
  }

  if (change.action === 'added') {
    return (
      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    );
  }

  if (change.action === 'removed') {
    return (
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    );
  }

  return (
    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

/**
 * Get label for change action
 */
function getActionLabel(action?: string): string {
  switch (action) {
    case 'added':
      return 'Added';
    case 'removed':
      return 'Removed';
    case 'modified':
      return 'Modified';
    default:
      return '';
  }
}

/**
 * DiffPreview - Shows detected changes with accept/reject options
 */
export function DiffPreview({
  changes,
  onAccept,
  onReject,
  isProcessing = false,
}: DiffPreviewProps) {
  if (changes.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
        No changes detected
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">
            {changes.length}
          </span>
          <span className="text-gray-600">changes detected</span>
        </div>
      </div>

      {/* Changes List */}
      <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
        {changes.map((change, index) => (
          <div key={index} className="px-4 py-3 flex items-start gap-3">
            <ChangeIcon change={change} />
            <div className="flex-1 min-w-0">
              {change.type === 'meta' && (
                <>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {change.field}
                  </span>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="text-red-600 line-through truncate max-w-[200px]">
                      {change.oldValue || '(empty)'}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="text-green-600 truncate max-w-[200px]">
                      {change.newValue || '(empty)'}
                    </span>
                  </div>
                </>
              )}

              {change.type === 'step' && (
                <>
                  <span className="text-sm font-medium text-gray-700">
                    {change.stepTitle}
                  </span>
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                    change.action === 'added' ? 'bg-green-100 text-green-700' :
                    change.action === 'removed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {getActionLabel(change.action)}
                  </span>
                  {change.field && (
                    <span className="ml-2 text-xs text-gray-500 capitalize">
                      {change.field}
                    </span>
                  )}
                </>
              )}

              {change.type === 'resource' && (
                <>
                  <span className="text-sm font-medium text-gray-700">Resource</span>
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                    change.action === 'added' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {getActionLabel(change.action)}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-3">
        <button
          onClick={onReject}
          disabled={isProcessing}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Reject
        </button>
        <button
          onClick={onAccept}
          disabled={isProcessing}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isProcessing && (
            <svg
              data-testid="spinner"
              className="animate-spin h-4 w-4"
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
          )}
          Accept
        </button>
      </div>
    </div>
  );
}