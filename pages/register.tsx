import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, Heading, Link, useToast } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import logger from '@/services/logger';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const Register = () => {
  const { t } = useTranslation(['common', 'auth']);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading } = useAuthStore();
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, username, password);
      toast({
        title: t('auth:registerSuccessTitle', { defaultValue: 'Registration Successful' }),
        description: t('auth:registerSuccessDescription', { defaultValue: 'Welcome to Speedy Van!' }),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      logger.info(`User registered: ${email}`);
      router.push('/login');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: t('auth:registerErrorTitle', { defaultValue: 'Registration Failed' }),
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      logger.error(`Registration error: ${errorMessage}`);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      toast({
        title: t('auth:googleErrorTitle', { defaultValue: 'Google Sign-In Failed' }),
        description: t('auth:googleErrorDescription', { defaultValue: 'Please try again later.' }),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <MotionBox
      minH="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bg="gray.50"
      p={4}
      dir={router.locale === 'ar' ? 'rtl' : 'ltr'}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <VStack spacing={6} w={{ base: 'full', md: 'md' }} bg="white" p={8} borderRadius="md" boxShadow="md">
        <Heading size="lg">{t('auth:registerTitle', { defaultValue: 'Register' })}</Heading>
        <Text color="gray.500">{t('auth:joinUsers', { defaultValue: 'Join over 10,000 users trusting Speedy Van!' })}</Text>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>{t('common:email', { defaultValue: 'Email' })}</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('common:emailPlaceholder', { defaultValue: 'Enter your email' })}
              />
            </FormControl>
            <FormControl id="username" isRequired>
              <FormLabel>{t('common:username', { defaultValue: 'Username' })}</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('common:usernamePlaceholder', { defaultValue: 'Enter your username' })}
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>{t('common:password', { defaultValue: 'Password' })}</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('common:passwordPlaceholder', { defaultValue: 'Enter your password' })}
              />
            </FormControl>
            <MotionButton
              type="submit"
              colorScheme="blue"
              size="lg"
              w="full"
              isLoading={isLoading}
              loadingText={t('common:loading', { defaultValue: 'Loading...' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('common:register', { defaultValue: 'Register' })}
            </MotionButton>
            <MotionButton
              onClick={handleGoogleSignIn}
              colorScheme="gray"
              size="lg"
              w="full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('auth:googleSignIn', { defaultValue: 'Sign up with Google' })}
            </MotionButton>
          </VStack>
        </form>
        <Text>
          {t('auth:haveAccount', { defaultValue: 'Already have an account?' })}{' '}
          <NextLink href="/login" passHref>
            <Link color="blue.500">{t('common:login', { defaultValue: 'Login' })}</Link>
          </NextLink>
        </Text>
        <Text fontSize="sm" textAlign="center">
          {t('auth:terms', { defaultValue: 'By registering, you agree to our' })}{' '}
          <NextLink href="/terms" passHref>
            <Link color="blue.500">{t('common:terms', { defaultValue: 'Terms of Service' })}</Link>
          </NextLink>{' '}
          {t('common:and', { defaultValue: 'and' })}{' '}
          <NextLink href="/privacy" passHref>
            <Link color="blue.500">{t('common:privacy', { defaultValue: 'Privacy Policy' })}</Link>
          </NextLink>
        </Text>
      </VStack>
    </MotionBox>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'auth'])),
    },
  };
};

export default Register;
