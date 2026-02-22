/**
 * EditStudio Component
 *
 * Main editing interface for courses with sidebar navigation,
 * step preview, and prompt-based refinement.
 *
 * @module src/components/studio/EditStudio
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { createCourseGenerator } from '@/lib/course/generator';
import { refineCourse } from '@/lib/course/refine';
import { publishCourse } from '@/lib/publish/zenbin';
import type { CourseDefinition, PublishHistoryEntry } from '@/types/course';
import { Sidebar } from './Sidebar';

export interface EditStudioProps {
  /** Course data */
  course: CourseDefinition;
  /** Callback when course is updated */
  onCourseUpdate?: (course: CourseDefinition) => void;
  /** Callback to persist course updates */
  onSave?: (course?: CourseDefinition) => Promise<void> | void;
  /** Callback to persist publish metadata */
  onPublish?: (data: {
    course: CourseDefinition;
    generatedHtml: string;
    zenbinId: string;
    zenbinUrl: string;
  }) => Promise<void> | void;
  /** Indicates if save is in progress */
  isSaving?: boolean;
  /** Save error text */
  saveError?: string | null;
  /** Last save timestamp */
  lastSavedAt?: string | null;
  /** Default video URL for steps */
  courseVideoUrl?: string;
  /** Callback when default video URL changes */
  onCourseVideoUrlChange?: (value: string) => void;
  /** Existing published URL */
  publishedUrl?: string | null;
  /** Existing publish history */
  publishHistory?: PublishHistoryEntry[];
}

/**
 * EditStudio - Main course editing interface
 */
export function EditStudio({
  course,
  onCourseUpdate,
  onSave,
  onPublish,
  isSaving = false,
  saveError,
  lastSavedAt,
  courseVideoUrl = '',
  onCourseVideoUrlChange,
  publishedUrl,
  publishHistory = [],
}: EditStudioProps) {
  const [activeStepId, setActiveStepId] = useState<string | null>(
    course.steps[0]?.id ?? null
  );
  const [prompt, setPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishUrl, setPublishUrl] = useState<string | null>(publishedUrl ?? null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const activeStep = course.steps.find((s) => s.id === activeStepId);
  const isBusy = isSaving || isRefining || isPublishing;

  useEffect(() => {
    if (!course.steps.length) {
      setActiveStepId(null);
      return;
    }

    if (!activeStepId || !course.steps.some((step) => step.id === activeStepId)) {
      setActiveStepId(course.steps[0].id);
    }
  }, [activeStepId, course.steps]);

  useEffect(() => {
    setPublishUrl(publishedUrl ?? null);
  }, [publishedUrl]);

  const updateCourse = useCallback(
    (updater: (currentCourse: CourseDefinition) => CourseDefinition) => {
      const nextCourse = updater(course);
      onCourseUpdate?.(nextCourse);
      setRefineError(null);
      setPublishError(null);
    },
    [course, onCourseUpdate]
  );

  const updateMeta = useCallback(
    (field: keyof CourseDefinition['meta'], value: string) => {
      updateCourse((currentCourse) => ({
        ...currentCourse,
        meta: {
          ...currentCourse.meta,
          [field]: value || undefined,
        },
      }));
    },
    [updateCourse]
  );

  const updateStep = useCallback(
    (stepId: string, updates: Partial<CourseDefinition['steps'][number]>) => {
      updateCourse((currentCourse) => ({
        ...currentCourse,
        steps: currentCourse.steps.map((step) =>
          step.id === stepId
            ? {
                ...step,
                ...updates,
                checkpoint: updates.checkpoint
                  ? {
                      ...step.checkpoint,
                      ...updates.checkpoint,
                    }
                  : step.checkpoint,
              }
            : step
        ),
      }));
    },
    [updateCourse]
  );

  const updateResource = useCallback(
    (index: number, field: 'label' | 'url' | 'description', value: string) => {
      updateCourse((currentCourse) => ({
        ...currentCourse,
        resources: (currentCourse.resources ?? []).map((resource, resourceIndex) =>
          resourceIndex === index
            ? {
                ...resource,
                [field]: value || undefined,
              }
            : resource
        ),
      }));
    },
    [updateCourse]
  );

  const handleStepSelect = useCallback((stepId: string) => {
    setActiveStepId(stepId);
  }, []);

  const handleAddResource = useCallback(() => {
    updateCourse((currentCourse) => ({
      ...currentCourse,
      resources: [...(currentCourse.resources ?? []), { label: '', url: '', description: '' }],
    }));
  }, [updateCourse]);

  const handleRemoveResource = useCallback(
    (index: number) => {
      updateCourse((currentCourse) => ({
        ...currentCourse,
        resources: (currentCourse.resources ?? []).filter(
          (_resource, resourceIndex) => resourceIndex !== index
        ),
      }));
    },
    [updateCourse]
  );

  const handleAddStep = useCallback(() => {
    const newStepId = `step-${crypto.randomUUID().slice(0, 8)}`;
    updateCourse((currentCourse) => ({
      ...currentCourse,
      steps: [
        ...currentCourse.steps,
        {
          id: newStepId,
          title: `Step ${currentCourse.steps.length + 1}`,
          content: '',
          videoTimestamp: '',
          estimatedTime: '',
          checkpoint: {
            label: '',
            hint: '',
          },
        },
      ],
    }));
    setActiveStepId(newStepId);
  }, [updateCourse]);

  const handleDeleteStep = useCallback(() => {
    if (!activeStepId) {
      return;
    }

    updateCourse((currentCourse) => ({
      ...currentCourse,
      steps: currentCourse.steps.filter((step) => step.id !== activeStepId),
    }));
  }, [activeStepId, updateCourse]);

  const handleRefine = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsRefining(true);
    setRefineError(null);
    try {
      const refinedCourse = await refineCourse(course, prompt.trim());
      onCourseUpdate?.(refinedCourse);
      if (onSave) {
        await onSave(refinedCourse);
      }
      setPrompt('');
    } catch (error) {
      setRefineError(error instanceof Error ? error.message : 'Failed to refine course');
    } finally {
      setIsRefining(false);
    }
  }, [course, onCourseUpdate, onSave, prompt]);

  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    setPublishError(null);

    try {
      const generator = createCourseGenerator();
      const html = await generator.generateHTML(course);
      const result = await publishCourse(html);

      if (onPublish) {
        await onPublish({
          course,
          generatedHtml: html,
          zenbinId: result.id,
          zenbinUrl: result.url,
        });
      }

      setPublishUrl(result.url);
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : 'Failed to publish course');
    } finally {
      setIsPublishing(false);
    }
  }, [course, onPublish]);

  const handleCopyPublishedUrl = useCallback(async () => {
    if (!publishUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(publishUrl);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  }, [publishUrl]);

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
          <div className="max-w-4xl mx-auto space-y-6">
            <section className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Course metadata</h2>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Title
                  <input
                    type="text"
                    value={course.meta.title}
                    onChange={(e) => updateMeta('title', e.target.value)}
                    disabled={isBusy}
                    className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Author
                  <input
                    type="text"
                    value={course.meta.author ?? ''}
                    onChange={(e) => updateMeta('author', e.target.value)}
                    disabled={isBusy}
                    className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Difficulty
                  <select
                    value={course.meta.difficulty ?? ''}
                    onChange={(e) => updateMeta('difficulty', e.target.value)}
                    disabled={isBusy}
                    className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select difficulty</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700">
                  Estimated time
                  <input
                    type="text"
                    value={course.meta.estimatedTime ?? ''}
                    onChange={(e) => updateMeta('estimatedTime', e.target.value)}
                    disabled={isBusy}
                    className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
                  Default video URL
                  <input
                    type="url"
                    value={courseVideoUrl}
                    onChange={(e) => onCourseVideoUrlChange?.(e.target.value)}
                    disabled={isBusy}
                    placeholder="https://youtube.com/watch?v=..."
                    className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
                  Description
                  <textarea
                    value={course.meta.description}
                    onChange={(e) => updateMeta('description', e.target.value)}
                    rows={3}
                    disabled={isBusy}
                    className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Resources</h2>
                <button
                  onClick={handleAddResource}
                  disabled={isBusy}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Add resource
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {(course.resources ?? []).length === 0 ? (
                  <p className="text-sm text-gray-500">No resources added yet.</p>
                ) : (
                  (course.resources ?? []).map((resource, index) => (
                    <div key={`${resource.url}-${index}`} className="border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Label"
                          value={resource.label}
                          onChange={(e) => updateResource(index, 'label', e.target.value)}
                          disabled={isBusy}
                          className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="url"
                          placeholder="https://example.com"
                          value={resource.url}
                          onChange={(e) => updateResource(index, 'url', e.target.value)}
                          disabled={isBusy}
                          className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Description (optional)"
                          value={resource.description ?? ''}
                          onChange={(e) => updateResource(index, 'description', e.target.value)}
                          disabled={isBusy}
                          className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                        />
                      </div>
                      <div className="mt-2">
                        <button
                          onClick={() => handleRemoveResource(index)}
                          disabled={isBusy}
                          className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          Remove resource
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Step editor</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddStep}
                    disabled={isBusy}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add step
                  </button>
                  <button
                    onClick={handleDeleteStep}
                    disabled={isBusy || !activeStepId}
                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Delete step
                  </button>
                </div>
              </div>

              {activeStep ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
                    Step title
                    <input
                      type="text"
                      value={activeStep.title}
                      onChange={(e) => updateStep(activeStep.id, { title: e.target.value })}
                      disabled={isBusy}
                      className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Video URL
                    <input
                      type="url"
                      value={activeStep.videoUrl ?? ''}
                      onChange={(e) => updateStep(activeStep.id, { videoUrl: e.target.value })}
                      disabled={isBusy}
                      placeholder="https://youtube.com/watch?v=..."
                      className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Video timestamp
                    <input
                      type="text"
                      value={activeStep.videoTimestamp ?? ''}
                      onChange={(e) => updateStep(activeStep.id, { videoTimestamp: e.target.value })}
                      disabled={isBusy}
                      className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Estimated time
                    <input
                      type="text"
                      value={activeStep.estimatedTime ?? ''}
                      onChange={(e) => updateStep(activeStep.id, { estimatedTime: e.target.value })}
                      disabled={isBusy}
                      className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-gray-700 md:col-span-2">
                    Content
                    <textarea
                      value={activeStep.content}
                      onChange={(e) => updateStep(activeStep.id, { content: e.target.value })}
                      rows={6}
                      disabled={isBusy}
                      className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Checkpoint label
                    <input
                      type="text"
                      value={activeStep.checkpoint?.label ?? ''}
                      onChange={(e) =>
                        updateStep(activeStep.id, {
                          checkpoint: {
                            ...(activeStep.checkpoint ?? { hint: '' }),
                            label: e.target.value,
                          },
                        })
                      }
                      disabled={isBusy}
                      className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-gray-700">
                    Checkpoint hint
                    <input
                      type="text"
                      value={activeStep.checkpoint?.hint ?? ''}
                      onChange={(e) =>
                        updateStep(activeStep.id, {
                          checkpoint: {
                            ...(activeStep.checkpoint ?? { label: '' }),
                            hint: e.target.value,
                          },
                        })
                      }
                      disabled={isBusy}
                      className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                </div>
              ) : (
                <div className="mt-4 text-sm text-gray-500">Select a step to edit its fields.</div>
              )}
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Publish</h2>
                <button
                  onClick={handlePublish}
                  disabled={isBusy}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing
                    ? 'Publishing...'
                    : publishUrl || publishHistory.length > 0
                    ? 'Republish (new URL)'
                    : 'Generate + Publish'}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Each publish creates a new permanent ZenBin URL.
              </p>
              {publishUrl && (
                <div className="mt-3 text-sm text-gray-700 space-y-2">
                  <p>
                    Published URL:{' '}
                    <a
                      href={publishUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {publishUrl}
                    </a>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyPublishedUrl}
                      className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Copy URL
                    </button>
                    {copyStatus === 'copied' ? (
                      <span className="text-xs text-green-600">Copied</span>
                    ) : copyStatus === 'failed' ? (
                      <span className="text-xs text-red-600">Copy failed</span>
                    ) : null}
                  </div>
                </div>
              )}
              {publishHistory.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <h3 className="text-xs font-medium text-gray-600 mb-2">Publish history</h3>
                  <ul className="space-y-2">
                    {[...publishHistory].reverse().map((entry) => (
                      <li key={`${entry.zenbin_id}-${entry.published_at}`} className="text-xs text-gray-600">
                        <a
                          href={entry.zenbin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {entry.zenbin_url}
                        </a>{' '}
                        <span className="text-gray-400">
                          ({new Date(entry.published_at).toLocaleString()})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {publishError && <p className="mt-3 text-sm text-red-600">{publishError}</p>}
            </section>
          </div>
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
                  disabled={!prompt.trim() || isRefining || isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRefining ? 'Applying...' : 'Apply'}
               </button>
                <button
                  onClick={() => onSave?.(course)}
                  disabled={!onSave || isRefining || isSaving}
                  className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                 {isSaving ? 'Saving...' : 'Save'}
               </button>
             </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500">Press ⌘+Enter to apply changes</p>
                {refineError ? (
                  <p className="text-xs text-red-600">{refineError}</p>
                ) : saveError ? (
                  <p className="text-xs text-red-600">{saveError}</p>
                ) : lastSavedAt ? (
                  <p className="text-xs text-gray-500">
                   Last saved {new Date(lastSavedAt).toLocaleTimeString()}
                 </p>
               ) : null}
             </div>
           </div>
         </div>
      </main>
    </div>
  );
}
