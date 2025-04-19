import React, { useEffect, useState } from 'react';
import { Box, Text, useToast } from '@chakra-ui/react';
import Map from 'react-map-gl';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useTranslation } from 'next-i18next';
import { getETA } from '@/utils/directions';
import logger from '@/services/logger';

/**
 * LiveTracking component for real-time order tracking
 * @param orderId - ID of the order to track
 */
const LiveTracking: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { t } = useTranslation('common');
  const toast = useToast();
  const driverLocation = useWebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/track/${orderId}`);
  const [eta, setEta] = useState<string>('');

  useEffect(() => {
    if (driverLocation) {
      getETA([driverLocation.lat, driverLocation.lng], [0, 0])
        .then((eta) => {
          setEta(eta);
          logger.info(`ETA calculated for order ${orderId}: ${eta}`);
        })
        .catch((error) => {
          logger.error(`ETA calculation failed for order ${orderId}: ${error}`);
          toast({
            title: t('error'),
            description: t('etaCalculationFailed'),
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        });
    }
  }, [driverLocation, toast, t, orderId]);

  return (
    <Box p={4}>
      <Text fontSize="xl">{t('liveTracking')}</Text>
      <Text>{t('eta')}: {eta || t('calculating')}</Text>
      <Map
        initialViewState={{
          latitude: driverLocation?.lat || 0,
          longitude: driverLocation?.lng || 0,
          zoom: 14,
        }}
        style={{ width: '100%', height: '400px' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      />
    </Box>
  );
};

export default LiveTracking;