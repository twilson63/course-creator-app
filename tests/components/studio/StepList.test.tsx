/**
 * Tests for StepList Component
 *
 * @module tests/components/studio/StepList.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepList } from '@/components/studio/StepList';
import type { CourseStep } from '@/types/course';

describe('StepList', () => {
  const mockSteps: CourseStep[] = [
    {
      id: 'step-1',
      title: 'Introduction',
      content: 'Welcome to the course',
      videoTimestamp: '0:00',
      estimatedTime: '5 minutes',
    },
    {
      id: 'step-2',
      title: 'Getting Started',
      content: 'Lets get started',
      videoTimestamp: '5:00',
    },
    {
      id: 'step-3',
      title: 'Advanced Topics',
      content: 'Advanced content',
      videoTimestamp: '10:00',
      estimatedTime: '15 minutes',
    },
  ];

  const defaultProps = {
    steps: mockSteps,
    activeStepId: 'step-1',
    onStepSelect: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render all steps', () => {
      render(<StepList {...defaultProps} />);

      expect(screen.getByText('Introduction')).toBeInTheDocument();
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
      expect(screen.getByText('Advanced Topics')).toBeInTheDocument();
    });

    it('should render steps in order', () => {
      render(<StepList {...defaultProps} />);

      const steps = screen.getAllByRole('button');
      expect(steps[0]).toHaveTextContent('Introduction');
      expect(steps[1]).toHaveTextContent('Getting Started');
      expect(steps[2]).toHaveTextContent('Advanced Topics');
    });

    it('should display step numbers', () => {
      render(<StepList {...defaultProps} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Active Step', () => {
    it('should highlight active step', () => {
      render(<StepList {...defaultProps} />);

      const activeStep = screen.getByText('Introduction').closest('button');
      expect(activeStep).toHaveClass('bg-blue-50');
    });

    it('should not highlight inactive steps', () => {
      render(<StepList {...defaultProps} />);

      const inactiveStep = screen.getByText('Getting Started').closest('button');
      expect(inactiveStep).not.toHaveClass('bg-blue-50');
    });

    it('should update active highlight when activeStepId changes', () => {
      const { rerender } = render(<StepList {...defaultProps} />);

      // Initially step 1 is active
      expect(screen.getByText('Introduction').closest('button')).toHaveClass('bg-blue-50');

      // Change active step
      rerender(<StepList {...defaultProps} activeStepId="step-2" />);

      // Now step 2 should be active
      expect(screen.getByText('Introduction').closest('button')).not.toHaveClass('bg-blue-50');
      expect(screen.getByText('Getting Started').closest('button')).toHaveClass('bg-blue-50');
    });
  });

  describe('Interaction', () => {
    it('should call onStepSelect when step clicked', async () => {
      const user = userEvent.setup();
      const onStepSelect = vi.fn();

      render(<StepList {...defaultProps} onStepSelect={onStepSelect} />);

      await user.click(screen.getByText('Getting Started'));

      expect(onStepSelect).toHaveBeenCalledWith('step-2');
    });

    it('should call onStepSelect with correct step id', async () => {
      const user = userEvent.setup();
      const onStepSelect = vi.fn();

      render(<StepList {...defaultProps} onStepSelect={onStepSelect} />);

      await user.click(screen.getByText('Advanced Topics'));

      expect(onStepSelect).toHaveBeenCalledWith('step-3');
    });
  });

  describe('Timestamps', () => {
    it('should display timestamps if available', () => {
      render(<StepList {...defaultProps} />);

      expect(screen.getByText('0:00')).toBeInTheDocument();
      expect(screen.getByText('5:00')).toBeInTheDocument();
      expect(screen.getByText('10:00')).toBeInTheDocument();
    });

    it('should handle steps without timestamps', () => {
      const stepsWithoutTimestamps: CourseStep[] = [
        { id: 'step-1', title: 'Step 1', content: 'Content' },
        { id: 'step-2', title: 'Step 2', content: 'Content' },
      ];

      render(<StepList {...defaultProps} steps={stepsWithoutTimestamps} />);

      // Should still render steps
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no steps', () => {
      render(<StepList {...defaultProps} steps={[]} />);

      expect(screen.getByText(/no steps/i)).toBeInTheDocument();
    });
  });
});