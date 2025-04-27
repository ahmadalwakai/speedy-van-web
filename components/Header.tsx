import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  HStack,
  Heading,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  VStack,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { HamburgerIcon } from '@chakra-ui/icons';
import { GlobeIcon, LogInIcon, UserPlusIcon, BookNowIcon, PhoneIcon } from './Icons';

const Header: React.FC = () => {
  const { t } = useTranslation(['common']);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageSwitch = () => {
    setIsLoading(true);
    router.push(router.pathname, router.asPath, { locale: router.locale === 'ar' ? 'en' : 'ar' });
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (!isMounted) {
    return (
      <Box
        as="header"
        bg="rgba(0, 0, 0, 0.2)"
        backdropFilter="blur(6px)"
        position="fixed"
        top={0}
        width="100%"
        zIndex={20}
        py={2}
        px={{ base: 4, md: 8 }}
      />
    );
  }

  return (
    <Box
      as="header"
      bg={scrolled ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.2)'}
      backdropFilter="blur(6px)"
      position="fixed"
      top={0}
      width="100%"
      zIndex={20}
      py={2}
      px={{ base: 4, md: 8 }}
      transition="background 0.3s ease"
      aria-label={t('common:mainNavigation', { defaultValue: 'Main navigation' })}
    >
      <Flex as="nav" maxW="7xl" mx="auto" align="center" justify="space-between" aria-label="Primary Navigation">
        <HStack spacing={4}>
          <NextLink href="/" passHref>
            <Image
              src="/logo.png"
              alt={t('common:logoAlt', {
                defaultValue: 'Speedy Van | Fast Van Delivery Services in the UK',
              })}
              width={router.pathname === '/' ? 55 : 45}
              height={router.pathname === '/' ? 55 : 45}
              priority
              onError={(e) => {
                e.currentTarget.src = '/fallback-logo.png';
              }}
              style={{ cursor: 'pointer' }}
            />
          </NextLink>
          <Heading size={{ base: 'sm', md: 'md' }} color="white">
            Speedy Van
          </Heading>
        </HStack>
        <HStack spacing={{ base: 2, md: 4 }} display={{ base: 'none', md: 'flex' }}>
          <Button
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
            leftIcon={<GlobeIcon />}
            onClick={handleLanguageSwitch}
            isLoading={isLoading}
            aria-label={t('common:switchLanguage', { defaultValue: 'Switch to Arabic or English' })}
          >
            {router.locale === 'ar' ? 'EN' : 'AR'}
          </Button>
          <Button
            as={NextLink}
            href="/book-order"
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
            leftIcon={<BookNowIcon />}
            role="link"
            aria-label={t('common:bookNowAria', { defaultValue: 'Book a van delivery with Speedy Van' })}
          >
            {t('common:bookNow', { defaultValue: 'Book Now' })}
          </Button>
          <Button
            as={NextLink}
            href="/login"
            variant="outline"
            borderColor="whiteAlpha.700"
            color="white"
            _hover={{ bg: 'whiteAlpha.200', borderColor: 'white' }}
            leftIcon={<LogInIcon />}
            role="link"
            aria-label={t('common:loginAria', { defaultValue: 'Log in to your Speedy Van account' })}
          >
            {t('common:login', { defaultValue: 'Login' })}
          </Button>
          <Button
            as={NextLink}
            href="/register"
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
            leftIcon={<UserPlusIcon />}
            role="link"
            aria-label={t('common:registerAria', { defaultValue: 'Register for a Speedy Van account' })}
          >
            {t('common:register', { defaultValue: 'Register' })}
          </Button>
          <Button
            as={NextLink}
            href="/become-driver"
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
            role="link"
            aria-label={t('common:becomeDriverAria', { defaultValue: 'Apply to become a van driver with Speedy Van' })}
          >
            {t('common:becomeDriver', { defaultValue: 'Become a Driver' })}
          </Button>
          <Button
            as="a"
            href="tel:+447901846297"
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
            leftIcon={<PhoneIcon />}
            role="link"
            aria-label={t('common:contactUsAria', { defaultValue: 'Call Speedy Van customer support' })}
          >
            {t('common:contactUs', { defaultValue: 'Contact Us' })}
          </Button>
        </HStack>
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          icon={<HamburgerIcon />}
          onClick={onOpen}
          aria-label={t('common:openMenu', { defaultValue: 'Open navigation menu' })}
          variant="ghost"
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
        />
      </Flex>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="gray.800" color="white">
          <DrawerCloseButton aria-label={t('common:closeMenu', { defaultValue: 'Close navigation menu' })} />
          <DrawerBody>
            <VStack spacing={4} mt={10}>
              <Button
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                leftIcon={<GlobeIcon />}
                onClick={() => {
                  handleLanguageSwitch();
                  onClose();
                }}
                isLoading={isLoading}
                w="full"
                justifyContent="flex-start"
                aria-label={t('common:switchLanguage', { defaultValue: 'Switch to Arabic or English' })}
              >
                {router.locale === 'ar' ? 'EN' : 'AR'}
              </Button>
              <Button
                as={NextLink}
                href="/book-order"
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                leftIcon={<BookNowIcon />}
                role="link"
                aria-label={t('common:bookNowAria', { defaultValue: 'Book a van delivery with Speedy Van' })}
                w="full"
                justifyContent="flex-start"
                onClick={onClose}
              >
                {t('common:bookNow', { defaultValue: 'Book Now' })}
              </Button>
              <Button
                as={NextLink}
                href="/login"
                variant="outline"
                borderColor="whiteAlpha.700"
                color="white"
                _hover={{ bg: 'whiteAlpha.200', borderColor: 'white' }}
                leftIcon={<LogInIcon />}
                role="link"
                aria-label={t('common:loginAria', { defaultValue: 'Log in to your Speedy Van account' })}
                w="full"
                justifyContent="flex-start"
                onClick={onClose}
              >
                {t('common:login', { defaultValue: 'Login' })}
              </Button>
              <Button
                as={NextLink}
                href="/register"
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                leftIcon={<UserPlusIcon />}
                role="link"
                aria-label={t('common:registerAria', { defaultValue: 'Register for a Speedy Van account' })}
                w="full"
                justifyContent="flex-start"
                onClick={onClose}
              >
                {t('common:register', { defaultValue: 'Register' })}
              </Button>
              <Button
                as={NextLink}
                href="/become-driver"
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                role="link"
                aria-label={t('common:becomeDriverAria', { defaultValue: 'Apply to become a van driver with Speedy Van' })}
                w="full"
                justifyContent="flex-start"
                onClick={onClose}
              >
                {t('common:becomeDriver', { defaultValue: 'Become a Driver' })}
              </Button>
              <Button
                as="a"
                href="tel:+447901846297"
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                leftIcon={<PhoneIcon />}
                role="link"
                aria-label={t('common:contactUsAria', { defaultValue: 'Call Speedy Van customer support' })}
                w="full"
                justifyContent="flex-start"
                onClick={onClose}
              >
                {t('common:contactUs', { defaultValue: 'Contact Us' })}
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Header;