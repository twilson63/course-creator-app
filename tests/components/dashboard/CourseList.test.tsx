/**
 * Tests for CourseList Component
 *
 * @module tests/components/dashboard/CourseList.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseList } from '@/components/dashboard/CourseList';
import type { CourseWithMeta } from '@/components/dashboard/CourseCard';

describe('CourseList', () => {
  const mockCourses: CourseWithMeta[] = [
    {
      id: 'course-1',
      meta: { title: 'Course 1', description: 'First course', author: 'Author 1' },
      steps: [{ id: 's1', title: 'Step 1', content: 'Content' }],
      resources: [],
      status: 'draft',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-16T15:30:00Z',
    },
    {
      id: 'course-2',
      meta: { title: 'Course 2', description: 'Second course', author: 'Author 2' },
      steps: [{ id: 's1', title: 'Step 1', content: 'Content' }],
      resources: [],
      status: 'published',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-12T15:30:00Z',
    },
    {
      id: 'course-3',
      meta: { title: 'Course 3', description: 'Third course', author: 'Author 3' },
      steps: [],
      resources: [],
      status: 'ready',
      createdAt: '2024-01-05T10:00:00Z',
      updatedAt: '2024-01-06T15:30:00Z',
    },
  ];

  const defaultProps = {
    courses: mockCourses,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render all courses', () => {
      render(<CourseList {...defaultProps} />);

      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.getByText('Course 2')).toBeInTheDocument();
      expect(screen.getByText('Course 3')).toBeInTheDocument();
    });

    it('should show course count', () => {
      render(<CourseList {...defaultProps} />);

      expect(screen.getByText(/3 courses/i)).toBeInTheDocument();
    });
  });

  describe('Status Filter', () => {
    it('should have status filter tabs', () => {
      render(<CourseList {...defaultProps} />);

      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /draft/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ready/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /published/i })).toBeInTheDocument();
    });

    it('should filter by draft status', async () => {
      const user = userEvent.setup();
      render(<CourseList {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /^draft$/i }));

      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.queryByText('Course 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Course 3')).not.toBeInTheDocument();
    });

    it('should filter by published status', async () => {
      const user = userEvent.setup();
      render(<CourseList {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /published/i }));

      expect(screen.queryByText('Course 1')).not.toBeInTheDocument();
      expect(screen.getByText('Course 2')).toBeInTheDocument();
      expect(screen.queryByText('Course 3')).not.toBeInTheDocument();
    });

    it('should show all courses when All clicked', async () => {
      const user = userEvent.setup();
      render(<CourseList {...defaultProps} />);

      // First filter, then show all
      await user.click(screen.getByRole('button', { name: /published/i }));
      await user.click(screen.getByRole('button', { name: /all/i }));

      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.getByText('Course 2')).toBeInTheDocument();
      expect(screen.getByText('Course 3')).toBeInTheDocument();
    });
  });

  describe('Search', () => {
    it('should have search input', () => {
      render(<CourseList {...defaultProps} />);

      expect(screen.getByPlaceholderText(/search courses/i)).toBeInTheDocument();
    });

    it('should filter courses by search term', async () => {
      const user = userEvent.setup();
      render(<CourseList {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search courses/i);
      await user.type(searchInput, 'Course 1');

      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.queryByText('Course 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Course 3')).not.toBeInTheDocument();
    });

    it('should search in description', async () => {
      const user = userEvent.setup();
      render(<CourseList {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search courses/i);
      await user.type(searchInput, 'Second');

      expect(screen.queryByText('Course 1')).not.toBeInTheDocument();
      expect(screen.getByText('Course 2')).toBeInTheDocument();
      expect(screen.queryByText('Course 3')).not.toBeInTheDocument();
    });

    it('should show no results message', async () => {
      const user = userEvent.setup();
      render(<CourseList {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search courses/i);
      await user.type(searchInput, 'nonexistent');

      expect(screen.getByText(/no courses found/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no courses', () => {
      render(<CourseList {...defaultProps} courses={[]} />);

      expect(screen.getByText(/no courses yet/i)).toBeInTheDocument();
      expect(screen.getByText(/create your first course/i)).toBeInTheDocument();
    });
  });
});