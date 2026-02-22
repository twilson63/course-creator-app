/**
 * Course Edit Page (SPA)
 *
 * Client-side page for editing a course using the EditStudio.
 * Uses query parameter ?id=xxx instead of dynamic route.
 *
 * @module src/app/edit/page
 */

'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EditStudio } from '@/components/studio';
import { loadCourseRecord, updateCourseRecord } from '@/lib/course/record-service';
import type {
  CourseDefinition,
  CourseRecord,
  PublishHistoryEntry,
} from '@/types/course';

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading course...</p>
      </div>
    </div>
  );
}

/**
 * Error display component
 */
function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <a
          href="/dashboard"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}

/**
 * Course edit content - must use useSearchParams so wrapped in Suspense
 */
function EditContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id');
  const [course, setCourse] = useState<CourseDefinition | null>(null);
  const [record, setRecord] = useState<CourseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) {
        setError('No course ID provided');
        setLoading(false);
        return;
      }

      try {
        const result = await loadCourseRecord(courseId);
        setRecord(result.record);
        setCourse(result.definition);
        setVideoUrl(result.record.video_url || '');
        setLastSavedAt(result.record.updated_at);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId]);

  const handleCourseUpdate = useCallback((nextCourse: CourseDefinition) => {
    setCourse(nextCourse);
    setSaveError(null);
  }, []);

  const handleSave = useCallback(async (courseOverride?: CourseDefinition) => {
    const targetCourse = courseOverride ?? course;
    if (!courseId || !record || !targetCourse || isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const result = await updateCourseRecord({
        courseId,
        record,
        definition: targetCourse,
        title: targetCourse.meta.title,
        description: targetCourse.meta.description,
        videoUrl,
      });

      setRecord(result.record);
      setCourse(result.definition);
      setLastSavedAt(result.record.updated_at);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save course');
    } finally {
      setIsSaving(false);
    }
  }, [course, courseId, isSaving, record, videoUrl]);

  const handlePublish = useCallback(
    async (publishData: {
      course: CourseDefinition;
      generatedHtml: string;
      zenbinId: string;
      zenbinUrl: string;
    }) => {
      if (!courseId || !record || isSaving) {
        return;
      }

      setIsSaving(true);
      setSaveError(null);

      try {
        const definitionForPublish: CourseDefinition = {
          ...publishData.course,
          steps: publishData.course.steps.map((step) => ({
            ...step,
            videoUrl: step.videoUrl || videoUrl || undefined,
          })),
        };

        const nextPublishHistory: PublishHistoryEntry[] = [
          ...(record.publish_history ?? []),
          {
            zenbin_id: publishData.zenbinId,
            zenbin_url: publishData.zenbinUrl,
            published_at: new Date().toISOString(),
          },
        ];

        const result = await updateCourseRecord({
          courseId,
          record,
          definition: definitionForPublish,
          title: definitionForPublish.meta.title,
          description: definitionForPublish.meta.description,
          videoUrl,
          generatedHtml: publishData.generatedHtml,
          zenbinId: publishData.zenbinId,
          zenbinUrl: publishData.zenbinUrl,
          publishHistory: nextPublishHistory,
          status: 'published',
        });

        setRecord(result.record);
        setCourse(result.definition);
        setLastSavedAt(result.record.updated_at);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to persist published course');
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [courseId, isSaving, record, videoUrl]
  );

  if (loading) {
    return <LoadingFallback />;
  }

  if (error || !course) {
    return <ErrorDisplay error={error || 'Course not found'} />;
  }

  return (
    <div className="h-screen relative">
      <div className="absolute top-4 right-4 z-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
        >
          <span aria-hidden="true">&larr;</span>
          Back to Dashboard
        </Link>
      </div>
      <EditStudio
        course={course}
        onCourseUpdate={handleCourseUpdate}
        onSave={handleSave}
        onPublish={handlePublish}
        isSaving={isSaving}
        saveError={saveError}
        lastSavedAt={lastSavedAt}
        courseVideoUrl={videoUrl}
        onCourseVideoUrlChange={setVideoUrl}
        publishedUrl={record?.zenbin_url ?? null}
        publishHistory={record?.publish_history}
      />
    </div>
  );
}

/**
 * Course Edit Page
 */
export default function CourseEditPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EditContent />
    </Suspense>
  );
}
