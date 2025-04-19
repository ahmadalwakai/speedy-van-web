import React from 'react';
import Head from 'next/head';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';

// Dynamic imports for better performance
const Header = dynamic(() => import('@/components/Header'), { 
  loading: () => <Box h="80px" bg={useColorModeValue('white', 'gray.800')} />
});
const Hero = dynamic(() => import('@/components/sections/Hero'));
const WhyUs = dynamic(() => import('@/components/sections/WhyUs'));
const Testimonials = dynamic(() => import('@/components/sections/Testimonials'));
const FAQ = dynamic(() => import('@/components/sections/FAQ'));
const CTA = dynamic(() => import('@/components/sections/CTA'));
const Footer = dynamic(() => import('@/components/Footer'));

const Home: React.FC = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <>
      <Head>
        <title>Speedy Van - Fast & Reliable Delivery</title>
        <meta name="description" content="Book fast, reliable and affordable deliveries with Speedy Van. Serving all UK." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Speedy Van Delivery Services" />
        <meta property="og:description" content="Professional delivery services across the UK" />
        <meta property="og:image" content="/images/og-image.jpg" />
        <meta property="og:url" content="https://speedyvan.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box 
        bg={bgColor}
        color={textColor}
        minH="100vh"
        css={{
          scrollSnapType: 'y proximity',
          scrollBehavior: 'smooth',
          overflowY: 'auto',
          '& > section': {
            scrollSnapAlign: 'start'
          }
        }}
      >
        <Header />
        <Hero />
        <WhyUs />
        <Testimonials />
        <FAQ />
        <CTA />
        <Footer />
      </Box>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'home'])),
    },
    revalidate: 3600 // ISR: Regenerate page every hour
  };
};

export default Home;