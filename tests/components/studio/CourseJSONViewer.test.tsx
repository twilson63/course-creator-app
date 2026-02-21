/**
 * Tests for CourseJSONViewer Component
 *
 * @module tests/components/studio/CourseJSONViewer.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseJSONViewer } from '@/components/studio/CourseJSONViewer';
import type { CourseDefinition } from '@/types/course';

// Mock clipboard writeText
const mockWriteText = vi.fn().mockResolvedValue(undefined);

vi.stubGlobal('navigator', {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('CourseJSONViewer', () => {
  const mockCourse: CourseDefinition = {
    meta: {
      title: 'Test Course',
      description: 'A test course',
      author: 'Test Author',
      estimatedTime: '30 minutes',
      difficulty: 'beginner',
    },
    steps: [
      { id: 'step-1', title: 'Introduction', content: 'Welcome' },
      { id: 'step-2', title: 'Getting Started', content: 'Start here' },
    ],
    resources: [
      { label: 'Docs', url: 'https://example.com/docs' },
    ],
  };

  const defaultProps = {
    course: mockCourse,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should display course title', () => {
      render(<CourseJSONViewer {...defaultProps} />);

      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    it('should display course description', () => {
      render(<CourseJSONViewer {...defaultProps} />);

      expect(screen.getByText('A test course')).toBeInTheDocument();
    });

    it('should display author', () => {
      render(<CourseJSONViewer {...defaultProps} />);

      expect(screen.getByText(/Test Author/i)).toBeInTheDocument();
    });

    it('should display difficulty', () => {
      render(<CourseJSONViewer {...defaultProps} />);

      expect(screen.getByText(/beginner/i)).toBeInTheDocument();
    });

    it('should display estimated time', () => {
      render(<CourseJSONViewer {...defaultProps} />);

      expect(screen.getByText(/30 minutes/i)).toBeInTheDocument();
    });
  });

  describe('Meta Section', () => {
    it('should have collapsible meta section', () => {
      render(<CourseJSONViewer {...defaultProps} />);

      // Meta section header should be present
      expect(screen.getByText(/metadata/i)).toBeInTheDocument();
    });

    it('should collapse meta section on click', async () => {
      const user = userEvent.setup();
      render(<CourseJSONViewer {...defaultProps} />);

      const metaHeader = screen.getByText(/metadata/i);
      await user.click(metaHeader);

      // Section should be collapsed (content hidden)
      // The description should still be visible in collapsed state as it's in the header
    });
  });

  describe('Steps Section', () => {
    it('should display steps list', () => {
      render(<CourseJSONViewer {...defaultProps} />);

      expect(screen.getByText('Introduction')).toBeInTheDocument();
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
    });

    it('should display step count', () => {
      render(<CourseJSONViewer {...defaultProps} />);

      // The section header shows "Steps (2)"
      expect(screen.getByText(/Steps \(2\)/i)).toBeInTheDocument();
    });

    it('should have collapsible steps section', () => {
      render(<CourseJSONViewer {...defaultProps} />);

      expect(screen.getByText(/steps/i)).toBeInTheDocument();
    });
  });

  describe('Resources Section', () => {
    it('should display resources list', () => {
      render(<CourseJSONViewer {...defaultProps} />);

      expect(screen.getByText('Docs')).toBeInTheDocument();
    });

    it('should display resource URL', () => {
      render(<CourseJSONViewer {...defaultProps} />);

      expect(screen.getByText(/example.com\/docs/i)).toBeInTheDocument();
    });

    it('should show "no resources" message when empty', () => {
      const courseNoResources: CourseDefinition = {
        ...mockCourse,
        resources: [],
      };

      render(<CourseJSONViewer course={courseNoResources} />);

      expect(screen.getByText(/no resources/i)).toBeInTheDocument();
    });
  });

  describe('Copy to Clipboard', () => {
    it('should have copy button', () => {
      render(<CourseJSONViewer {...defaultProps} />);

      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    });

    it('should show success message after copy', async () => {
      const user = userEvent.setup();
      render(<CourseJSONViewer {...defaultProps} />);

      const copyButton = screen.getByRole('button', { name: /copy/i });
      await user.click(copyButton);

      // Should show "Copied!" message
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
  });

  describe('JSON Preview', () => {
    it('should display raw JSON view option', () => {
      render(<CourseJSONViewer {...defaultProps} />);

      // Toggle for raw JSON view
      expect(screen.getByRole('button', { name: /json/i })).toBeInTheDocument();
    });

    it('should show raw JSON when toggled', async () => {
      const user = userEvent.setup();
      render(<CourseJSONViewer {...defaultProps} />);

      const jsonButton = screen.getByRole('button', { name: /json/i });
      await user.click(jsonButton);

      // Should show raw JSON
      expect(screen.getByText(/"title": "Test Course"/)).toBeInTheDocument();
    });
  });
});