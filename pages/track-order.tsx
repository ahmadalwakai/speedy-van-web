import React from 'react';
import { Box } from '@chakra-ui/react';
import LiveTracking from '@/components/LiveTracking';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import logger from '@/services/logger';

/**
 * Track Order page
 */
const TrackOrderPage: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { orderId } = router.query;

  React.useEffect(() => {
    logger.info(`Track order page loaded for orderId: ${orderId || 'unknown'}`);
  }, [orderId]);

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Header />
      <Box p={8} flex={1}>
        <Box fontSize="2xl" fontWeight="bold" mb={4}>
          {t('trackOrder')}
        </Box>
        {orderId ? (
          <LiveTracking orderId={orderId as string} />
        ) : (
          <Box>{t('noOrderId')}</Box>
        )}
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

export default TrackOrderPage;