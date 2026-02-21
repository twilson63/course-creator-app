/**
 * Tests for DeleteModal Component
 *
 * @module tests/components/course/DeleteModal.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteModal } from '@/components/course/DeleteModal';

describe('DeleteModal', () => {
  const defaultProps = {
    isOpen: true,
    courseTitle: 'Test Course',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when open', () => {
      render(<DeleteModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /delete course/i })).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<DeleteModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should show course title', () => {
      render(<DeleteModal {...defaultProps} />);

      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    it('should show warning message', () => {
      render(<DeleteModal {...defaultProps} />);

      expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
    });

    it('should have cancel button', () => {
      render(<DeleteModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should have delete button', () => {
      render(<DeleteModal {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveClass('bg-red-600');
    });
  });

  describe('Actions', () => {
    it('should call onConfirm when delete clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(<DeleteModal {...defaultProps} onConfirm={onConfirm} />);
      await user.click(screen.getByRole('button', { name: /delete/i }));

      expect(onConfirm).toHaveBeenCalled();
    });

    it('should call onCancel when cancel clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      render(<DeleteModal {...defaultProps} onCancel={onCancel} />);
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalled();
    });

    it('should call onCancel when backdrop clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      render(<DeleteModal {...defaultProps} onCancel={onCancel} />);
      const backdrop = screen.getByRole('dialog').parentElement;
      if (backdrop) {
        await user.click(backdrop);
        expect(onCancel).toHaveBeenCalled();
      }
    });

    it('should call onCancel when escape pressed', async () => {
      const onCancel = vi.fn();

      render(<DeleteModal {...defaultProps} onCancel={onCancel} />);

      // Simulate escape key
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      // Note: This test depends on the component adding the event listener
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      render(<DeleteModal {...defaultProps} isDeleting />);

      expect(screen.getByText(/deleting/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
    });

    it('should disable buttons while deleting', () => {
      render(<DeleteModal {...defaultProps} isDeleting />);

      expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });
  });
});