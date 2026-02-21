/**
 * Tests for Spinner Component
 *
 * @module tests/components/ui/Spinner.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from '@/components/ui/Spinner';

describe('Spinner', () => {
  describe('Rendering', () => {
    it('should render spinner', () => {
      render(<Spinner />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have default size', () => {
      render(<Spinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-5', 'h-5');
    });

    it('should render small size', () => {
      render(<Spinner size="sm" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-4', 'h-4');
    });

    it('should render medium size', () => {
      render(<Spinner size="md" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-5', 'h-5');
    });

    it('should render large size', () => {
      render(<Spinner size="lg" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-8', 'h-8');
    });

    it('should render extra large size', () => {
      render(<Spinner size="xl" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-12', 'h-12');
    });
  });

  describe('Colors', () => {
    it('should have default color', () => {
      render(<Spinner />);

      const spinner = screen.getByRole('status');
      expect(spinner.querySelector('circle')).toHaveClass('text-gray-200');
    });

    it('should render primary color', () => {
      render(<Spinner color="primary" />);

      const spinner = screen.getByRole('status');
      expect(spinner.querySelector('circle')).toHaveClass('text-blue-200');
    });

    it('should render white color', () => {
      render(<Spinner color="white" />);

      const spinner = screen.getByRole('status');
      expect(spinner.querySelector('circle')).toHaveClass('text-white/30');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label', () => {
      render(<Spinner />);

      expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
    });

    it('should allow custom label', () => {
      render(<Spinner aria-label="Saving..." />);

      expect(screen.getByLabelText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<Spinner className="mt-4" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('mt-4');
    });
  });
});