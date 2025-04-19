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
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import logger from '@/services/logger';

/**
 * صفحة تسجيل الدخول
 */
const Login = () => {
  const { t } = useTranslation(['common', 'auth']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuthStore();
  const router = useRouter();
  const toast = useToast();

  // التوجيه للصفحة الرئيسية إذا كان المستخدم مسجل الدخول
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      logger.info(`User logged in: ${email}`);
      router.push('/');
    } catch (error) {
      logger.error(`Login error: ${(error as Error).message}`);
      toast({
        title: t('auth:loginErrorTitle', { defaultValue: 'Login Failed' }),
        description: t('auth:loginErrorDescription', {
          defaultValue: 'Please check your credentials and try again.',
        }),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
        <Heading size="lg">{t('auth:loginTitle', { defaultValue: 'Login' })}</Heading>
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
            <FormControl id="password" isRequired>
              <FormLabel>{t('common:password', { defaultValue: 'Password' })}</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('common:passwordPlaceholder', { defaultValue: 'Enter your password' })}
              />
            </FormControl>
            <Button type="submit" colorScheme="blue" size="lg" w="full">
              {t('common:login', { defaultValue: 'Login' })}
            </Button>
          </VStack>
        </form>
        <Text>
          {t('auth:noAccount', { defaultValue: "Don't have an account?" })}{' '}
          <Link href="/register" legacyBehavior>
            <Text as="span" color="blue.500" fontWeight="semibold">
              {t('common:register', { defaultValue: 'Register' })}
            </Text>
          </Link>
        </Text>
      </VStack>
    </Box>
  );
};

// تحميل الترجمة حسب اللغة
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'auth'])),
    },
  };
};

export default Login;
