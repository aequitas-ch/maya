import { screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { Health } from './Health';
import { renderWithProviders } from '../../test/setup';
import api from '../../api/axios';

vi.mock('../../api/axios', () => {
  return {
    default: {
      get: vi.fn(() => Promise.resolve({ data: { results: [] } })),
      post: vi.fn()
    }
  };
});

describe('Health Component', () => {
  it('renders correctly', async () => {
    renderWithProviders(<Health />);
    expect(await screen.findByText(/Health Data/i)).toBeInTheDocument();
  });
});
