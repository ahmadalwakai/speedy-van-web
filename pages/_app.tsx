import '@/styles/global.css';
import type { AppProps } from 'next/app';
import { ChakraProvider, useToast, Box } from '@chakra-ui/react';
import { appWithTranslation } from 'next-i18next';
import { SessionProvider } from 'next-auth/react';
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
        <AppContent mapboxToken={mapboxToken}>
          <Component {...pageProps} />
        </AppContent>
      </ChakraProvider>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);