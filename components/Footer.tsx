import React from 'react';
import { Box, Heading, Text, SimpleGrid, VStack, Button, useColorModeValue, Link } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import NextLink from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { BookNowIcon, PhoneIcon } from './Icons';

const MotionFooter = motion(Box);

const Footer: React.FC = () => {
  const { t } = useTranslation(['home', 'common']);
  const shouldReduceMotion = useReducedMotion();

  const variants: Variants = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  const bgColor = useColorModeValue('gray.900', 'gray.800');
  const textColor = useColorModeValue('white', 'gray.100');

  return (
    <MotionFooter
      as="footer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants}
      bg={bgColor}
      color={textColor}
      py={12}
      px={{ base: 4, md: 8 }}
      aria-label="Website footer"
    >
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} maxW="7xl" mx="auto">
        <VStack align={{ base: 'center', md: 'start' }} spacing={4}>
          <Heading size="md">Speedy Van</Heading>
          <Text>
            {t('home:footerAbout', { defaultValue: 'Fast and reliable delivery across the UK.' })}
          </Text>
        </VStack>

        <VStack align={{ base: 'center', md: 'start' }} spacing={4}>
          <Heading size="md">
            {t('home:footerLinks', { defaultValue: 'Quick Links' })}
          </Heading>
          <Button as={NextLink} href="/about" variant="link" _hover={{ textDecoration: 'underline' }}>
            {t('common:about', { defaultValue: 'About Us' })}
          </Button>
          <Button as={NextLink} href="/contact" variant="link" _hover={{ textDecoration: 'underline' }}>
            {t('common:contact', { defaultValue: 'Contact Us' })}
          </Button>
          <Button as={NextLink} href="/driver-terms" variant="link" _hover={{ textDecoration: 'underline' }}>
            {t('common:terms', { defaultValue: 'Driver Terms & Conditions' })}
          </Button>
        </VStack>

        <VStack align={{ base: 'center', md: 'start' }} spacing={4}>
          <Heading size="md">
            {t('home:footerContact', { defaultValue: 'Contact' })}
          </Heading>
          <Text>
            {t('common:emailLabel', { defaultValue: 'Email' })}:{' '}
            <Link href="mailto:info@speedy-van.co.uk" color="primary.300" _hover={{ textDecoration: 'underline' }}>
              info@speedy-van.co.uk
            </Link>
          </Text>
          <Text>
            {t('common:phoneLabel', { defaultValue: 'Phone' })}:{' '}
            <Link href="tel:+447901846297" color="primary.300" _hover={{ textDecoration: 'underline' }}>
              +44 7901 846297
            </Link>
          </Text>
          <Button as={NextLink} href="/book-order" colorScheme="blue" leftIcon={<BookNowIcon />}>
            {t('common:bookNow', { defaultValue: 'Book Now' })}
          </Button>
          <Button as="a" href="tel:+447901846297" colorScheme="teal" leftIcon={<PhoneIcon />}>
            {t('common:contactUs', { defaultValue: 'Contact Us' })}
          </Button>
        </VStack>
      </SimpleGrid>

      <Box textAlign="center" mt={10} fontSize="sm" color="gray.400">
        © {new Date().getFullYear()} Speedy Van. {t('common:allRightsReserved', { defaultValue: 'All rights reserved.' })}
      </Box>
    </MotionFooter>
  );
};

export default Footer;