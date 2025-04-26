import React, { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Heading,
  useToast,
  Flex,
  Divider,
  Spinner
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { useAuthStore } from '@/stores/authStore';
import logger from '@/services/logger';

const Login = () => {
  const { t } = useTranslation(['common', 'auth']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loginWithGoogle, user, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      router.push(router.query.redirect?.toString() || '/');
    }
  }, [user, router]);

  useEffect(() => {
    if (error) {
      toast({
        title: t('auth:loginError'),
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      clearError();
    }
  }, [error, toast, t, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password, rememberMe);
      logger.info(`User logged in: ${email}`);
      toast({
        title: t('auth:loginSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push(router.query.redirect?.toString() || '/');
    } catch (error) {
      logger.error(`Login error: ${error}`);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast({
        title: t('auth:loginSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push(router.query.redirect?.toString() || '/');
    } catch (error) {
      logger.error(`Google login error: ${error}`);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bg="gray.50"
      p={4}
      dir={router.locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <VStack spacing={6} w={{ base: 'full', md: 'md' }} bg="white" p={8} borderRadius="md" boxShadow="md">
        <Heading size="lg">{t('auth:loginTitle')}</Heading>
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>{t('common:email')}</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('common:emailPlaceholder')}
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel>{t('common:password')}</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('common:passwordPlaceholder')}
              />
            </FormControl>

            <Flex w="full" justify="space-between" align="center">
              <FormControl display="flex" alignItems="center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <FormLabel mb="0" fontSize="sm">{t('auth:rememberMe')}</FormLabel>
              </FormControl>

              <Link href="/reset-password">
                <Text color="blue.500" fontSize="sm" _hover={{ textDecoration: 'underline' }}>
                  {t('auth:forgotPassword')}
                </Text>
              </Link>
            </Flex>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              w="full"
              isLoading={isLoading}
              loadingText={t('common:loggingIn')}
            >
              {t('common:login')}
            </Button>
          </VStack>
        </form>

        <Divider />

        <Button
          leftIcon={<FcGoogle />}
          variant="outline"
          w="full"
          onClick={handleGoogleLogin}
          isLoading={isLoading}
          loadingText={t('auth:loggingInWithGoogle')}
        >
          {t('auth:loginWithGoogle')}
        </Button>

        <Text textAlign="center">
          {t('auth:noAccount')}{' '}
          <Link href="/register">
            <Text as="span" color="blue.500" fontWeight="semibold" _hover={{ textDecoration: 'underline' }}>
              {t('common:register')}
            </Text>
          </Link>
        </Text>
      </VStack>
    </Box>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'auth'])),
    },
  };
};

export default Login;