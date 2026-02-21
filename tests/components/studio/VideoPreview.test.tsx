/**
 * Tests for VideoPreview Component
 *
 * @module tests/components/studio/VideoPreview.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoPreview } from '@/components/studio/VideoPreview';

describe('VideoPreview', () => {
  const defaultProps = {
    videoUrl: 'https://youtube.com/watch?v=test',
    timestamp: '5:30',
  };

  describe('YouTube URLs', () => {
    it('should embed YouTube videos', () => {
      render(<VideoPreview {...defaultProps} />);

      const iframe = screen.getByTitle('Video player');
      expect(iframe).toHaveAttribute('src', expect.stringContaining('youtube.com'));
    });

    it('should parse standard YouTube URL', () => {
      render(<VideoPreview videoUrl="https://www.youtube.com/watch?v=abc123" />);

      const iframe = screen.getByTitle('Video player');
      expect(iframe).toHaveAttribute('src', expect.stringContaining('youtube.com/embed/abc123'));
    });

    it('should parse short YouTube URL', () => {
      render(<VideoPreview videoUrl="https://youtu.be/abc123" />);

      const iframe = screen.getByTitle('Video player');
      expect(iframe).toHaveAttribute('src', expect.stringContaining('youtube.com/embed/abc123'));
    });

    it('should add timestamp to YouTube embed', () => {
      render(<VideoPreview videoUrl="https://youtube.com/watch?v=test" timestamp="5:30" />);

      const iframe = screen.getByTitle('Video player');
      expect(iframe).toHaveAttribute('src', expect.stringContaining('start=330'));
    });

    it('should parse MM:SS timestamp', () => {
      render(<VideoPreview {...defaultProps} timestamp="2:30" />);

      const iframe = screen.getByTitle('Video player');
      expect(iframe).toHaveAttribute('src', expect.stringContaining('start=150'));
    });

    it('should parse H:MM:SS timestamp', () => {
      render(<VideoPreview {...defaultProps} timestamp="1:30:45" />);

      const iframe = screen.getByTitle('Video player');
      expect(iframe).toHaveAttribute('src', expect.stringContaining('start=5445'));
    });
  });

  describe('Vimeo URLs', () => {
    it('should embed Vimeo videos', () => {
      render(<VideoPreview videoUrl="https://vimeo.com/123456789" />);

      const iframe = screen.getByTitle('Video player');
      expect(iframe).toHaveAttribute('src', expect.stringContaining('vimeo.com'));
    });

    it('should add timestamp to Vimeo embed', () => {
      render(<VideoPreview videoUrl="https://vimeo.com/123456789" timestamp="5:30" />);

      const iframe = screen.getByTitle('Video player');
      expect(iframe).toHaveAttribute('src', expect.stringContaining('#t=5m30s'));
    });
  });

  describe('Loom URLs', () => {
    it('should embed Loom videos', () => {
      render(<VideoPreview videoUrl="https://www.loom.com/share/abc123" />);

      const iframe = screen.getByTitle('Video player');
      expect(iframe).toHaveAttribute('src', expect.stringContaining('loom.com'));
    });
  });

  describe('Descript URLs', () => {
    it('should embed Descript videos', () => {
      render(<VideoPreview videoUrl="https://share.descript.com/view/abc123" />);

      const iframe = screen.getByTitle('Video player');
      expect(iframe).toHaveAttribute('src', expect.stringContaining('descript.com'));
    });
  });

  describe('Unknown URLs', () => {
    it('should show placeholder for unknown video platforms', () => {
      render(<VideoPreview videoUrl="https://unknown.com/video/123" />);

      expect(screen.getByText(/video platform not supported/i)).toBeInTheDocument();
    });

    it('should display the video URL in placeholder', () => {
      render(<VideoPreview videoUrl="https://unknown.com/video/123" />);

      expect(screen.getByText(/unknown.com/i)).toBeInTheDocument();
    });
  });

  describe('No Video URL', () => {
    it('should not render when no videoUrl', () => {
      const { container } = render(<VideoPreview />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Timestamp Parsing', () => {
    it('should handle 0:00 timestamp', () => {
      render(<VideoPreview videoUrl="https://youtube.com/watch?v=test" timestamp="0:00" />);

      const iframe = screen.getByTitle('Video player');
      // YouTube embed with timestamp 0 shouldn't add start parameter (or start=0)
      expect(iframe).toBeInTheDocument();
    });

    it('should handle missing timestamp', () => {
      render(<VideoPreview videoUrl="https://youtube.com/watch?v=test" />);

      const iframe = screen.getByTitle('Video player');
      expect(iframe).toBeInTheDocument();
    });
  });
});