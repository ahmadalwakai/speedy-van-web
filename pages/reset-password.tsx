import React, { useState, useEffect } from 'react';
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
  Link
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuthStore } from '@/stores/authStore';
import NextLink from 'next/link';
import { GetStaticProps } from 'next';
import logger from '@/services/logger';

const ResetPassword = () => {
  const { t } = useTranslation(['common', 'auth']);
  const [email, setEmail] = useState('');
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      toast({
        title: t('auth:resetError'),
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
      await resetPassword(email);
      toast({
        title: t('auth:resetSuccessTitle'),
        description: t('auth:resetSuccessDesc'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      router.push('/login');
    } catch (err) {
      logger.error(`Reset password error: ${err}`);
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
    >
      <VStack spacing={6} w={{ base: 'full', md: 'md' }} bg="white" p={8} borderRadius="md" boxShadow="md">
        <Heading size="lg">{t('auth:resetPasswordTitle')}</Heading>
        <Text textAlign="center" color="gray.600">
          {t('auth:resetPasswordDesc')}
        </Text>

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

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              w="full"
              isLoading={isLoading}
              loadingText={t('common:sending')}
            >
              {t('auth:sendResetLink')}
            </Button>
          </VStack>
        </form>

        <Flex mt={4} justify="center" w="full">
          <NextLink href="/login" passHref>
            <Link color="blue.500" fontSize="sm">
              {t('auth:backToLogin')}
            </Link>
          </NextLink>
        </Flex>
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

export default ResetPassword;
