import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import OrderForm from '@/components/OrderForm';
import { useOrderStore, useAuthStore } from '@/stores';
import { useTranslation } from 'next-i18next';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

jest.mock('@/stores');
jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => <div>{children}</div>,
  CardElement: () => <div>Card Element</div>,
  useStripe: () => ({ confirmCardPayment: jest.fn().mockResolvedValue({ paymentIntent: { status: 'succeeded', id: 'pi_123' } }) }),
  useElements: () => ({ getElement: () => ({}) }),
}));
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn().mockResolvedValue({}),
}));

i18n.use(initReactI18next).init({
  lng: 'en',
  resources: { en: { common: en.common } },
});

describe('OrderForm', () => {
  beforeEach(() => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { username: 'testuser' },
    });
    (useOrderStore as jest.Mock).mockReturnValue({
      createOrder: jest.fn().mockResolvedValue(undefined),
      loading: false,
    });
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => en.common[key] || key,
    });
  });

  it('renders correctly', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ChakraProvider>
          <Elements stripe={null}>
            <OrderForm />
          </Elements>
        </ChakraProvider>
      </I18nextProvider>
    );
    expect(screen.getByPlaceholderText(/pickup location/i)).toBeInTheDocument();
    expect(screen.getByText(/payment/i)).toBeInTheDocument();
  });

  it('displays error on invalid input', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ChakraProvider>
          <Elements stripe={null}>
            <OrderForm />
          </Elements>
        </ChakraProvider>
      </I18nextProvider>
    );
    fireEvent.click(screen.getByText(/pay now/i));
    await waitFor(() => {
      expect(screen.getByText(/please fill all fields/i)).toBeInTheDocument();
    });
  });
});