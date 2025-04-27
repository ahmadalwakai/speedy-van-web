import React from 'react';
import { Box, Heading, Text, Stack, Button, chakra } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import NextLink from 'next/link';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';

const MotionBox = motion(Box);

const HeroDescription: React.FC = () => {
  const { t } = useTranslation(['home', 'common']);

  // Schema.org structured data for SEO
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Van Delivery Service',
    provider: {
      '@type': 'Organization',
      name: 'Speedy Van',
      logo: 'https://speedyvan.com/logo.png',
      url: 'https://speedyvan.com',
    },
    brand: {
      '@type': 'Brand',
      name: 'Speedy Van',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+44-7901-846297',
      contactType: 'Customer Service',
    },
    name: t('home:heroDescriptionTitle', {
      defaultValue: 'Same Day & Affordable Van Delivery Services Across the UK | Trusted by 10,000+ Customers',
    }),
    description: t('home:heroDescriptionText1', {
      defaultValue:
        'Looking for hassle-free, <strong>same day delivery</strong>? Speedy Van offers fast, secure, and affordable transport services throughout the UK.',
    }),
    areaServed: {
      '@type': 'Country',
      name: 'United Kingdom',
    },
    offers: {
      '@type': 'Offer',
      url: 'https://speedyvan.com/book-order',
      priceCurrency: 'GBP',
      description: t('common:bookNow', { defaultValue: 'Book Your Delivery' }),
    },
  };

  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>
      <MotionBox
        maxW="6xl"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={{ base: 10, md: 20 }}
        textAlign="center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        aria-label="Speedy Van Delivery Service Description"
        aria-describedby="hero-description"
      >
        <Heading
          as="h2"
          size="xl"
          mb={6}
          bgGradient="linear(to-r, teal.400, blue.500)"
          bgClip="text"
          fontWeight="extrabold"
          id="hero-description"
        >
          {t('home:heroDescriptionTitle', {
            defaultValue: 'Same Day & Affordable Van Delivery Services Across the UK | Trusted by 10,000+ Customers',
          })}
        </Heading>
        <chakra.p
          fontSize="lg"
          mb={4}
          dangerouslySetInnerHTML={{
            __html: t('home:heroDescriptionText1', {
              defaultValue:
                'Looking for hassle-free, <strong>same day delivery</strong>? Speedy Van offers fast, secure, and affordable transport services throughout the UK.',
            }),
          }}
        />
        <chakra.p
          fontSize="lg"
          mb={4}
          dangerouslySetInnerHTML={{
            __html: t('home:heroDescriptionText2', {
              defaultValue:
                'Enjoy <strong>insured deliveries</strong>, lightning-fast service, transparent pricing, and 24/7 customer support. Join 10,000+ happy customers today!',
            }),
          }}
        />
        <chakra.p
          fontSize="lg"
          mb={6}
          dangerouslySetInnerHTML={{
            __html: t('home:heroDescriptionText3', {
              defaultValue:
                'We cover all major cities including London, Manchester, Birmingham, and more. Whether you’re moving furniture or sending packages — Speedy Van is your <strong>trusted UK van service</strong>.',
            }),
          }}
        />
        <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justify="center">
          <Button
            as={NextLink}
            href="/book-order"
            colorScheme="primary"
            size="lg"
            aria-label="Book your same day van delivery"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            {t('common:bookNow', { defaultValue: 'Book Now' })}
          </Button>
          <Button
            as="a"
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });
            }}
            variant="outline"
            colorScheme="primary"
            size="lg"
            aria-label="Get a free delivery quote"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            {t('common:getQuote', { defaultValue: 'Get Free Quote' })}
          </Button>
        </Stack>
      </MotionBox>
    </>
  );
};

export default HeroDescription;
