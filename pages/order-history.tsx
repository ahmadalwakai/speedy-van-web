import React, { useEffect } from 'react';
import { Box, Text, VStack, Button, useToast } from '@chakra-ui/react';
import { useOrderStore } from '@/stores/orderStore';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from 'next-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import logger from '@/services/logger';

/**
 * Order History page
 */
const OrderHistory: React.FC = () => {
  const { t } = useTranslation('common');
  const { user } = useAuthStore();
  const { orders, loading, error, fetchOrders, cancelOrder } = useOrderStore();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      fetchOrders(user.username, 1, 10);
      logger.info(`Fetching orders for user: ${user.username}`);
    }
  }, [user, fetchOrders]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId);
      logger.info(`Order cancelled: ${orderId}`);
      toast({
        title: t('success'),
        description: t('orderCancelled'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      logger.error(`Order cancellation failed for order ${orderId}: ${err}`);
      toast({
        title: t('error'),
        description: t('orderCancelFailed'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!user) {
    logger.warn('Order history accessed without user');
    return (
      <Box minH="100vh" display="flex" flexDirection="column">
        <Header />
        <Box p={8} flex={1} textAlign="center">
          <Text fontSize="xl">{t('pleaseLogin')}</Text>
        </Box>
        <Footer />
      </Box>
    );
  }

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header />
      <Box p={8} flex={1}>
        <Box fontSize="2xl" fontWeight="bold" mb={4}>
          {t('orderHistory')}
        </Box>
        {loading && <LoadingSpinner />}
        {error && <Text color="red.500">{error}</Text>}
        <VStack spacing={4}>
          {orders.length === 0 && !loading && <Text>{t('noOrders')}</Text>}
          {orders.map((order) => (
            <Box key={order.id} p={4} borderWidth="1px" borderRadius="lg" w="full">
              <Text>{t('orderId')}: {order.id}</Text>
              <Text>{t('pickupLocation')}: {order.pickupLocations.join(', ')}</Text>
              <Text>{t('dropoffLocation')}: {order.dropoffLocations.join(', ')}</Text>
              <Text>{t('packageType')}: {order.packageTypes.join(', ')}</Text>
              <Text>{t('status')}: {order.status}</Text>
              <Text>{t('price')}: ${order.price}</Text>
              {order.status === 'pending' && (
                <Button
                  colorScheme="red"
                  mt={2}
                  onClick={() => handleCancelOrder(order.id)}
                >
                  {t('cancelOrder')}
                </Button>
              )}
            </Box>
          ))}
        </VStack>
      </Box>
      <Footer />
    </Box>
  );
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default OrderHistory;