/**
 * Tests for EditStudio Component
 *
 * @module tests/components/studio/EditStudio.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditStudio } from '@/components/studio/EditStudio';
import type { CourseDefinition } from '@/types/course';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useParams: () => ({ id: 'test-course-id' }),
}));

describe('EditStudio', () => {
  const mockCourse: CourseDefinition = {
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
      },
      {
        id: 'step-2',
        title: 'Getting Started',
        content: 'Lets get started',
        videoTimestamp: '5:00',
        estimatedTime: '10 minutes',
      },
      {
        id: 'step-3',
        title: 'Advanced Topics',
        content: 'Now for advanced topics',
        videoTimestamp: '15:00',
        estimatedTime: '15 minutes',
      },
    ],
    resources: [
      { label: 'Documentation', url: 'https://example.com/docs' },
    ],
  };

  const defaultProps = {
    course: mockCourse,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Layout', () => {
    it('should render the studio layout', () => {
      render(<EditStudio {...defaultProps} />);

      // Should have sidebar and main content area
      expect(screen.getByRole('complementary')).toBeInTheDocument(); // Sidebar
      expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
    });

    it('should display course title in sidebar', () => {
      render(<EditStudio {...defaultProps} />);

      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    it('should display course metadata in sidebar', () => {
      render(<EditStudio {...defaultProps} />);

      expect(screen.getByText(/beginner/i)).toBeInTheDocument();
      expect(screen.getByText(/30 minutes/i)).toBeInTheDocument();
    });

    it('should be responsive', () => {
      render(<EditStudio {...defaultProps} />);

      // Layout should have responsive classes
      const container = screen.getByRole('main').parentElement;
      expect(container).toHaveClass('flex');
    });
  });

  describe('Step Navigation', () => {
    it('should list all steps in order', () => {
      render(<EditStudio {...defaultProps} />);

      // Find sidebar
      const sidebar = screen.getByRole('complementary');

      expect(within(sidebar).getByText('Introduction')).toBeInTheDocument();
      expect(within(sidebar).getByText('Getting Started')).toBeInTheDocument();
      expect(within(sidebar).getByText('Advanced Topics')).toBeInTheDocument();
    });

    it('should highlight first step by default', () => {
      render(<EditStudio {...defaultProps} />);

      const sidebar = screen.getByRole('complementary');
      const firstStepButton = within(sidebar).getByRole('button', { name: /Introduction/ });
      expect(firstStepButton).toHaveClass('bg-blue-50');
    });

    it('should switch active step on click', async () => {
      const user = userEvent.setup();
      render(<EditStudio {...defaultProps} />);

      // Find sidebar
      const sidebar = screen.getByRole('complementary');

      // Click on second step in sidebar
      const secondStepButton = within(sidebar).getByRole('button', { name: /Getting Started/ });
      await user.click(secondStepButton);

      // Second step should now be highlighted
      expect(secondStepButton).toHaveClass('bg-blue-50');
    });

    it('should display active step content', () => {
      render(<EditStudio {...defaultProps} />);

      // First step content should be visible by default
      expect(screen.getByText('Welcome to the course')).toBeInTheDocument();
    });
  });

  describe('Prompt Input', () => {
    it('should have a prompt input field', () => {
      render(<EditStudio {...defaultProps} />);

      expect(screen.getByPlaceholderText(/describe changes/i)).toBeInTheDocument();
    });

    it('should have an apply button', () => {
      render(<EditStudio {...defaultProps} />);

      expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    });

    it('should have prompt input visible', () => {
      render(<EditStudio {...defaultProps} />);

      const promptInput = screen.getByPlaceholderText(/describe changes/i);
      expect(promptInput).toBeVisible();
    });
  });
});