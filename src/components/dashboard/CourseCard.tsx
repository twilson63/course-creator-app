/**
 * CourseCard Component
 *
 * Displays a course in a card format with actions.
 *
 * @module src/components/dashboard/CourseCard
 */

'use client';

import type { CourseDefinition } from '@/types/course';

export interface CourseWithMeta extends CourseDefinition {
  id: string;
  status: 'draft' | 'ready' | 'published';
  createdAt: string;
  updatedAt: string;
  publishedUrl?: string;
}

export interface CourseCardProps {
  /** Course to display */
  course: CourseWithMeta;
  /** Callback when edit is clicked */
  onEdit: (id: string) => void;
  /** Callback when delete is clicked */
  onDelete: (id: string) => void;
}

type StatusBadge = {
  label: string;
  className: string;
};

const STATUS_BADGES: Record<string, StatusBadge> = {
  draft: { label: 'Draft', className: 'bg-yellow-100 text-yellow-700' },
  ready: { label: 'Ready', className: 'bg-blue-100 text-blue-700' },
  published: { label: 'Published', className: 'bg-green-100 text-green-700' },
};

/**
 * CourseCard - Display a course with actions
 */
export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const statusBadge = STATUS_BADGES[course.status] || STATUS_BADGES.draft;

  const handleEdit = () => {
    onEdit(course.id);
  };

  const handleDelete = () => {
    onDelete(course.id);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const truncateTitle = (title: string, maxLength = 50) => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-900 truncate" title={course.meta.title}>
          {truncateTitle(course.meta.title)}
        </h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadge.className}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {course.meta.description || 'No description'}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        <span>{course.steps.length} step{course.steps.length !== 1 ? 's' : ''}</span>
        {course.meta.author && <span>by {course.meta.author}</span>}
      </div>

      {/* Dates */}
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
        <span>Created {formatDate(course.createdAt)}</span>
        <span>Updated {formatDate(course.updatedAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <a
          href={`/courses/${course.id}`}
          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          View
        </a>
        <button
          onClick={handleEdit}
          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}