/**
 * Dashboard Page
 *
 * Main user dashboard showing their courses.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CourseForm, TranscriptUpload } from '@/components/course';
import { CourseList } from '@/components/dashboard';
import type { CourseFormData } from '@/components/course';
import { useAuth } from '@/contexts/AuthContext';
import { createPipeline, type PipelineStatus } from '@/lib/course/pipeline';
import { dataApi } from '@/lib/hyper-micro';
import type { CourseDefinition, CourseRecord } from '@/types/course';
import type { CourseWithMeta } from '@/components/dashboard';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [transcriptFilename, setTranscriptFilename] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseWithMeta[]>([]);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  const loadCourses = useCallback(async () => {
    if (!user) {
      setCourses([]);
      setIsLoadingCourses(false);
      return;
    }

    setIsLoadingCourses(true);
    setCoursesError(null);

    try {
      const result = await dataApi.listDocuments<CourseRecord>('courses');

      if (!result.ok || !result.data) {
        throw new Error(result.error || 'Failed to load courses');
      }

      const mapped = result.data
        .map((doc) => doc.value)
        .filter((course) => course.user_id === user.id)
        .map((course): CourseWithMeta | null => {
          const definition = course.course_json ?? course.definition;
          if (!definition) {
            return null;
          }

          return {
            id: course.id,
            status: course.status === 'processing' ? 'draft' : course.status,
            createdAt: course.created_at,
            updatedAt: course.updated_at,
            publishedUrl: course.zenbin_url,
            meta: {
              ...definition.meta,
              title: definition.meta.title || course.title,
              description: definition.meta.description || course.description || '',
            },
            steps: definition.steps || [],
            resources: definition.resources,
            transcript: definition.transcript,
          };
        })
        .filter((course): course is CourseWithMeta => course !== null)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      setCourses(mapped);
    } catch (error) {
      setCoursesError(error instanceof Error ? error.message : 'Failed to load courses');
    } finally {
      setIsLoadingCourses(false);
    }
  }, [user]);

  const handleOpenCreateForm = () => {
    setShowCreateForm(true);
    setCreateError(null);
  };

  const handleTranscriptUpload = async (content: string, filename: string) => {
    setTranscript(content);
    setTranscriptFilename(filename);
    setCreateError(null);
  };

  const handleCreateCourse = async (formData: CourseFormData) => {
    if (!user || isCreatingCourse) {
      return;
    }

    if (!transcript.trim()) {
      setCreateError('Please upload a transcript file before creating the course.');
      return;
    }

    setCreateError(null);
    setIsCreatingCourse(true);
    setPipelineStatus('idle');

    const courseId = crypto.randomUUID();
    const now = new Date().toISOString();

    try {
      const pipeline = createPipeline({
        onStatusChange: setPipelineStatus,
      });

      const pipelineResult = await pipeline.run({
        transcript,
        videoUrl: formData.video_url || undefined,
      });

      if (pipelineResult.status !== 'completed' || !pipelineResult.course) {
        throw new Error(pipelineResult.error || 'Course generation failed');
      }

      const definition: CourseDefinition = {
        ...pipelineResult.course,
        meta: {
          ...pipelineResult.course.meta,
          title: formData.title,
          description: formData.description,
        },
        steps: pipelineResult.course.steps.map((step) => ({
          ...step,
          videoUrl: step.videoUrl || formData.video_url || undefined,
        })),
      };

      const createResult = await dataApi.createDocument('courses', courseId, {
        id: courseId,
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        video_url: formData.video_url || undefined,
        transcript,
        transcript_filename: transcriptFilename,
        status: 'ready',
        course_json: definition,
        definition,
        generated_html: pipelineResult.html,
        created_at: now,
        updated_at: now,
      });

      if (!createResult.ok) {
        throw new Error(createResult.error || 'Failed to create course');
      }

      await loadCourses();
      router.push(`/edit?id=${encodeURIComponent(courseId)}`);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create course');
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const pipelineStatusLabel: Record<PipelineStatus, string> = {
    idle: 'Waiting to start generation...',
    'generating-json': 'Generating course JSON from transcript...',
    'validating-json': 'Validating generated course structure...',
    'generating-html': 'Generating course HTML...',
    completed: 'Course generation completed.',
    failed: 'Course generation failed.',
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user) {
      loadCourses();
    }
  }, [loading, user, loadCourses]);

  const handleEditCourse = (id: string) => {
    router.push(`/edit?id=${encodeURIComponent(id)}`);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) {
      return;
    }

    try {
      const result = await dataApi.deleteDocument('courses', id);
      if (!result.ok) {
        throw new Error(result.error || 'Failed to delete course');
      }
      await loadCourses();
    } catch (error) {
      setCoursesError(error instanceof Error ? error.message : 'Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Course Creator</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user.email}</span>
            <button
              onClick={logout}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <button
            onClick={handleOpenCreateForm}
            disabled={isCreatingCourse}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            + New Course
          </button>
        </div>

        {createError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {createError}
          </div>
        )}

        {coursesError && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {coursesError}
          </div>
        )}

        {showCreateForm ? (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create Course</h2>
              <p className="text-sm text-gray-600 mt-1">
                Set a title, add a video URL, upload your transcript, then generate course JSON.
              </p>
            </div>

            <CourseForm
              onSubmit={handleCreateCourse}
              initialValues={{
                title: '',
                description: '',
                video_url: '',
              }}
              mode="create"
            />

            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Transcript File</h3>
              <TranscriptUpload
                onUpload={handleTranscriptUpload}
                currentTranscript={transcript}
                disabled={isCreatingCourse}
                isLoading={isCreatingCourse}
              />
              {transcriptFilename && (
                <p className="mt-2 text-xs text-gray-500">Uploaded: {transcriptFilename}</p>
              )}
            </div>

            {isCreatingCourse && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                {pipelineStatusLabel[pipelineStatus]}
              </div>
            )}
          </div>
        ) : isLoadingCourses ? (
          <div className="text-center py-10 text-gray-500">Loading courses...</div>
        ) : courses.length > 0 ? (
          <CourseList
            courses={courses}
            onEdit={handleEditCourse}
            onDelete={handleDeleteCourse}
          />
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No courses yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first course by importing a video transcript.
            </p>
            <button
              onClick={handleOpenCreateForm}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Course
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
