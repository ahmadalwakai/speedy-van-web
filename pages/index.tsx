import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Box, Spinner, Flex, Button, useColorModeValue } from '@chakra-ui/react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import logger from '@/services/logger';

// Dynamic imports for performance optimization
const Header = dynamic(() => import('@/components/Header'), { 
  ssr: false,
  loading: () => <Box height="60px" aria-hidden="true" />
});
const Hero = dynamic(() => import('@/components/sections/Hero'), {
  loading: () => <Box height="500px" aria-hidden="true" />
});
const WhyUs = dynamic(() => import('@/components/sections/WhyUs'), {
  loading: () => <Box height="400px" aria-hidden="true" />
});
const Features = dynamic(() => import('@/components/sections/Features'), {
  loading: () => <Box height="400px" aria-hidden="true" />
});
const Coverage = dynamic(() => import('@/components/sections/Coverage'), {
  loading: () => <Box height="400px" aria-hidden="true" />
});
const Testimonials = dynamic(() => import('@/components/sections/Testimonials'), {
  loading: () => <Box height="400px" aria-hidden="true" />
});
const Pricing = dynamic(() => import('@/components/sections/Pricing'), {
  loading: () => <Box height="400px" aria-hidden="true" />
});
const FAQ = dynamic(() => import('@/components/sections/FAQ'), {
  loading: () => <Box height="400px" aria-hidden="true" />
});
const CTA = dynamic(() => import('@/components/sections/CTA'), {
  loading: () => <Box height="300px" aria-hidden="true" />
});
const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => <Box height="200px" aria-hidden="true" />
});
const CookieConsent = dynamic(() => import('@/components/CookieConsent'), { 
  ssr: false,
  loading: () => null
});
const SupportChat = dynamic(() => import('@/components/SupportChat'), { 
  ssr: false,
  loading: () => null
});
const MapboxMap = dynamic(() => import('@/components/MapboxMap'), { 
  ssr: false,
  loading: () => <Box height="400px" aria-hidden="true" />
});

interface HomeProps {
  locale: string;
}

const Home: React.FC<HomeProps> = ({ locale }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    setIsMounted(true);
    logger.info('🏠 Home page loaded', { locale, sessionStatus: status });
  }, [locale, status]);

  if (!isMounted) {
    return (
      <Box 
        bg={bgColor} 
        color={textColor} 
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner 
          thickness="4px" 
          speed="0.65s" 
          emptyColor="gray.200" 
          color="blue.500" 
          size="xl"
          label="Loading page..."
        />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Speedy Van | Fast & Reliable Delivery Services</title>
        <meta name="description" content="Book fast, reliable, and affordable delivery services across the UK with Speedy Van." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3182CE" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="robots" content="index, follow" />
      </Head>

      <Box bg={bgColor} color={textColor} minH="100vh">
        <Header />

        {session && (
          <Flex justify="center" mt={4}>
            <Button 
              colorScheme="teal" 
              onClick={() => router.push('/customer-portal')}
              aria-label="Go to customer portal"
            >
              🚪 Go to Customer Portal
            </Button>
          </Flex>
        )}

        <Box as="main" aria-label="Main content">
          <Hero currentLocale={locale} />
          <WhyUs />
          <Features />
          <Coverage />
          <Testimonials />
          <Pricing />
          <FAQ />
          <CTA />
        </Box>

        <Footer />
        <SupportChat />
        <CookieConsent />

        {status === 'loading' && (
          <Box
            position="fixed"
            inset={0}
            bg="blackAlpha.600"
            zIndex="modal"
            display="flex"
            alignItems="center"
            justifyContent="center"
            aria-live="polite"
            aria-busy="true"
          >
            <Spinner 
              thickness="4px" 
              speed="0.65s" 
              emptyColor="gray.200" 
              color="blue.500" 
              size="xl"
              label="Loading session..."
            />
          </Box>
        )}
      </Box>
    </>
  );
};

export const getStaticProps: GetStaticProps<HomeProps> = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', [
        'common', 
        'home', 
        'navigation', 
        'auth', 
        'order', 
        'admin'
      ])),
      locale: locale || 'en',
    },
    revalidate: 3600,
  };
};

export default Home;