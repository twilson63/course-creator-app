/**
 * Course Edit Page (SPA)
 *
 * Client-side page for editing a course using the EditStudio.
 * Uses query parameter ?id=xxx instead of dynamic route.
 *
 * @module src/app/edit/page
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EditStudio } from '@/components/studio';
import { dataApi } from '@/lib/hyper-micro';
import type { CourseDefinition } from '@/types/course';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) {
        setError('No course ID provided');
        setLoading(false);
        return;
      }

      try {
        const result = await dataApi.getDocument<{ definition: CourseDefinition }>(
          'courses',
          courseId
        );

        if (!result.ok || !result.data) {
          setError('Course not found');
          setLoading(false);
          return;
        }

        setCourse(result.data.definition);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [courseId]);

  if (loading) {
    return <LoadingFallback />;
  }

  if (error || !course) {
    return <ErrorDisplay error={error || 'Course not found'} />;
  }

  return (
    <div className="h-screen">
      <EditStudio course={course} />
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