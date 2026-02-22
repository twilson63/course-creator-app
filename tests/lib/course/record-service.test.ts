import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loadCourseRecord, updateCourseRecord } from '@/lib/course/record-service';
import type { CourseDefinition, CourseRecord } from '@/types/course';

const { getDocumentMock, updateDocumentMock } = vi.hoisted(() => ({
  getDocumentMock: vi.fn(),
  updateDocumentMock: vi.fn(),
}));

vi.mock('@/lib/hyper-micro', () => ({
  dataApi: {
    getDocument: getDocumentMock,
    updateDocument: updateDocumentMock,
  },
}));

const mockDefinition: CourseDefinition = {
  meta: {
    title: 'Course Title',
    description: 'Course Description',
  },
  steps: [
    {
      id: 'step-1',
      title: 'Step 1',
      content: 'Content',
    },
  ],
};

const baseRecord: CourseRecord = {
  id: 'course-1',
  user_id: 'user-1',
  title: 'Old Title',
  description: 'Old Description',
  status: 'ready',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

describe('course record service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads definition from course_json', async () => {
    getDocumentMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        ...baseRecord,
        course_json: mockDefinition,
      },
    });

    const result = await loadCourseRecord('course-1');

    expect(getDocumentMock).toHaveBeenCalledWith('courses', 'course-1');
    expect(result.definition).toEqual(mockDefinition);
  });

  it('falls back to legacy definition field', async () => {
    getDocumentMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        ...baseRecord,
        definition: mockDefinition,
      },
    });

    const result = await loadCourseRecord('course-1');

    expect(result.definition).toEqual(mockDefinition);
  });

  it('updates title, description, definition and updated_at', async () => {
    updateDocumentMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        key: 'course-1',
        value: {
          ...baseRecord,
          title: mockDefinition.meta.title,
          description: mockDefinition.meta.description,
          course_json: mockDefinition,
          definition: mockDefinition,
          updated_at: '2026-02-01T12:00:00.000Z',
        },
      },
    });

    const result = await updateCourseRecord({
      courseId: 'course-1',
      record: baseRecord,
      definition: mockDefinition,
    });

    expect(updateDocumentMock).toHaveBeenCalledTimes(1);
    const [, , payload] = updateDocumentMock.mock.calls[0];
    expect(payload.title).toBe('Course Title');
    expect(payload.description).toBe('Course Description');
    expect(payload.video_url).toBeUndefined();
    expect(payload.course_json).toEqual(mockDefinition);
    expect(payload.definition).toEqual(mockDefinition);
    expect(typeof payload.updated_at).toBe('string');
    expect(result.record.updated_at).toBe('2026-02-01T12:00:00.000Z');
  });

  it('persists publish metadata when provided', async () => {
    updateDocumentMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        key: 'course-1',
        value: {
          ...baseRecord,
          status: 'published',
          generated_html: '<html>published</html>',
          zenbin_id: 'zen-123',
          zenbin_url: 'https://zenbin.io/zen-123',
          publish_history: [
            {
              zenbin_id: 'zen-123',
              zenbin_url: 'https://zenbin.io/zen-123',
              published_at: '2026-02-01T12:00:00.000Z',
            },
          ],
          course_json: mockDefinition,
          definition: mockDefinition,
          updated_at: '2026-02-01T12:30:00.000Z',
        },
      },
    });

    await updateCourseRecord({
      courseId: 'course-1',
      record: baseRecord,
      definition: mockDefinition,
      generatedHtml: '<html>published</html>',
      zenbinId: 'zen-123',
      zenbinUrl: 'https://zenbin.io/zen-123',
      publishHistory: [
        {
          zenbin_id: 'zen-123',
          zenbin_url: 'https://zenbin.io/zen-123',
          published_at: '2026-02-01T12:00:00.000Z',
        },
      ],
      status: 'published',
    });

    const [, , payload] = updateDocumentMock.mock.calls[0];
    expect(payload.generated_html).toBe('<html>published</html>');
    expect(payload.zenbin_id).toBe('zen-123');
    expect(payload.zenbin_url).toBe('https://zenbin.io/zen-123');
    expect(payload.publish_history).toHaveLength(1);
    expect(payload.status).toBe('published');
  });

  it('persists video URL when provided', async () => {
    updateDocumentMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        key: 'course-1',
        value: {
          ...baseRecord,
          video_url: 'https://youtube.com/watch?v=abc123',
          course_json: mockDefinition,
          definition: mockDefinition,
          updated_at: '2026-02-01T13:00:00.000Z',
        },
      },
    });

    await updateCourseRecord({
      courseId: 'course-1',
      record: baseRecord,
      definition: mockDefinition,
      videoUrl: 'https://youtube.com/watch?v=abc123',
    });

    const [, , payload] = updateDocumentMock.mock.calls[0];
    expect(payload.video_url).toBe('https://youtube.com/watch?v=abc123');
  });

  it('falls back to local updated record when update response has no value', async () => {
    updateDocumentMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: null,
    });

    const result = await updateCourseRecord({
      courseId: 'course-1',
      record: baseRecord,
      definition: mockDefinition,
      generatedHtml: '<html>published</html>',
      zenbinId: 'zen-123',
      zenbinUrl: 'https://zenbin.org/p/zen-123',
      status: 'published',
    });

    expect(result.record.zenbin_url).toBe('https://zenbin.org/p/zen-123');
    expect(result.record.generated_html).toBe('<html>published</html>');
    expect(result.record.status).toBe('published');
  });
});
