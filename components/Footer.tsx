import React from 'react';
import { Box, Heading, Text, SimpleGrid, VStack, Button } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import NextLink from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { BookNowIcon, PhoneIcon } from './Icons';

const Footer: React.FC = () => {
  const { t } = useTranslation(['home', 'common']);
  const shouldReduceMotion = useReducedMotion();

  const variants = shouldReduceMotion
    ? {}
    : {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
      };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants}
      style={{ scrollSnapAlign: 'start' }}
    >
      <Box
        as="footer"
        bg="footer.bg"
        color="footer.text"
        py={12}
        px={{ base: 4, md: 8 }}
      >
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} maxW="7xl" mx="auto">
          <VStack align={{ base: 'center', md: 'start' }} spacing={4}>
            <Heading size="md">Speedy Van</Heading>
            <Text>{t('home:footerAbout', { defaultValue: 'Fast and reliable delivery across the UK.' })}</Text>
          </VStack>
          <VStack align={{ base: 'center', md: 'start' }} spacing={4}>
            <Heading size="md">{t('home:footerLinks', { defaultValue: 'Quick Links' })}</Heading>
            <NextLink href="/about" passHref legacyBehavior>
              <Box as="a">{t('common:about', { defaultValue: 'About Us' })}</Box>
            </NextLink>
            <NextLink href="/contact" passHref legacyBehavior>
              <Box as="a">{t('common:contact', { defaultValue: 'Contact Us' })}</Box>
            </NextLink>
            <NextLink href="/terms" passHref legacyBehavior>
              <Box as="a">{t('common:terms', { defaultValue: 'Terms' })}</Box>
            </NextLink>
          </VStack>
          <VStack align={{ base: 'center', md: 'start' }} spacing={4}>
            <Heading size="md">{t('home:footerContact', { defaultValue: 'Contact' })}</Heading>
            <Text>Email: support@speedyvan.com</Text>
            <Text>Phone: +44 7901 846297</Text>
            <NextLink href="/book-order" passHref legacyBehavior>
              <Button
                as="a"
                colorScheme="primary"
                leftIcon={<BookNowIcon />}
                aria-label={t('common:bookNow', { defaultValue: 'Book Now' })}
              >
                {t('common:bookNow')}
              </Button>
            </NextLink>
            <Button
              as="a"
              href="tel:+447901846297"
              colorScheme="secondary"
              leftIcon={<PhoneIcon />}
              aria-label={t('common:contactUs')}
            >
              {t('common:contactUs')}
            </Button>
          </VStack>
        </SimpleGrid>
      </Box>
    </motion.div>
  );
};

export default Footer;