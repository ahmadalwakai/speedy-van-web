import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  useColorModeValue,
  Container,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import NextLink from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { FiTruck, FiClock } from 'react-icons/fi';

const MotionButton = motion(Button);
const MotionBox = motion(Box);

const CTA: React.FC = () => {
  const { t } = useTranslation(['common', 'home']);
  const shouldReduceMotion = useReducedMotion();

  // Define variants for animation with delay
  const variants: Variants = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay: 0.2 },
        },
      };

  const textColor = useColorModeValue('white', 'gray.100');
  const hoverEffect = { scale: 1.08, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' };

  return (
    <MotionBox
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants}
      bgGradient="linear(to-r, primary.500, #00C9A7)"
      color={textColor}
      py={{ base: 14, md: 24 }}
      px={{ base: 6, md: 10 }}
      position="relative"
      overflow="hidden"
      borderRadius="lg"
      boxShadow="lg"
    >
      {/* Background pattern */}
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        bgImage="url('/modern-pattern.svg')"
        bgSize="cover"
        opacity={0.1}
        zIndex={0}
      />
      <Container maxW="6xl" textAlign="center" position="relative" zIndex={1}>
        <Heading
          as="h2"
          size={{ base: 'xl', md: '2xl' }}
          mb={4}
          lineHeight="1.3"
          textShadow="0 2px 4px rgba(0, 0, 0, 0.3)"
        >
          {t('home:cta.title', {
            defaultValue: 'Move Smarter & Faster Across the UK with Speedy Van!',
          })}
        </Heading>
        <Text fontSize={{ base: 'md', md: 'lg' }} mb={3} fontWeight="medium">
          <Icon as={FiTruck} mr={2} />
          {t('home:cta.subtitle', {
            defaultValue: 'Covering all major cities with professional drivers.',
          })}
        </Text>
        <Text
          mb={8}
          fontSize={{ base: 'sm', md: 'md' }}
          maxW="2xl"
          mx="auto"
          opacity={0.95}
        >
          {t('home:cta.description', {
            defaultValue: 'Book now and enjoy seamless delivery at competitive rates!',
          })}
        </Text>

        <HStack spacing={5} justify="center" flexWrap="wrap">
          <NextLink href="/book-order" passHref>
            <MotionButton
              as="a"
              whileHover={hoverEffect}
              whileTap={{ scale: 0.95 }}
              size="lg"
              bg="white"
              color="primary.500"
              _hover={{ bg: 'gray.100', ...hoverEffect }}
              px={10}
              leftIcon={<FiTruck />}
              mb={{ base: 3, md: 0 }}
            >
              {t('common:bookNow', { defaultValue: 'Book Your Delivery' })}
            </MotionButton>
          </NextLink>

          <NextLink href="/get-quote" passHref>
            <MotionButton
              as="a"
              whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
              whileTap={{ scale: 0.95 }}
              variant="outline"
              borderColor="whiteAlpha.700"
              color="white"
              size="lg"
              _hover={{ bg: 'whiteAlpha.200', borderColor: 'white' }}
              px={10}
              leftIcon={<FiClock />}
            >
              {t('home:cta.getQuote', { defaultValue: 'Get a Free Quote' })}
            </MotionButton>
          </NextLink>
        </HStack>

        <Text mt={6} fontSize="sm" opacity={0.85}>
          <Icon as={FiClock} mr={2} />
          {t('home:cta.limitedSlots', {
            defaultValue: 'Limited slots available today – Book now!',
          })}
        </Text>
      </Container>
    </MotionBox>
  );
};

export default CTA;