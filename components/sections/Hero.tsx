import React from 'react';
import { Box, Heading, Text, Button, Icon } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import NextLink from 'next/link';
import { motion } from 'framer-motion';
import { FiTruck, FiChevronDown } from 'react-icons/fi';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const Hero: React.FC = () => {
  const { t } = useTranslation(['home', 'common']);

  // Animation variants for smooth entrance
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: 'easeOut' },
    },
  };

  // Scroll indicator animation
  const scrollIndicatorVariants = {
    animate: {
      y: [0, 10, 0],
      opacity: [0.5, 1, 0.5],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <Box
      as="section"
      position="relative"
      width="100%"
      height={{ base: '90vh', md: '100vh' }}
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
      aria-label="Speedy Van Hero Section with Delivery Promo"
    >
      {/* Background Video */}
      <video
        src="/videos/speedy-van-hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      >
        <source src="/videos/speedy-van-hero.mp4" type="video/mp4" />
        <Box
          bgGradient="linear(to-b, primary.500, primary.700)"
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          color="white"
          fontSize="lg"
        >
          {t('home:videoUnsupported', {
            defaultValue: 'Sorry, your browser does not support embedded videos.',
          })}
        </Box>
      </video>

      {/* Text Container with Soft Background */}
      <MotionBox
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        position="relative"
        zIndex={2}
        bg={{ base: 'rgba(0,0,0,0.5)', md: 'rgba(0,0,0,0.35)' }}
        p={{ base: 4, md: 6 }}
        borderRadius="md"
        backdropFilter="blur(2px)"
        textAlign="center"
        maxW={{ base: '90%', md: '80%' }}
        mx="auto"
      >
        <Heading
          as="h1"
          fontSize={{ base: '3xl', md: '5xl' }}
          color="white"
          mb={4}
          fontWeight="bold"
          textShadow="0 2px 4px rgba(0,0,0,0.5)"
          aria-label="Fast and Reliable Van Delivery Services Across the UK"
        >
          {t('home:heroTitle', {
            defaultValue: 'Fast & Reliable Van Delivery Across the UK',
          })}
        </Heading>

        <Text
          fontSize={{ base: 'md', md: 'xl' }}
          color="gray.100"
          mb={6}
          maxW="lg"
          mx="auto"
          aria-label="Book your van service with Speedy Van"
        >
          {t('home:heroSubtitle', {
            defaultValue: 'Book today with Speedy Van — affordable, secure, and fast transport solutions.',
          })}
        </Text>

        <NextLink href="/book-order" passHref>
          <MotionButton
            size="lg"
            colorScheme="teal"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            leftIcon={<Icon as={FiTruck} />}
            aria-label="Book Your Delivery Now"
          >
            {t('common:bookNow', { defaultValue: 'Book Your Delivery' })}
          </MotionButton>
        </NextLink>
      </MotionBox>

      {/* Scroll Indicator */}
      <MotionBox
        position="absolute"
        bottom={{ base: 6, md: 10 }}
        zIndex={2}
        variants={scrollIndicatorVariants}
        animate="animate"
        aria-label="Scroll down to explore more"
      >
        <Icon
          as={FiChevronDown}
          color="white"
          boxSize={{ base: 8, md: 10 }}
          _hover={{ cursor: 'pointer', opacity: 1 }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        />
      </MotionBox>
    </Box>
  );
};

export default Hero;