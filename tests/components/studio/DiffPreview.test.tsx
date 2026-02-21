/**
 * Tests for DiffPreview Component
 *
 * @module tests/components/studio/DiffPreview.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiffPreview } from '@/components/studio/DiffPreview';
import type { DiffResult } from '@/lib/course/refine';

describe('DiffPreview', () => {
  const mockChanges: DiffResult[] = [
    {
      type: 'meta',
      field: 'title',
      oldValue: 'Original Title',
      newValue: 'New Title',
    },
    {
      type: 'meta',
      field: 'description',
      oldValue: 'Old description',
      newValue: 'New description',
    },
  ];

  const defaultProps = {
    changes: mockChanges,
    onAccept: vi.fn(),
    onReject: vi.fn(),
  };

  describe('Rendering', () => {
    it('should display changes summary', () => {
      render(<DiffPreview {...defaultProps} />);

      expect(screen.getByText(/changes detected/i)).toBeInTheDocument();
    });

    it('should show number of changes', () => {
      render(<DiffPreview {...defaultProps} />);

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display each change', () => {
      render(<DiffPreview {...defaultProps} />);

      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('Original Title')).toBeInTheDocument();
      expect(screen.getByText('New Title')).toBeInTheDocument();
    });

    it('should show accept and reject buttons', () => {
      render(<DiffPreview {...defaultProps} />);

      expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
    });
  });

  describe('Change Types', () => {
    it('should display meta changes correctly', () => {
      const changes: DiffResult[] = [
        { type: 'meta', field: 'title', oldValue: 'A', newValue: 'B' },
      ];

      render(<DiffPreview {...defaultProps} changes={changes} />);

      // Meta changes show the field name
      expect(screen.getByText('title')).toBeInTheDocument();
    });

    it('should display added steps', () => {
      const changes: DiffResult[] = [
        { type: 'step', action: 'added', stepId: 'step-3', stepTitle: 'New Step' },
      ];

      render(<DiffPreview {...defaultProps} changes={changes} />);

      expect(screen.getByText(/added/i)).toBeInTheDocument();
      expect(screen.getByText('New Step')).toBeInTheDocument();
    });

    it('should display removed steps', () => {
      const changes: DiffResult[] = [
        { type: 'step', action: 'removed', stepId: 'step-2', stepTitle: 'Old Step' },
      ];

      render(<DiffPreview {...defaultProps} changes={changes} />);

      expect(screen.getByText(/removed/i)).toBeInTheDocument();
    });

    it('should display modified steps', () => {
      const changes: DiffResult[] = [
        {
          type: 'step',
          action: 'modified',
          stepId: 'step-1',
          stepTitle: 'Step 1',
          field: 'content',
          oldValue: 'Old content',
          newValue: 'New content',
        },
      ];

      render(<DiffPreview {...defaultProps} changes={changes} />);

      expect(screen.getByText(/modified/i)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onAccept when accept clicked', async () => {
      const user = userEvent.setup();
      const onAccept = vi.fn();
      render(<DiffPreview {...defaultProps} onAccept={onAccept} />);

      await user.click(screen.getByRole('button', { name: /accept/i }));

      expect(onAccept).toHaveBeenCalled();
    });

    it('should call onReject when reject clicked', async () => {
      const user = userEvent.setup();
      const onReject = vi.fn();
      render(<DiffPreview {...defaultProps} onReject={onReject} />);

      await user.click(screen.getByRole('button', { name: /reject/i }));

      expect(onReject).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should show no changes message when empty', () => {
      render(<DiffPreview {...defaultProps} changes={[]} />);

      expect(screen.getByText(/no changes/i)).toBeInTheDocument();
    });
  });

  describe('Processing State', () => {
    it('should disable buttons when processing', () => {
      render(<DiffPreview {...defaultProps} isProcessing={true} />);

      expect(screen.getByRole('button', { name: /accept/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /reject/i })).toBeDisabled();
    });

    it('should show spinner when processing', () => {
      render(<DiffPreview {...defaultProps} isProcessing={true} />);

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });
});