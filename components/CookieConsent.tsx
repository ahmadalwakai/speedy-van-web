import React, { useState, useEffect } from 'react';
import { Box, Button, Text, Flex, Link, useColorModeValue } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const CookieConsent: React.FC = () => {
  const { t } = useTranslation('common');
  const [visible, setVisible] = useState(false);
  const bgColor = useColorModeValue('gray.800', 'gray.900');

  useEffect(() => {
    const consent = Cookies.get('cookieConsent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    Cookies.set('cookieConsent', 'accepted', { expires: 365 });
    setVisible(false);
  };

  const declineCookies = () => {
    Cookies.set('cookieConsent', 'declined', { expires: 365 });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <MotionBox
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      bg={bgColor}
      color="white"
      p={4}
      zIndex="banner"
      boxShadow="lg"
      borderTopRadius="md"
      role="dialog"
      aria-label="Cookie Consent"
    >
      <Flex
        maxW="6xl"
        mx="auto"
        alignItems="center"
        justifyContent="space-between"
        flexDirection={{ base: 'column', md: 'row' }}
        gap={2}
      >
        <Text mb={{ base: 2, md: 0 }} textAlign="center">
          {t('cookieConsent.message')}{' '}
          <Link href="/privacy" color="blue.300" textDecoration="underline">
            {t('cookieConsent.learnMore')}
          </Link>
        </Text>
        <Flex gap={2}>
          <Button colorScheme="blue" size="sm" onClick={acceptCookies}>
            {t('cookieConsent.accept')}
          </Button>
          <Button variant="outline" size="sm" onClick={declineCookies}>
            {t('cookieConsent.decline')}
          </Button>
        </Flex>
      </Flex>
    </MotionBox>
  );
};

export default CookieConsent;