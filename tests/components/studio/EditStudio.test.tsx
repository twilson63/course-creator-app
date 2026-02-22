import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EditStudio } from '@/components/studio/EditStudio';
import type { CourseDefinition } from '@/types/course';

const { refineCourseMock, generateHTMLMock, publishCourseMock } = vi.hoisted(() => ({
  refineCourseMock: vi.fn(),
  generateHTMLMock: vi.fn(),
  publishCourseMock: vi.fn(),
}));

vi.mock('@/lib/course/refine', () => ({
  refineCourse: refineCourseMock,
}));

vi.mock('@/lib/course/generator', () => ({
  createCourseGenerator: () => ({
    generateHTML: generateHTMLMock,
  }),
}));

vi.mock('@/lib/publish/zenbin', () => ({
  publishCourse: publishCourseMock,
}));

const baseCourse: CourseDefinition = {
  meta: {
    title: 'Test Course',
    description: 'A test course for testing',
    author: 'Test Author',
    estimatedTime: '30 minutes',
    difficulty: 'beginner',
  },
  steps: [
    {
      id: 'step-1',
      title: 'Introduction',
      content: 'Welcome to the course',
      videoTimestamp: '0:00',
      estimatedTime: '5 minutes',
      checkpoint: {
        label: 'Check it',
        hint: 'Hint',
      },
    },
  ],
  resources: [{ label: 'Documentation', url: 'https://example.com/docs' }],
};

describe('EditStudio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onCourseUpdate when metadata is edited', async () => {
    const user = userEvent.setup();
    const onCourseUpdate = vi.fn();

    render(<EditStudio course={baseCourse} onCourseUpdate={onCourseUpdate} />);

    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'X');

    expect(onCourseUpdate).toHaveBeenCalled();
    const latestCourse = onCourseUpdate.mock.calls.at(-1)?.[0] as CourseDefinition;
    expect(latestCourse.meta.title.endsWith('X')).toBe(true);
  });

  it('adds and removes resources', async () => {
    const user = userEvent.setup();
    const onCourseUpdate = vi.fn();

    render(<EditStudio course={baseCourse} onCourseUpdate={onCourseUpdate} />);

    await user.click(screen.getByRole('button', { name: 'Add resource' }));
    expect(onCourseUpdate).toHaveBeenCalled();

    await user.click(screen.getAllByRole('button', { name: 'Remove resource' })[0]);
    const latestCourse = onCourseUpdate.mock.calls.at(-1)?.[0] as CourseDefinition;
    expect(latestCourse.resources).toHaveLength(0);
  });

  it('refines course from prompt and saves refined result', async () => {
    const user = userEvent.setup();
    const refined: CourseDefinition = {
      ...baseCourse,
      meta: {
        ...baseCourse.meta,
        title: 'Refined Title',
      },
    };
    const onCourseUpdate = vi.fn();
    const onSave = vi.fn();
    refineCourseMock.mockResolvedValueOnce(refined);

    render(
      <EditStudio
        course={baseCourse}
        onCourseUpdate={onCourseUpdate}
        onSave={onSave}
      />
    );

    await user.type(
      screen.getByPlaceholderText('Describe changes you want to make...'),
      'Make it shorter'
    );
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(refineCourseMock).toHaveBeenCalledWith(baseCourse, 'Make it shorter');
    expect(onCourseUpdate).toHaveBeenCalledWith(refined);
    expect(onSave).toHaveBeenCalledWith(refined);
  });

  it('publishes and persists publish metadata', async () => {
    const user = userEvent.setup();
    const onPublish = vi.fn();

    generateHTMLMock.mockResolvedValueOnce('<html>course</html>');
    publishCourseMock.mockResolvedValueOnce({
      id: 'zen-1',
      url: 'https://zenbin.io/zen-1',
    });

    render(<EditStudio course={baseCourse} onPublish={onPublish} />);

    await user.click(screen.getByRole('button', { name: 'Generate + Publish' }));

    expect(generateHTMLMock).toHaveBeenCalledWith(baseCourse);
    expect(publishCourseMock).toHaveBeenCalledWith('<html>course</html>');
    expect(onPublish).toHaveBeenCalledWith({
      course: baseCourse,
      generatedHtml: '<html>course</html>',
      zenbinId: 'zen-1',
      zenbinUrl: 'https://zenbin.io/zen-1',
    });
    expect(screen.getByText('https://zenbin.io/zen-1')).toBeInTheDocument();
  });
});
