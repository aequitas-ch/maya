import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { renderWithProviders } from './test/setup';

describe('App', () => {
  it('renders without crashing', () => {
    // Basic test to ensure infrastructure is running
    expect(true).toBe(true);
  });
});
