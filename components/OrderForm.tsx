import React, { useState } from 'react';
import { Box, Button, Input, VStack, useToast, Icon, Text } from '@chakra-ui/react';
import { useOrderStore } from '@/stores/orderStore';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from 'next-i18next';
import { FaPlus } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import LoadingSpinner from './LoadingSpinner';
import logger from '@/services/logger';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

/**
 * PaymentForm component for handling Stripe payments
 */
const PaymentForm: React.FC<{
  onSuccess: (paymentIntentId: string) => void;
  amount: number;
  onLoading: (isLoading: boolean) => void;
}> = ({ onSuccess, amount, onLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation('common');
  const toast = useToast();

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    onLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount * 100 }), // Convert to cents
      });
      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement)! },
      });

      if (result.error) {
        logger.error(`Payment failed: ${result.error.message}`);
        toast({
          title: t('error'),
          description: result.error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else if (result.paymentIntent?.status === 'succeeded') {
        logger.info(`Payment succeeded: ${result.paymentIntent.id}`);
        onSuccess(result.paymentIntent.id);
      }
    } catch (error) {
      logger.error(`Payment error: ${error}`);
      toast({
        title: t('error'),
        description: t('paymentFailed'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onLoading(false);
    }
  };

  return (
    <VStack spacing={4}>
      <CardElement />
      <Button colorScheme="brand" onClick={handlePayment} isDisabled={!stripe}>
        {t('payNow')}
      </Button>
    </VStack>
  );
};

/**
 * OrderForm component for creating delivery orders with payment
 */
const OrderForm: React.FC = () => {
  const { t } = useTranslation('common');
  const [orderData, setOrderData] = useState({
    pickupLocations: [''],
    dropoffLocations: [''],
    packageTypes: [''],
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { createOrder, loading } = useOrderStore();
  const { user } = useAuthStore();
  const toast = useToast();

  const handleAddField = (field: keyof typeof orderData) => {
    setOrderData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const handleInputChange = (index: number, field: keyof typeof orderData, value: string) => {
    setOrderData((prev) => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => (i === index ? value : item)),
    }));
  };

  const validateInputs = () => {
    return (
      orderData.pickupLocations.every((loc) => loc.trim()) &&
      orderData.dropoffLocations.every((loc) => loc.trim()) &&
      orderData.packageTypes.every((type) => type.trim())
    );
  };

  const handleOrderSubmit = async (paymentIntentId: string) => {
    if (!user) {
      logger.warn('Order submission attempted without user');
      toast({
        title: t('error'),
        description: t('pleaseLogin'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (!validateInputs()) {
      logger.warn('Invalid order input');
      toast({
        title: t('error'),
        description: t('invalidInput'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      await createOrder({
        username: user.username,
        ...orderData,
        paymentIntentId,
      });
      logger.info(`Order created for user: ${user.username}`);
      toast({
        title: t('success'),
        description: t('orderCreated'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setOrderData({ pickupLocations: [''], dropoffLocations: [''], packageTypes: [''] });
    } catch (error) {
      logger.error(`Order creation failed: ${error}`);
      toast({
        title: t('error'),
        description: t('orderCreationFailed'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      {(loading || paymentLoading) && <LoadingSpinner />}
      <VStack spacing={4}>
        <Text fontSize="lg" fontWeight="bold">{t('orderDetails')}</Text>
        {orderData.pickupLocations.map((loc, index) => (
          <Input
            key={index}
            placeholder={t('pickupLocation')}
            value={loc}
            onChange={(e) => handleInputChange(index, 'pickupLocations', e.target.value)}
          />
        ))}
        <Button leftIcon={<Icon as={FaPlus} />} onClick={() => handleAddField('pickupLocations')}>
          {t('addPickup')}
        </Button>
        {orderData.dropoffLocations.map((loc, index) => (
          <Input
            key={index}
            placeholder={t('dropoffLocation')}
            value={loc}
            onChange={(e) => handleInputChange(index, 'dropoffLocations', e.target.value)}
          />
        ))}
        <Button leftIcon={<Icon as={FaPlus} />} onClick={() => handleAddField('dropoffLocations')}>
          {t('addDropoff')}
        </Button>
        {orderData.packageTypes.map((type, index) => (
          <Input
            key={index}
            placeholder={t('packageType')}
            value={type}
            onChange={(e) => handleInputChange(index, 'packageTypes', e.target.value)}
          />
        ))}
        <Button leftIcon={<Icon as={FaPlus} />} onClick={() => handleAddField('packageTypes')}>
          {t('addPackage')}
        </Button>
        <Text fontSize="lg" fontWeight="bold">{t('payment')}</Text>
        <Elements stripe={stripePromise}>
          <PaymentForm
            onSuccess={handleOrderSubmit}
            amount={10} // Fixed amount for demo ($10)
            onLoading={setPaymentLoading}
          />
        </Elements>
      </VStack>
    </Box>
  );
};

export default OrderForm;