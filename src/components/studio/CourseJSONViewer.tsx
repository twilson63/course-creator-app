/**
 * CourseJSONViewer Component
 *
 * Displays course structure and metadata with collapsible sections
 * and copy-to-clipboard functionality.
 *
 * @module src/components/studio/CourseJSONViewer
 */

'use client';

import { useState, useCallback } from 'react';
import type { CourseDefinition } from '@/types/course';

export interface CourseJSONViewerProps {
  /** Course to display */
  course: CourseDefinition;
  /** Initial expanded state for sections */
  defaultExpanded?: boolean;
}

type ViewMode = 'structured' | 'json';

/**
 * CourseJSONViewer - Displays course structure with copy functionality
 */
export function CourseJSONViewer({
  course,
  defaultExpanded = true,
}: CourseJSONViewerProps) {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);
  const [metaExpanded, setMetaExpanded] = useState(defaultExpanded);
  const [stepsExpanded, setStepsExpanded] = useState(defaultExpanded);
  const [resourcesExpanded, setResourcesExpanded] = useState(defaultExpanded);

  const copyToClipboard = useCallback(async () => {
    try {
      const json = JSON.stringify(course, null, 2);
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [course]);

  const json = JSON.stringify(course, null, 2);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Course Structure</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJson(!showJson)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              showJson
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            JSON
          </button>
          <button
            onClick={copyToClipboard}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {showJson ? (
          /* Raw JSON View */
          <pre className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg overflow-x-auto font-mono">
            {json}
          </pre>
        ) : (
          /* Structured View */
          <div className="space-y-4">
            {/* Meta Section */}
            <CollapsibleSection
              title="Metadata"
              expanded={metaExpanded}
              onToggle={() => setMetaExpanded(!metaExpanded)}
            >
              <div className="space-y-2">
                <MetaField label="Title" value={course.meta.title} />
                <MetaField label="Description" value={course.meta.description} />
                {course.meta.author && <MetaField label="Author" value={course.meta.author} />}
                {course.meta.estimatedTime && <MetaField label="Time" value={course.meta.estimatedTime} />}
                {course.meta.difficulty && <MetaField label="Difficulty" value={course.meta.difficulty} />}
              </div>
            </CollapsibleSection>

            {/* Steps Section */}
            <CollapsibleSection
              title={`Steps (${course.steps.length})`}
              expanded={stepsExpanded}
              onToggle={() => setStepsExpanded(!stepsExpanded)}
            >
              <div className="space-y-2">
                {course.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3 py-1">
                    <span className="text-sm font-mono text-gray-400 w-6">{index + 1}.</span>
                    <span className="text-sm text-gray-700">{step.title}</span>
                    {step.videoTimestamp && (
                      <span className="text-xs text-gray-500 font-mono">{step.videoTimestamp}</span>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Resources Section */}
            <CollapsibleSection
              title={`Resources (${course.resources?.length || 0})`}
              expanded={resourcesExpanded}
              onToggle={() => setResourcesExpanded(!resourcesExpanded)}
            >
              {course.resources && course.resources.length > 0 ? (
                <div className="space-y-2">
                  {course.resources.map((resource, index) => (
                    <div key={index} className="py-1">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {resource.label}
                      </a>
                      <p className="text-xs text-gray-500 truncate">{resource.url}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No resources</p>
              )}
            </CollapsibleSection>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Collapsible section component
 */
function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && <div className="px-3 py-2">{children}</div>}
    </div>
  );
}

/**
 * Meta field component
 */
function MetaField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-2">
      <span className="text-sm text-gray-500 w-24 flex-shrink-0">{label}:</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}