import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, Heading } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import logger from '@/services/logger';

const Register = () => {
  const { t } = useTranslation(['common', 'auth']);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { register, user } = useAuthStore();
  const router = useRouter();

  React.useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, username, password);
      logger.info(`User registered: ${email}`);
      router.push('/login');
    } catch (error) {
      logger.error(`Registration error: ${(error as Error).message}`);
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
        <Heading size="lg">{t('auth:registerTitle', { defaultValue: 'Register' })}</Heading>
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
            <Button type="submit" colorScheme="blue" size="lg" w="full">
              {t('common:register', { defaultValue: 'Register' })}
            </Button>
          </VStack>
        </form>
        <Text>
          {t('auth:haveAccount', { defaultValue: 'Already have an account?' })}{' '}
          <Link href="/login" legacyBehavior>
            {t('common:login', { defaultValue: 'Login' })}
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

export default Register;
