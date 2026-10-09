import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Health } from './Health';
import { renderWithProviders } from '../../test/setup';

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
