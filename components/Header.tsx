import React, { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  Image,
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

  const handleLanguageSwitch = () => {
    setIsLoading(true);
    router.push(router.pathname, router.asPath, { locale: router.locale === 'ar' ? 'en' : 'ar' });
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <Box
      as="header"
      bg="header.bg"
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={10}
      py={4}
      px={{ base: 4, md: 8 }}
      aria-label={t('common:mainNavigation', { defaultValue: 'Main navigation' })}
    >
      <Flex maxW="7xl" mx="auto" align="center" justify="space-between">
        <HStack spacing={4}>
          <Image
            src="/logo.png"
            alt={t('common:logoAlt', { defaultValue: 'Speedy Van Logo' })}
            width={50}
            height={50}
            loading="lazy"
            onError={() => console.error('Failed to load logo.png')}
          />
          <Heading size={{ base: 'md', md: 'lg' }} color="header.text">
            Speedy Van
          </Heading>
        </HStack>
        <HStack spacing={{ base: 2, md: 4 }} display={{ base: 'none', md: 'flex' }}>
          <Button
            variant="ghost"
            leftIcon={<GlobeIcon />}
            onClick={handleLanguageSwitch}
            isLoading={isLoading}
            aria-label={t('common:switchLanguage', { defaultValue: 'Switch Language' })}
          >
            {router.locale === 'ar' ? 'EN' : 'AR'}
          </Button>
          <NextLink href="/book-order" passHref legacyBehavior>
            <Button as="a" colorScheme="primary" size="lg" leftIcon={<BookNowIcon />}>
              {t('common:bookNow', { defaultValue: 'Book Now' })}
            </Button>
          </NextLink>
          <NextLink href="/login" passHref legacyBehavior>
            <Button as="a" variant="outline" colorScheme="primary" size="lg" leftIcon={<LogInIcon />}>
              {t('common:login', { defaultValue: 'Login' })}
            </Button>
          </NextLink>
          <NextLink href="/register" passHref legacyBehavior>
            <Button as="a" colorScheme="primary" size="lg" leftIcon={<UserPlusIcon />}>
              {t('common:register', { defaultValue: 'Register' })}
            </Button>
          </NextLink>
          <Button
            as="a"
            href="tel:+447901846297"
            colorScheme="secondary"
            size="lg"
            leftIcon={<PhoneIcon />}
            aria-label={t('common:contactUs', { defaultValue: 'Contact Us' })}
          >
            {t('common:contactUs', { defaultValue: 'Contact Us' })}
          </Button>
        </HStack>
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          icon={<HamburgerIcon />}
          onClick={onOpen}
          aria-label={t('common:openMenu', { defaultValue: 'Open menu' })}
          variant="outline"
          colorScheme="primary"
        />
      </Flex>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton aria-label={t('common:closeMenu', { defaultValue: 'Close menu' })} />
          <DrawerBody>
            <VStack spacing={4} mt={10}>
              <Button
                variant="ghost"
                leftIcon={<GlobeIcon />}
                onClick={() => {
                  handleLanguageSwitch();
                  onClose();
                }}
                isLoading={isLoading}
                w="full"
                justifyContent="flex-start"
                aria-label={t('common:switchLanguage')}
              >
                {router.locale === 'ar' ? 'EN' : 'AR'}
              </Button>
              <NextLink href="/book-order" passHref legacyBehavior>
                <Button
                  as="a"
                  colorScheme="primary"
                  w="full"
                  justifyContent="flex-start"
                  leftIcon={<BookNowIcon />}
                  onClick={onClose}
                >
                  {t('common:bookNow')}
                </Button>
              </NextLink>
              <NextLink href="/login" passHref legacyBehavior>
                <Button
                  as="a"
                  variant="outline"
                  colorScheme="primary"
                  w="full"
                  justifyContent="flex-start"
                  leftIcon={<LogInIcon />}
                  onClick={onClose}
                >
                  {t('common:login')}
                </Button>
              </NextLink>
              <NextLink href="/register" passHref legacyBehavior>
                <Button
                  as="a"
                  colorScheme="primary"
                  w="full"
                  justifyContent="flex-start"
                  leftIcon={<UserPlusIcon />}
                  onClick={onClose}
                >
                  {t('common:register')}
                </Button>
              </NextLink>
              <Button
                as="a"
                href="tel:+447901846297"
                colorScheme="secondary"
                w="full"
                justifyContent="flex-start"
                leftIcon={<PhoneIcon />}
                onClick={onClose}
                aria-label={t('common:contactUs')}
              >
                {t('common:contactUs')}
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Header;