import '@/styles/global.css';
import type { AppProps } from 'next/app';
import { ChakraProvider, useToast, Box } from '@chakra-ui/react';
import { appWithTranslation } from 'next-i18next';
import { SessionProvider } from 'next-auth/react';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import theme from '@/theme';
import nextI18NextConfig from '../next-i18next.config';
import logger from '@/services/logger';

const AppContent: React.FC<{ mapboxToken?: string; children: React.ReactNode }> = ({ 
  mapboxToken, 
  children 
}) => {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!mapboxToken && mounted) {
      logger.error('❌ Mapbox access token is missing in environment variables');
      toast({
        title: 'Configuration Error',
        description: 'Mapbox access token is missing. Please check .env.local.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [mapboxToken, toast, mounted]);

  if (!mounted) return null;

  return <Box as="main">{children}</Box>;
};

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const [mounted, setMounted] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      <ChakraProvider theme={theme}>
        {mapboxToken && (
          <>
            {/* Mapbox GL JS */}
            <Script
              id="mapbox-gl-js"
              strategy="beforeInteractive"
              src={`https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.js`}
              onLoad={() => logger.info('✅ Mapbox GL JS loaded successfully')}
              onError={() => {
                logger.error('❌ Failed to load Mapbox GL JS');
                toast({
                  title: 'Map Error',
                  description: 'Failed to load map functionality',
                  status: 'error',
                  duration: 5000,
                  isClosable: true,
                });
              }}
            />
            
            {/* Mapbox GL CSS */}
            <link
              href="https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css"
              rel="stylesheet"
            />
          </>
        )}

        <AppContent mapboxToken={mapboxToken}>
          <Component {...pageProps} />
        </AppContent>
      </ChakraProvider>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);