import React from 'react';
import {
  Box,
  Flex,
  Button,
  HStack,
  useColorModeValue,
  Icon,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { FiHome, FiBook, FiMessageSquare, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const NavBar: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const bg = useColorModeValue('white', 'gray.800');
  const shadow = useColorModeValue('0 4px 12px rgba(0,0,0,0.1)', '0 4px 12px rgba(0,0,0,0.3)');

  const navItems = [
    { href: '/', label: t('home', { defaultValue: 'Home' }), icon: FiHome },
    { href: '/book-order', label: t('bookOrderForm', { defaultValue: 'Book Order' }), icon: FiBook },
    { href: '/chat-order', label: t('bookOrderChat', { defaultValue: 'Chat Order' }), icon: FiMessageSquare },
    { href: '/admin', label: t('adminDashboard', { defaultValue: 'Admin Dashboard' }), icon: FiShield },
  ];

  return (
    <MotionBox
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      bg={bg}
      boxShadow={shadow}
      position="sticky"
      top={0}
      zIndex={1000}
      width="full"
    >
      <Flex
        maxW="7xl"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={4}
        align="center"
        justify="space-between"
        direction={router.locale === 'ar' ? 'row-reverse' : 'row'}
      >
        <HStack spacing={{ base: 4, md: 8 }} direction={router.locale === 'ar' ? 'row-reverse' : 'row'}>
          {navItems.map((item) => (
            <NextLink key={item.href} href={item.href} passHref legacyBehavior>
              <ChakraLink
                as="a"
                display="flex"
                alignItems="center"
                fontWeight="medium"
                color={router.pathname === item.href ? 'blue.600' : 'gray.600'}
                _hover={{ color: 'blue.600', textDecoration: 'none' }}
                fontSize={{ base: 'md', md: 'lg' }}
              >
                <Icon as={item.icon} mr={2} boxSize={5} />
                {item.label}
              </ChakraLink>
            </NextLink>
          ))}
        </HStack>
        <Button
          as="button"
          colorScheme="blue"
          size="md"
          borderRadius="lg"
          onClick={() => router.push(router.locale === 'en' ? '/ar' : '/en')}
        >
          {router.locale === 'en' ? 'العربية' : 'English'}
        </Button>
      </Flex>
    </MotionBox>
  );
};

export default NavBar;