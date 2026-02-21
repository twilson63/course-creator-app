/**
 * Tests for PublishModal Component
 *
 * @module tests/components/course/PublishModal.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PublishModal } from '@/components/course/PublishModal';

// Mock the zenbin module
vi.mock('@/lib/publish/zenbin', () => ({
  publishCourse: vi.fn(),
}));

import { publishCourse } from '@/lib/publish/zenbin';

const mockPublishCourse = vi.mocked(publishCourse);

describe('PublishModal', () => {
  const mockHTML = '<html><body><h1>Test Course</h1></body></html>';
  const mockCourse = {
    meta: {
      title: 'Test Course',
      description: 'A test course',
      author: 'Test Author',
    },
    steps: [
      { id: 'step-1', title: 'Introduction', content: 'Welcome' },
    ],
    resources: [],
  };

  const defaultProps = {
    isOpen: true,
    html: mockHTML,
    course: mockCourse,
    onClose: vi.fn(),
    onPublish: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when open', () => {
      render(<PublishModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // Check for title in header
      expect(screen.getByRole('heading', { name: /publish course/i })).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<PublishModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should show course preview', () => {
      render(<PublishModal {...defaultProps} />);

      expect(screen.getByText('Test Course')).toBeInTheDocument();
      expect(screen.getByText('A test course')).toBeInTheDocument();
    });

    it('should show step count', () => {
      render(<PublishModal {...defaultProps} />);

      expect(screen.getByText(/1 step/i)).toBeInTheDocument();
    });

    it('should have cancel button', () => {
      render(<PublishModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should have publish button', () => {
      render(<PublishModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /publish$/i })).toBeInTheDocument();
    });
  });

  describe('Closing', () => {
    it('should call onClose when cancel clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<PublishModal {...defaultProps} onClose={onClose} />);
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Publishing', () => {
    it('should show progress while publishing', async () => {
      const user = userEvent.setup();
      let resolvePublish: (value: unknown) => void;
      mockPublishCourse.mockImplementation(
        () => new Promise((resolve) => {
          resolvePublish = resolve;
        })
      );

      render(<PublishModal {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /publish$/i }));

      expect(screen.getByText(/publishing/i)).toBeInTheDocument();
    });

    it('should show success state after publish', async () => {
      const user = userEvent.setup();
      mockPublishCourse.mockResolvedValueOnce({
        id: 'abc123',
        url: 'https://zenbin.io/abc123',
      });

      render(<PublishModal {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /publish$/i }));

      expect(screen.getByText(/published/i)).toBeInTheDocument();
      expect(screen.getByText(/zenbin.io\/abc123/i)).toBeInTheDocument();
    });

    it('should call onPublish with result', async () => {
      const user = userEvent.setup();
      const onPublish = vi.fn();
      mockPublishCourse.mockResolvedValueOnce({
        id: 'abc123',
        url: 'https://zenbin.io/abc123',
      });

      render(<PublishModal {...defaultProps} onPublish={onPublish} />);
      await user.click(screen.getByRole('button', { name: /publish$/i }));

      expect(onPublish).toHaveBeenCalledWith({
        id: 'abc123',
        url: 'https://zenbin.io/abc123',
      });
    });

    it('should show error on failure', async () => {
      const user = userEvent.setup();
      mockPublishCourse.mockRejectedValueOnce(new Error('Network error'));

      render(<PublishModal {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: /publish$/i }));

      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });
});