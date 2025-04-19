import '@/styles/global.css';
import type { AppProps } from 'next/app';
import { ChakraProvider, useToast } from '@chakra-ui/react';
import { appWithTranslation } from 'next-i18next';
import theme from '@/theme';
import Script from 'next/script';
import nextI18NextConfig from '../next-i18next.config';
import logger from '@/services/logger';
import { useEffect } from 'react';

const AppContent: React.FC<{ googleApiKey?: string; children: React.ReactNode }> = ({ googleApiKey, children }) => {
  const toast = useToast();

  useEffect(() => {
    if (!googleApiKey) {
      logger.error('❌ Google API key is missing in environment variables');
      toast({
        title: 'Configuration Error',
        description: 'Google API key is missing. Please check .env.local.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [googleApiKey, toast]);

  return <>{children}</>;
};

function MyApp({ Component, pageProps }: AppProps) {
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  return (
    <ChakraProvider theme={theme}>
      {googleApiKey && (
        <Script
          id="google-maps"
          strategy="afterInteractive"
          src={`https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`}
          onLoad={() => {
            logger.info('✅ Google Maps API loaded successfully');
          }}
          onError={(error) => {
            logger.error(`❌ Failed to load Google Maps API: ${error.message}`, error);
          }}
        />
      )}
      <AppContent googleApiKey={googleApiKey}>
        <Component {...pageProps} />
      </AppContent>
    </ChakraProvider>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);
