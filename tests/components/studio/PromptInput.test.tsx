/**
 * Tests for PromptInput Component
 *
 * @module tests/components/studio/PromptInput.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptInput } from '@/components/studio/PromptInput';

describe('PromptInput', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    isProcessing: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render input field', () => {
      render(<PromptInput {...defaultProps} />);

      expect(screen.getByPlaceholderText(/describe changes/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<PromptInput {...defaultProps} />);

      expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
    });

    it('should show keyboard shortcut hint', () => {
      render(<PromptInput {...defaultProps} />);

      expect(screen.getByText(/⌘\+Enter/i)).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('should update input value on change', async () => {
      const user = userEvent.setup();
      render(<PromptInput {...defaultProps} />);

      const input = screen.getByPlaceholderText(/describe changes/i);
      await user.type(input, 'Make the title more engaging');

      expect(input).toHaveValue('Make the title more engaging');
    });

    it('should clear input after submit', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<PromptInput {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText(/describe changes/i);
      await user.type(input, 'Update the title');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      expect(input).toHaveValue('');
    });
  });

  describe('Submission', () => {
    it('should call onSubmit with prompt', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<PromptInput {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText(/describe changes/i);
      await user.type(input, 'Add a new step about authentication');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      expect(onSubmit).toHaveBeenCalledWith('Add a new step about authentication');
    });

    it('should submit on Cmd+Enter', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<PromptInput {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText(/describe changes/i);
      await user.type(input, 'Make it more concise');
      await user.keyboard('{Meta>}{Enter}{/Meta}');

      expect(onSubmit).toHaveBeenCalledWith('Make it more concise');
    });

    it('should not submit empty prompt', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<PromptInput {...defaultProps} onSubmit={onSubmit} />);

      await user.click(screen.getByRole('button', { name: /apply/i }));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should not submit whitespace-only prompt', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<PromptInput {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText(/describe changes/i);
      await user.type(input, '   ');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Processing State', () => {
    it('should disable input when processing', () => {
      render(<PromptInput {...defaultProps} isProcessing={true} />);

      const input = screen.getByPlaceholderText(/describe changes/i);
      expect(input).toBeDisabled();
    });

    it('should disable button when processing', () => {
      render(<PromptInput {...defaultProps} isProcessing={true} />);

      const button = screen.getByRole('button', { name: /applying/i });
      expect(button).toBeDisabled();
    });

    it('should show processing text on button', () => {
      render(<PromptInput {...defaultProps} isProcessing={true} />);

      expect(screen.getByRole('button', { name: /applying/i })).toBeInTheDocument();
    });
  });

  describe('Cancel', () => {
    it('should show cancel button when processing', () => {
      render(<PromptInput {...defaultProps} isProcessing={true} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should call onCancel when cancel clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<PromptInput {...defaultProps} isProcessing={true} onCancel={onCancel} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalled();
    });
  });
});