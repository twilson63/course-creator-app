/**
 * Tests for Toast Component
 *
 * @module tests/components/ui/Toast.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast, ToastProvider, useToast } from '@/components/ui/Toast';

describe('Toast', () => {
  const defaultProps = {
    id: 'toast-1',
    message: 'Test message',
    type: 'success' as const,
    onDismiss: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render message', () => {
      render(<Toast {...defaultProps} />);

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should render success type', () => {
      render(<Toast {...defaultProps} type="success" />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-green-50');
    });

    it('should render error type', () => {
      render(<Toast {...defaultProps} type="error" />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-red-50');
    });

    it('should render warning type', () => {
      render(<Toast {...defaultProps} type="warning" />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-yellow-50');
    });

    it('should render info type', () => {
      render(<Toast {...defaultProps} type="info" />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-blue-50');
    });
  });

  describe('Actions', () => {
    it('should call onDismiss when close clicked', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();

      render(<Toast {...defaultProps} onDismiss={onDismiss} />);
      await user.click(screen.getByRole('button', { name: /dismiss/i }));

      expect(onDismiss).toHaveBeenCalledWith('toast-1');
    });

    it('should auto-dismiss after duration', async () => {
      vi.useFakeTimers();
      const onDismiss = vi.fn();

      render(<Toast {...defaultProps} onDismiss={onDismiss} duration={3000} />);

      // Fast-forward 3 seconds
      vi.advanceTimersByTime(3000);

      expect(onDismiss).toHaveBeenCalledWith('toast-1');

      vi.useRealTimers();
    });

    it('should not auto-dismiss if duration is 0', async () => {
      vi.useFakeTimers();
      const onDismiss = vi.fn();

      render(<Toast {...defaultProps} onDismiss={onDismiss} duration={0} />);

      // Fast-forward 10 seconds
      vi.advanceTimersByTime(10000);

      expect(onDismiss).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('Icons', () => {
    it('should show success icon for success type', () => {
      render(<Toast {...defaultProps} type="success" />);

      // Check for checkmark icon
      expect(screen.getByRole('alert').querySelector('svg')).toBeInTheDocument();
    });
  });
});

describe('useToast', () => {
  it('should throw when used outside provider', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function TestComponent() {
      useToast();
      return null;
    }

    expect(() => render(<TestComponent />)).toThrow('useToast must be used within a ToastProvider');

    spy.mockRestore();
  });
});