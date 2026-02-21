/**
 * Tests for Skeleton Component
 *
 * @module tests/components/ui/Skeleton.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonCard, SkeletonList } from '@/components/ui/Skeleton';

describe('Skeleton', () => {
  describe('Basic Skeleton', () => {
    it('should render skeleton element', () => {
      render(<Skeleton />);

      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should have animate-pulse class', () => {
      render(<Skeleton />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should apply width', () => {
      render(<Skeleton width="w-32" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('w-32');
    });

    it('should apply height', () => {
      render(<Skeleton height="h-8" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-8');
    });

    it('should apply rounded class', () => {
      render(<Skeleton rounded />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('rounded');
    });

    it('should apply custom className', () => {
      render(<Skeleton className="mt-4" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('mt-4');
    });
  });

  describe('SkeletonCard', () => {
    it('should render card skeleton', () => {
      render(<SkeletonCard />);

      expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
    });

    it('should have header skeleton', () => {
      render(<SkeletonCard />);

      const card = screen.getByTestId('skeleton-card');
      expect(card.querySelector('.skeleton-header')).toBeInTheDocument();
    });

    it('should have content skeleton', () => {
      render(<SkeletonCard />);

      const card = screen.getByTestId('skeleton-card');
      expect(card.querySelector('.skeleton-content')).toBeInTheDocument();
    });
  });

  describe('SkeletonList', () => {
    it('should render list skeleton with default count', () => {
      render(<SkeletonList />);

      const items = screen.getAllByTestId('skeleton-item');
      expect(items).toHaveLength(3);
    });

    it('should render custom count', () => {
      render(<SkeletonList count={5} />);

      const items = screen.getAllByTestId('skeleton-item');
      expect(items).toHaveLength(5);
    });
  });
});