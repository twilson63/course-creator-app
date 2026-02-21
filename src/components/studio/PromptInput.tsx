/**
 * PromptInput Component
 *
 * Input field for entering natural language refinement prompts.
 *
 * @module src/components/studio/PromptInput
 */

'use client';

import { useState, useCallback, KeyboardEvent } from 'react';

export interface PromptInputProps {
  /** Callback when prompt is submitted */
  onSubmit: (prompt: string) => void;
  /** Whether currently processing */
  isProcessing?: boolean;
  /** Callback when processing is cancelled */
  onCancel?: () => void;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * PromptInput - Text input for course refinement prompts
 */
export function PromptInput({
  onSubmit,
  isProcessing = false,
  onCancel,
  placeholder = 'Describe changes you want to make...',
}: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmed = prompt.trim();
    if (trimmed && !isProcessing) {
      onSubmit(trimmed);
      setPrompt('');
    }
  }, [prompt, isProcessing, onSubmit]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  }, []);

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-3">
          <input
            type="text"
            value={prompt}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {isProcessing ? (
            <>
              <button
                onClick={onCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled
                className="px-6 py-2 bg-blue-400 text-white rounded-lg font-medium flex items-center gap-2"
              >
                <svg
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
                Applying...
              </button>
            </>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Apply
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press ⌘+Enter to apply changes
        </p>
      </div>
    </div>
  );
}