import React from 'react';
import { Box, Heading, Text, Button, useColorModeValue, Container, HStack } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import NextLink from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { FiTruck, FiClock } from 'react-icons/fi';

// Create a MotionButton for animations
const MotionButton = motion(Button);

const CTA: React.FC = () => {
  const { t } = useTranslation('home');
  const shouldReduceMotion = useReducedMotion();

  const variants: Variants = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  const textColor = useColorModeValue('white', 'gray.100');
  const hoverEffect = { scale: 1.05 };

  return (
    <Box
      as={motion.div}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants}
      bgGradient="linear(to-r, blue.600, teal.500)"
      color={textColor}
      py={{ base: 12, md: 20 }}
      px={{ base: 4, md: 8 }}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        bgImage="url('/pattern.svg')"
        opacity={0.05}
        zIndex={0}
      />
      <Container maxW="6xl" textAlign="center" position="relative" zIndex={1}>
        <Heading size="lg" mb={3}>
          {t('cta.title', { defaultValue: 'Move Smarter & Faster Across the UK with Speedy Van!' })}
        </Heading>
        <Text fontSize="md" mb={2}>
          Speedy Van covers all major cities with professional service 🚀
        </Text>
        <Text mb={6} fontSize="lg" maxW="2xl" mx="auto">
          {t('cta.description', { defaultValue: 'Book now and experience hassle-free moving at competitive prices!' })}
        </Text>

        <HStack spacing={4} justify="center" flexWrap="wrap">
          <NextLink href="/book-order" passHref>
            <MotionButton
              as="a"
              whileHover={hoverEffect}
              whileTap={{ scale: 0.95 }}
              leftIcon={<FiTruck />}
              size="lg"
              bg="white"
              color="blue.600"
              _hover={{ bg: 'gray.100' }}
              px={8}
              mb={{ base: 2, md: 0 }}
            >
              {t('common:bookNow', { defaultValue: 'Book Your Delivery' })}
            </MotionButton>
          </NextLink>

          <NextLink href="/get-quote" passHref>
            <MotionButton
              as="a"
              whileHover={hoverEffect}
              whileTap={{ scale: 0.95 }}
              variant="outline"
              color="white"
              size="lg"
              _hover={{ bg: 'whiteAlpha.200' }}
              px={8}
              leftIcon={<FiClock />}
            >
              Get a Free Quote
            </MotionButton>
          </NextLink>
        </HStack>

        <Text mt={4} fontSize="sm" opacity={0.9}>
          ⏰ Limited slots available today – Book now!
        </Text>
      </Container>
    </Box>
  );
};

export default CTA;
