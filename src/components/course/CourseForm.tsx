/**
 * Course Form Component
 *
 * Form for creating and editing course metadata.
 * Validates title, description, and video URL.
 *
 * @module src/components/course/CourseForm
 */

'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { isValidVideoUrl } from '@/lib/course/validation';

/**
 * Form data structure
 */
export interface CourseFormData {
  title: string;
  description: string;
  video_url: string;
}

/**
 * Form errors
 */
interface FormErrors {
  title?: string;
  description?: string;
  video_url?: string;
}

/**
 * Props for CourseForm
 */
interface CourseFormProps {
  /** Submit handler */
  onSubmit: (data: CourseFormData) => void | Promise<void>;
  /** Initial values for edit mode */
  initialValues?: Partial<CourseFormData>;
  /** Form mode */
  mode?: 'create' | 'edit';
}

/**
 * Course form component
 */
export function CourseForm({
  onSubmit,
  initialValues,
  mode = 'create',
}: CourseFormProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    video_url: initialValues?.video_url || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle input change
   */
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  /**
   * Validate form
   */
  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be 2000 characters or less';
    }

    if (formData.video_url && !isValidVideoUrl(formData.video_url)) {
      newErrors.video_url = 'Video URL must be a valid YouTube, Loom, Vimeo, or Descript link';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /**
   * Handle form submit
   */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Course Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="My Awesome Course"
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe what students will learn..."
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Video URL */}
      <div>
        <label
          htmlFor="video_url"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Video URL
        </label>
        <input
          type="url"
          id="video_url"
          name="video_url"
          value={formData.video_url}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.video_url ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="https://youtube.com/watch?v=..."
          disabled={isSubmitting}
        />
        {errors.video_url && (
          <p className="mt-1 text-sm text-red-600">{errors.video_url}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          YouTube, Loom, Vimeo, or Descript
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting
          ? 'Creating...'
          : mode === 'create'
          ? 'Create Course'
          : 'Update Course'}
      </button>
    </form>
  );
}