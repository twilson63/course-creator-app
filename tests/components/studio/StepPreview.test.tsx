/**
 * Tests for StepPreview Component
 *
 * @module tests/components/studio/StepPreview.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepPreview } from '@/components/studio/StepPreview';
import type { CourseStep } from '@/types/course';

// Mock VideoPreview
vi.mock('@/components/studio/VideoPreview', () => ({
  VideoPreview: ({ videoUrl, timestamp }: { videoUrl?: string; timestamp?: string }) => (
    <div data-testid="video-preview" data-url={videoUrl} data-timestamp={timestamp}>
      Video Preview: {videoUrl} @ {timestamp}
    </div>
  ),
}));

describe('StepPreview', () => {
  const defaultStep: CourseStep = {
    id: 'step-1',
    title: 'Introduction to Testing',
    content: 'This is the first step.\n\nWe will learn about testing.',
    videoTimestamp: '0:00',
    estimatedTime: '5 minutes',
  };

  const defaultProps = {
    step: defaultStep,
    videoUrl: 'https://youtube.com/watch?v=test',
  };

  describe('Rendering', () => {
    it('should display step title', () => {
      render(<StepPreview {...defaultProps} />);

      expect(screen.getByText('Introduction to Testing')).toBeInTheDocument();
    });

    it('should display timestamp', () => {
      render(<StepPreview {...defaultProps} />);

      // The timestamp 0:00 appears in the video preview data attribute
      const timeElements = screen.getAllByText(/0:00/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it('should display estimated time', () => {
      render(<StepPreview {...defaultProps} />);

      expect(screen.getByText(/5 minutes/)).toBeInTheDocument();
    });

    it('should render markdown content', () => {
      render(<StepPreview {...defaultProps} />);

      expect(screen.getByText('This is the first step.')).toBeInTheDocument();
      expect(screen.getByText('We will learn about testing.')).toBeInTheDocument();
    });
  });

  describe('Checkpoint', () => {
    it('should display checkpoint if present', () => {
      const stepWithCheckpoint: CourseStep = {
        ...defaultStep,
        checkpoint: {
          label: 'Did you understand?',
          hint: 'Review the basics if needed',
        },
      };

      render(<StepPreview {...defaultProps} step={stepWithCheckpoint} />);

      expect(screen.getByText('Did you understand?')).toBeInTheDocument();
      expect(screen.getByText(/Review the basics if needed/)).toBeInTheDocument();
    });

    it('should not display checkpoint section if not present', () => {
      render(<StepPreview {...defaultProps} />);

      expect(screen.queryByText(/checkpoint/i)).not.toBeInTheDocument();
    });
  });

  describe('Video Preview', () => {
    it('should show video preview when videoUrl provided', () => {
      render(<StepPreview {...defaultProps} />);

      expect(screen.getByTestId('video-preview')).toBeInTheDocument();
    });

    it('should not show video preview when no videoUrl', () => {
      render(<StepPreview step={defaultStep} />);

      expect(screen.queryByTestId('video-preview')).not.toBeInTheDocument();
    });

    it('should pass timestamp to video preview', () => {
      render(<StepPreview {...defaultProps} />);

      const videoPreview = screen.getByTestId('video-preview');
      expect(videoPreview).toHaveAttribute('data-timestamp', '0:00');
    });
  });

  describe('Timestamps', () => {
    it('should handle timestamps in MM:SS format', () => {
      const step: CourseStep = {
        ...defaultStep,
        videoTimestamp: '5:30',
      };

      render(<StepPreview {...defaultProps} step={step} />);

      // Check for the timestamp in the header
      const timeElements = screen.getAllByText(/5:30/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it('should handle timestamps in H:MM:SS format', () => {
      const step: CourseStep = {
        ...defaultStep,
        videoTimestamp: '1:15:30',
      };

      render(<StepPreview {...defaultProps} step={step} />);

      // Check for the timestamp
      const timeElements = screen.getAllByText(/1:15:30/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Markdown Rendering', () => {
    it('should render paragraphs', () => {
      const step: CourseStep = {
        ...defaultStep,
        content: 'Paragraph 1\n\nParagraph 2\n\nParagraph 3',
      };

      render(<StepPreview {...defaultProps} step={step} />);

      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 3')).toBeInTheDocument();
    });

    it('should handle empty content', () => {
      const step: CourseStep = {
        ...defaultStep,
        content: '',
      };

      render(<StepPreview {...defaultProps} step={step} />);

      // Should still render title
      expect(screen.getByText('Introduction to Testing')).toBeInTheDocument();
    });
  });
});