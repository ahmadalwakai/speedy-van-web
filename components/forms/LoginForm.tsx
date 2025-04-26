import React from 'react';
import { Button, FormControl, FormLabel, Input, VStack, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from 'next-i18next';

interface LoginFormProps {
  onSuccess: () => void;
}

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation('auth');
  const toast = useToast();
  const { login, isLoading } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password, data.rememberMe);
      toast({
        title: t('loginSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: t('loginError'),
        description: error instanceof Error ? error.message : t('loginErrorDescription'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.email}>
          <FormLabel>{t('email')}</FormLabel>
          <Input
            type="email"
            {...register('email', { 
              required: t('emailRequired'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('invalidEmail')
              }
            })}
          />
        </FormControl>

        <FormControl isInvalid={!!errors.password}>
          <FormLabel>{t('password')}</FormLabel>
          <Input
            type="password"
            {...register('password', { 
              required: t('passwordRequired'),
              minLength: {
                value: 6,
                message: t('passwordMinLength')
              }
            })}
          />
        </FormControl>

        <FormControl>
          <input
            type="checkbox"
            id="rememberMe"
            {...register('rememberMe')}
          />
          <FormLabel htmlFor="rememberMe" ml={2} mb={0}>
            {t('rememberMe')}
          </FormLabel>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          isLoading={isLoading}
          loadingText={t('loggingIn')}
        >
          {t('login')}
        </Button>
      </VStack>
    </form>
  );
};

export default LoginForm;