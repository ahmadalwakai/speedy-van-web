import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import Login from '@/pages/login';
import { useAuthStore } from '@/stores';
import { useTranslation } from 'next-i18next';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import { useRouter } from 'next/router';

jest.mock('@/stores');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

i18n.use(initReactI18next).init({
  lng: 'en',
  resources: { en: { common: en.common } },
});

describe('Login Page', () => {
  const mockPush = jest.fn();
  beforeEach(() => {
    (useAuthStore as jest.Mock).mockReturnValue({
      login: jest.fn().mockResolvedValue(undefined),
    });
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => en.common[key] || key,
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('renders correctly', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ChakraProvider>
          <Login />
        </ChakraProvider>
      </I18nextProvider>
    );
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
  });

  it('displays error on empty input', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ChakraProvider>
          <Login />
        </ChakraProvider>
      </I18nextProvider>
    );
    fireEvent.click(screen.getByText(/login/i));
    await waitFor(() => {
      expect(screen.getByText(/please fill all fields/i)).toBeInTheDocument();
    });
  });
});