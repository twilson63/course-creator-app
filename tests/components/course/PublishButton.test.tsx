/**
 * Tests for PublishButton Component
 *
 * @module tests/components/course/PublishButton.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PublishButton } from '@/components/course/PublishButton';

// Mock the zenbin module
vi.mock('@/lib/publish/zenbin', () => ({
  publishCourse: vi.fn(),
}));

import { publishCourse } from '@/lib/publish/zenbin';

const mockPublishCourse = vi.mocked(publishCourse);

describe('PublishButton', () => {
  const mockHTML = '<html><body><h1>Test Course</h1></body></html>';
  const mockOnPublish = vi.fn();

  const defaultProps = {
    html: mockHTML,
    onPublish: mockOnPublish,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render publish button', () => {
      render(<PublishButton {...defaultProps} />);

      expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument();
    });

    it('should show disabled state when disabled prop is true', () => {
      render(<PublishButton {...defaultProps} disabled />);

      const button = screen.getByRole('button', { name: /publish/i });
      expect(button).toBeDisabled();
    });

    it('should show custom label', () => {
      render(<PublishButton {...defaultProps} label="Publish to Web" />);

      expect(screen.getByRole('button', { name: /publish to web/i })).toBeInTheDocument();
    });
  });

  describe('Publishing', () => {
    it('should call publishCourse on click', async () => {
      const user = userEvent.setup();
      mockPublishCourse.mockResolvedValueOnce({
        id: 'abc123',
        url: 'https://zenbin.io/abc123',
      });

      render(<PublishButton {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /publish/i }));

      expect(mockPublishCourse).toHaveBeenCalledWith(mockHTML);
    });

    it('should show loading state while publishing', async () => {
      const user = userEvent.setup();
      let resolvePublish: (value: unknown) => void;
      mockPublishCourse.mockImplementation(
        () => new Promise((resolve) => {
          resolvePublish = resolve;
        })
      );

      render(<PublishButton {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /publish/i }));

      // Should show publishing state
      expect(screen.getByText(/publishing/i)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();

      // Resolve the promise
      resolvePublish!({ id: 'abc123', url: 'https://zenbin.io/abc123' });
    });

    it('should call onPublish with result', async () => {
      const user = userEvent.setup();
      mockPublishCourse.mockResolvedValueOnce({
        id: 'abc123',
        url: 'https://zenbin.io/abc123',
      });

      render(<PublishButton {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /publish/i }));

      expect(mockOnPublish).toHaveBeenCalledWith({
        id: 'abc123',
        url: 'https://zenbin.io/abc123',
      });
    });

    it('should show error on failure', async () => {
      const user = userEvent.setup();
      mockPublishCourse.mockRejectedValueOnce(new Error('Network error'));

      render(<PublishButton {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /publish/i }));

      expect(screen.getByText(/failed to publish/i)).toBeInTheDocument();
      expect(mockOnPublish).not.toHaveBeenCalled();
    });

    it('should allow retry after error', async () => {
      const user = userEvent.setup();
      mockPublishCourse
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ id: 'abc123', url: 'https://zenbin.io/abc123' });

      render(<PublishButton {...defaultProps} />);

      // First attempt fails
      await user.click(screen.getByRole('button', { name: /publish/i }));
      expect(screen.getByText(/failed to publish/i)).toBeInTheDocument();

      // Second attempt succeeds
      await user.click(screen.getByRole('button', { name: /retry/i }));
      expect(mockOnPublish).toHaveBeenCalledWith({
        id: 'abc123',
        url: 'https://zenbin.io/abc123',
      });
    });
  });

  describe('Success State', () => {
    it('should show success message after publish', async () => {
      const user = userEvent.setup();
      mockPublishCourse.mockResolvedValueOnce({
        id: 'abc123',
        url: 'https://zenbin.io/abc123',
      });

      render(<PublishButton {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /publish/i }));

      expect(screen.getByText(/published successfully/i)).toBeInTheDocument();
    });

    it('should show shareable link', async () => {
      const user = userEvent.setup();
      mockPublishCourse.mockResolvedValueOnce({
        id: 'abc123',
        url: 'https://zenbin.io/abc123',
      });

      render(<PublishButton {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /publish/i }));

      expect(screen.getByText(/zenbin.io\/abc123/i)).toBeInTheDocument();
    });
  });
});