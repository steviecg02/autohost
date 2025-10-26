import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LoginDialog } from './LoginDialog';

describe('LoginDialog', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open is true', () => {
    render(<LoginDialog open={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Enter your credentials to access your account.')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<LoginDialog open={false} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('validates empty email', async () => {
    const user = userEvent.setup();
    render(<LoginDialog open={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /^login$/i });
    await user.click(submitButton);

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates invalid email format', async () => {
    const user = userEvent.setup();
    render(<LoginDialog open={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');

    const form = emailInput.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(await screen.findByText('Invalid email format')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates empty password', async () => {
    const user = userEvent.setup();
    render(<LoginDialog open={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /^login$/i });
    await user.click(submitButton);

    expect(await screen.findByText('Password is required')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates password minimum length', async () => {
    const user = userEvent.setup();
    render(<LoginDialog open={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'short');

    const submitButton = screen.getByRole('button', { name: /^login$/i });
    await user.click(submitButton);

    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid credentials', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(<LoginDialog open={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /^login$/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('displays error when submit fails', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginDialog open={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /^login$/i });
    await user.click(submitButton);

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    mockOnSubmit.mockReturnValue(submitPromise);

    render(<LoginDialog open={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /^login$/i });
    await user.click(submitButton);

    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    resolveSubmit!();
    await waitFor(() => {
      expect(screen.queryByText('Logging in...')).not.toBeInTheDocument();
    });
  });

  it('closes dialog when cancel button clicked', async () => {
    const user = userEvent.setup();
    render(<LoginDialog open={true} onOpenChange={mockOnOpenChange} onSubmit={mockOnSubmit} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
