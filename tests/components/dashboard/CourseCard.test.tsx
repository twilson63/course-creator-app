/**
 * Tests for CourseCard Component
 *
 * @module tests/components/dashboard/CourseCard.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseCard } from '@/components/dashboard/CourseCard';

describe('CourseCard', () => {
  const mockCourse = {
    id: 'course-1',
    meta: {
      title: 'Test Course',
      description: 'A test course for testing',
      author: 'Test Author',
    },
    steps: [
      { id: 'step-1', title: 'Intro', content: 'Welcome' },
      { id: 'step-2', title: 'Main', content: 'Content' },
    ],
    resources: [],
    status: 'draft' as const,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-16T15:30:00Z',
  };

  const defaultProps = {
    course: mockCourse,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  describe('Rendering', () => {
    it('should display course title', () => {
      render(<CourseCard {...defaultProps} />);

      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    it('should display course description', () => {
      render(<CourseCard {...defaultProps} />);

      expect(screen.getByText('A test course for testing')).toBeInTheDocument();
    });

    it('should display step count', () => {
      render(<CourseCard {...defaultProps} />);

      expect(screen.getByText(/2 steps/i)).toBeInTheDocument();
    });

    it('should display author', () => {
      render(<CourseCard {...defaultProps} />);

      expect(screen.getByText(/Test Author/i)).toBeInTheDocument();
    });

    it('should display status badge', () => {
      render(<CourseCard {...defaultProps} />);

      expect(screen.getByText(/draft/i)).toBeInTheDocument();
    });

    it('should display formatted dates', () => {
      render(<CourseCard {...defaultProps} />);

      // Should show date formatting (Created and Updated)
      expect(screen.getByText(/Created/i)).toBeInTheDocument();
      expect(screen.getByText(/Updated/i)).toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('should show draft badge for draft courses', () => {
      render(<CourseCard {...defaultProps} course={{ ...mockCourse, status: 'draft' }} />);

      expect(screen.getByText(/draft/i)).toHaveClass('bg-yellow-100');
    });

    it('should show ready badge for ready courses', () => {
      render(<CourseCard {...defaultProps} course={{ ...mockCourse, status: 'ready' }} />);

      expect(screen.getByText(/ready/i)).toHaveClass('bg-blue-100');
    });

    it('should show published badge for published courses', () => {
      render(<CourseCard {...defaultProps} course={{ ...mockCourse, status: 'published' }} />);

      expect(screen.getByText(/published/i)).toHaveClass('bg-green-100');
    });
  });

  describe('Actions', () => {
    it('should call onEdit when edit button clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      render(<CourseCard {...defaultProps} onEdit={onEdit} />);
      await user.click(screen.getByRole('button', { name: /edit/i }));

      expect(onEdit).toHaveBeenCalledWith('course-1');
    });

    it('should call onDelete when delete button clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

      render(<CourseCard {...defaultProps} onDelete={onDelete} />);
      await user.click(screen.getByRole('button', { name: /delete/i }));

      expect(onDelete).toHaveBeenCalledWith('course-1');
    });

    it('should have link to view course', () => {
      render(<CourseCard {...defaultProps} />);

      const link = screen.getByRole('link', { name: /view/i });
      expect(link).toHaveAttribute('href', '/courses/course-1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty steps array', () => {
      render(
        <CourseCard
          {...defaultProps}
          course={{ ...mockCourse, steps: [] }}
        />
      );

      expect(screen.getByText(/0 steps/i)).toBeInTheDocument();
    });

    it('should handle missing description', () => {
      render(
        <CourseCard
          {...defaultProps}
          course={{ ...mockCourse, meta: { ...mockCourse.meta, description: undefined } }}
        />
      );

      // Should show placeholder or nothing
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    it('should handle long titles', () => {
      const longTitle = 'A'.repeat(100);
      render(
        <CourseCard
          {...defaultProps}
          course={{ ...mockCourse, meta: { ...mockCourse.meta, title: longTitle } }}
        />
      );

      // Should truncate
      expect(screen.getByText(/A{50}\.\.\./)).toBeInTheDocument();
    });
  });
});