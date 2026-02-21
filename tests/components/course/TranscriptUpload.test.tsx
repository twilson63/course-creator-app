/**
 * Tests for TranscriptUpload Component
 *
 * @module tests/components/course/TranscriptUpload.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TranscriptUpload } from '@/components/course/TranscriptUpload';

describe('TranscriptUpload', () => {
  const mockOnUpload = vi.fn();

  beforeEach(() => {
    mockOnUpload.mockClear();
  });

  describe('Rendering', () => {
    it('should render upload area', () => {
      render(<TranscriptUpload onUpload={mockOnUpload} />);

      expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
      expect(screen.getByText(/\.txt, \.md, or \.json/i)).toBeInTheDocument();
    });

    it('should render with current transcript', () => {
      render(
        <TranscriptUpload
          onUpload={mockOnUpload}
          currentTranscript="This is a sample transcript."
        />
      );

      expect(screen.getByText(/current transcript/i)).toBeInTheDocument();
      expect(screen.getByText(/this is a sample transcript/i)).toBeInTheDocument();
    });

    it('should truncate long transcript preview', () => {
      const longTranscript = 'a'.repeat(300);
      render(
        <TranscriptUpload
          onUpload={mockOnUpload}
          currentTranscript={longTranscript}
        />
      );

      expect(screen.getByText(/aaa\.\.\./i)).toBeInTheDocument();
    });

    it('should show disabled state', () => {
      render(<TranscriptUpload onUpload={mockOnUpload} disabled />);

      // The drop zone should have opacity-50 class when disabled
      const dropZone = document.querySelector('.opacity-50');
      expect(dropZone).toBeTruthy();
    });

    it('should show loading state', () => {
      render(<TranscriptUpload onUpload={mockOnUpload} isLoading />);

      // Should not be clickable
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });

  describe('File Selection', () => {
    it('should accept valid .txt file', async () => {
      render(<TranscriptUpload onUpload={mockOnUpload} />);

      const file = new File(['transcript content'], 'transcript.txt', {
        type: 'text/plain',
      });

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith('transcript content', 'transcript.txt');
      });
    });

    it('should accept valid .md file', async () => {
      render(<TranscriptUpload onUpload={mockOnUpload} />);

      const file = new File(['# Transcript', 'content'], 'transcript.md', {
        type: 'text/markdown',
      });

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalled();
      });
    });

    it('should accept valid .json file with transcript field', async () => {
      render(<TranscriptUpload onUpload={mockOnUpload} />);

      const file = new File(
        ['{"transcript": "Hello world"}'],
        'transcript.json',
        { type: 'application/json' }
      );

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith('Hello world', 'transcript.json');
      });
    });

    it('should show error for invalid file type', async () => {
      render(<TranscriptUpload onUpload={mockOnUpload} />);

      const file = new File(['content'], 'transcript.pdf', {
        type: 'application/pdf',
      });

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument();
      });

      expect(mockOnUpload).not.toHaveBeenCalled();
    });

    it('should show error for file too large', async () => {
      render(<TranscriptUpload onUpload={mockOnUpload} />);

      // Create a file larger than 1MB
      const largeContent = 'x'.repeat(1024 * 1024 + 1);
      const file = new File([largeContent], 'transcript.txt', {
        type: 'text/plain',
      });

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/file too large/i)).toBeInTheDocument();
      });

      expect(mockOnUpload).not.toHaveBeenCalled();
    });

    it('should show error for invalid JSON', async () => {
      render(<TranscriptUpload onUpload={mockOnUpload} />);

      const file = new File(['{"invalid": json}'], 'transcript.json', {
        type: 'application/json',
      });

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByText(/invalid json/i)).toBeInTheDocument();
      });

      expect(mockOnUpload).not.toHaveBeenCalled();
    });
  });

  describe('Drag and Drop', () => {
    it('should show drag state on drag enter', () => {
      render(<TranscriptUpload onUpload={mockOnUpload} />);

      // Get the drop zone by its border class
      const dropZone = document.querySelector('.border-dashed');
      
      fireEvent.dragEnter(dropZone!, {
        dataTransfer: { files: [] },
      });

      // After drag enter, it should have border-blue-500 class
      expect(dropZone).toHaveClass('border-blue-500');
    });

    it('should handle file drop', async () => {
      render(<TranscriptUpload onUpload={mockOnUpload} />);

      const file = new File(['transcript content'], 'transcript.txt', {
        type: 'text/plain',
      });

      const dropZone = document.querySelector('.border-dashed');

      fireEvent.drop(dropZone!, {
        dataTransfer: { files: [file] },
      });

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith('transcript content', 'transcript.txt');
      });
    });

    it('should not accept drop when disabled', async () => {
      render(<TranscriptUpload onUpload={mockOnUpload} disabled />);

      const file = new File(['transcript content'], 'transcript.txt', {
        type: 'text/plain',
      });

      const dropZone = document.querySelector('.border-dashed');

      fireEvent.drop(dropZone!, {
        dataTransfer: { files: [file] },
      });

      // Should not call onUpload because disabled
      expect(mockOnUpload).not.toHaveBeenCalled();
    });
  });
});