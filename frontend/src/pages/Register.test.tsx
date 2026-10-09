import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { Register } from './Register';
import { renderWithProviders } from '../test/setup';
import api from '../api/axios';

vi.mock('../api/axios');

describe('Register Component', () => {
  it('blocks submit for invalid email & password < 8 chars', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole('button', { name: /Register|Sign Up/i });

    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, '1234567');
    await user.click(submitBtn);

    // Expect some error message to be shown
    // Note: Zod or HTML validation will show error
    expect(api.post).not.toHaveBeenCalled();
  });
});
