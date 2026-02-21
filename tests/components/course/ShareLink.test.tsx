/**
 * Tests for ShareLink Component
 *
 * @module tests/components/course/ShareLink.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareLink } from '@/components/course/ShareLink';

// Mock window.open for social sharing tests
const mockOpen = vi.fn();
vi.stubGlobal('open', mockOpen);

describe('ShareLink', () => {
  const defaultProps = {
    url: 'https://zenbin.io/abc123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the URL', () => {
      render(<ShareLink {...defaultProps} />);

      expect(screen.getByText(/zenbin.io\/abc123/i)).toBeInTheDocument();
    });

    it('should have copy button', () => {
      render(<ShareLink {...defaultProps} />);

      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    });

    it('should have link to open in new tab', () => {
      render(<ShareLink {...defaultProps} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://zenbin.io/abc123');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('Copy Button', () => {
    it('should show "Copied!" after click', async () => {
      const user = userEvent.setup();
      render(<ShareLink {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /copy/i }));

      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
  });

  describe('Social Sharing', () => {
    it('should have Twitter share button', () => {
      render(<ShareLink {...defaultProps} />);

      const twitterButton = screen.getByRole('button', { name: /twitter/i });
      expect(twitterButton).toBeInTheDocument();
    });

    it('should have LinkedIn share button', () => {
      render(<ShareLink {...defaultProps} />);

      const linkedInButton = screen.getByRole('button', { name: /linkedin/i });
      expect(linkedInButton).toBeInTheDocument();
    });

    it('should open Twitter share on click', async () => {
      const user = userEvent.setup();
      render(<ShareLink {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /twitter/i }));

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com'),
        '_blank',
        expect.any(String)
      );
    });

    it('should open LinkedIn share on click', async () => {
      const user = userEvent.setup();
      render(<ShareLink {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /linkedin/i }));

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('linkedin.com'),
        '_blank',
        expect.any(String)
      );
    });
  });
});