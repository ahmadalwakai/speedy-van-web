import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Box, Spinner, Flex, Button, useColorModeValue } from '@chakra-ui/react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import logger from '@/services/logger';
import NextLink from 'next/link';

// Dynamic imports for performance optimization
const Header = dynamic(() => import('@/components/Header'), {
  ssr: false,
  loading: () => <Box height="60px" aria-hidden="true" />,
});
const Hero = dynamic(() => import('@/components/sections/Hero'), {
  loading: () => <Box height="500px" aria-hidden="true" />,
});
const HeroDescription = dynamic(() => import('@/components/sections/HeroDescription'), {
  loading: () => <Box height="300px" aria-hidden="true" />,
});
const WhyUs = dynamic(() => import('@/components/sections/WhyUs'), {
  loading: () => <Box height="400px" aria-hidden="true" />,
});
const Features = dynamic(() => import('@/components/sections/Features'), {
  loading: () => <Box height="400px" aria-hidden="true" />,
});
const Coverage = dynamic(() => import('@/components/sections/Coverage'), {
  loading: () => <Box height="400px" aria-hidden="true" />,
});
const Testimonials = dynamic(() => import('@/components/sections/Testimonials'), {
  loading: () => <Box height="400px" aria-hidden="true" />,
});
const Pricing = dynamic(() => import('@/components/sections/Pricing'), {
  loading: () => <Box height="400px" aria-hidden="true" />,
});
const FAQ = dynamic(() => import('@/components/sections/FAQ'), {
  loading: () => <Box height="400px" aria-hidden="true" />,
});
const CTA = dynamic(() => import('@/components/sections/CTA'), {
  loading: () => <Box height="300px" aria-hidden="true" />,
});
const Footer = dynamic(() => import('@/components/Footer'), {
  loading: () => <Box height="200px" aria-hidden="true" />,
});
const CookieConsent = dynamic(() => import('@/components/CookieConsent'), {
  ssr: false,
  loading: () => null,
});
const SupportChat = dynamic(() => import('@/components/SupportChat'), {
  ssr: false,
  loading: () => null,
});

interface HomeProps {
  locale: string;
}

const Home: React.FC<HomeProps> = ({ locale }) => {
  const { t } = useTranslation(['home', 'common']);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    setIsMounted(true);
    logger.info('🏠 Home page loaded', { locale, sessionStatus: status, path: router.asPath });
  }, [locale, status, router.asPath]);

  // JSON-LD Schema Markup
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Speedy Van',
    url: 'https://speedy-van.co.uk',
    logo: 'https://speedy-van.co.uk/logo.png',
    description: t('home:description', {
      defaultValue:
        'Speedy Van offers fast, reliable, and affordable van delivery services across the UK.',
    }),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+447901846297',
      contactType: 'Customer Service',
      email: 'info@speedy-van.co.uk',
    },
    sameAs: [
      'https://www.facebook.com/speedyvan',
      'https://www.twitter.com/speedyvan',
      'https://www.linkedin.com/company/speedyvan',
    ],
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://speedy-van.co.uk',
    name: 'Speedy Van',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://speedy-van.co.uk/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

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
          color="primary.500"
          size="xl"
          label="Loading page..."
        />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>
          {t('home:title', { defaultValue: 'Speedy Van | Fast & Affordable Van Delivery Services Across the UK' })}
        </title>
        <meta
          name="description"
          content={t('home:description', {
            defaultValue:
              'Book reliable van delivery services with Speedy Van. Covering all UK cities with fast, secure, and affordable transport solutions. Get your free quote today!',
          })}
        />
        <meta
          name="keywords"
          content={t('home:keywords', {
            defaultValue: 'Van Delivery UK, Fast Transport Service, Affordable Moving UK, Book Van Service, Reliable Delivery UK',
          })}
        />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3182CE" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="contact" content="info@speedy-van.co.uk" />
        {/* Open Graph Tags */}
        <meta
          property="og:title"
          content={t('home:ogTitle', { defaultValue: 'Speedy Van | Fast Van Delivery Across the UK' })}
        />
        <meta
          property="og:description"
          content={t('home:ogDescription', {
            defaultValue: 'Affordable and reliable van transport services. Book your delivery today!',
          })}
        />
        <meta property="og:image" content="https://speedy-van.co.uk/og-image.jpg" />
        <meta property="og:url" content="https://speedy-van.co.uk" />
        <meta property="og:type" content="website" />
        {/* Schema Markup */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />
      </Head>

      <Box bg={bgColor} color={textColor} minH="100vh">
        <Header />

        {session && (
          <Flex justify="center" mt={4}>
            <Button
              colorScheme="primary"
              onClick={() => router.push('/customer-portal')}
              aria-label="Go to customer portal"
            >
              🚪 {t('home:customerPortal', { defaultValue: 'Go to Customer Portal' })}
            </Button>
          </Flex>
        )}

        <Box as="main" aria-label="Main content">
          <Hero />
          <HeroDescription />
          <Features />
          <Coverage />
          <Testimonials />
          <Pricing />
          <FAQ />
          <CTA />
          <Flex justify="center" mt={8} mb={12}>
            <Button
              as={NextLink}
              href="/become-driver"
              colorScheme="primary"
              size="lg"
              aria-label="Become a driver"
            >
              {t('home:becomeDriver', { defaultValue: 'Become a Driver' })}
            </Button>
          </Flex>
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
              color="primary.500"
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
        'admin',
      ])),
      locale: locale || 'en',
    },
    revalidate: 3600,
  };
};

export default Home;