/**
 * Tests for Sidebar Component
 *
 * @module tests/components/studio/Sidebar.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '@/components/studio/Sidebar';
import type { CourseDefinition } from '@/types/course';

describe('Sidebar', () => {
  const mockCourse: CourseDefinition = {
    meta: {
      title: 'Test Course',
      description: 'A test course',
      author: 'Test Author',
      estimatedTime: '60 minutes',
      difficulty: 'intermediate',
    },
    steps: [
      { id: 'step-1', title: 'Step 1', content: 'Content 1' },
      { id: 'step-2', title: 'Step 2', content: 'Content 2' },
    ],
    resources: [],
  };

  const defaultProps = {
    course: mockCourse,
    activeStepId: 'step-1',
    onStepSelect: vi.fn(),
  };

  describe('Course Metadata', () => {
    it('should display course title', () => {
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    it('should display difficulty level', () => {
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByText(/intermediate/i)).toBeInTheDocument();
    });

    it('should display estimated time', () => {
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByText(/60 minutes/i)).toBeInTheDocument();
    });

    it('should display author if present', () => {
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByText(/Test Author/i)).toBeInTheDocument();
    });
  });

  describe('Step List', () => {
    it('should display all steps', () => {
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
    });

    it('should display step count', () => {
      render(<Sidebar {...defaultProps} />);

      expect(screen.getByText(/2 steps/i)).toBeInTheDocument();
    });

    it('should highlight active step', () => {
      render(<Sidebar {...defaultProps} />);

      const step1 = screen.getByText('Step 1').closest('button');
      expect(step1).toHaveClass('bg-blue-50');
    });

    it('should call onStepSelect when step clicked', async () => {
      const user = userEvent.setup();
      const onStepSelect = vi.fn();

      render(<Sidebar {...defaultProps} onStepSelect={onStepSelect} />);

      await user.click(screen.getByText('Step 2'));

      expect(onStepSelect).toHaveBeenCalledWith('step-2');
    });

    it('should display step timestamps if available', () => {
      const courseWithTimestamps: CourseDefinition = {
        meta: { title: 'Test', description: 'Test' },
        steps: [
          { id: 'step-1', title: 'Step 1', content: 'Content', videoTimestamp: '0:00' },
          { id: 'step-2', title: 'Step 2', content: 'Content', videoTimestamp: '5:30' },
        ],
      };

      render(<Sidebar {...defaultProps} course={courseWithTimestamps} />);

      expect(screen.getByText('0:00')).toBeInTheDocument();
      expect(screen.getByText('5:30')).toBeInTheDocument();
    });
  });
});