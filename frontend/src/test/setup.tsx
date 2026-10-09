import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { AuthContext } from '../context/AuthContext';
import { EncryptionProvider } from '../context/EncryptionContext';
import type { ReactNode, ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TranslationContext } from '../context/TranslationContext';

// Standard test user mock
export const mockUser = {
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  display_name: 'Test User',
  is_staff: false,
};

const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return (
    <BrowserRouter>
      <EncryptionProvider>
        <TranslationContext.Provider value={{
          t: (key: string) => {
             const m = {
               'health_data_title': 'Health Data',
               'employee': 'Employee'
             }
             return m[key as keyof typeof m] || key;
          },
          language: 'en',
          setLanguage: () => {},
          loading: false,
          refreshTranslations: async () => {}
        }}>
          <AuthContext.Provider value={{
            user: mockUser,
            loading: false,
            login: async () => {},
            logout: () => {},
            updateUserProfile: () => {}
          }}>
            {children}
          </AuthContext.Provider>
        </TranslationContext.Provider>
      </EncryptionProvider>
    </BrowserRouter>
  );
};

export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<Parameters<typeof render>[1], 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });
