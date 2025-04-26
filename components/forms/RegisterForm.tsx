import React from 'react';
import { Button, FormControl, FormLabel, Input, VStack, useToast } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from 'next-i18next';

interface RegisterFormProps {
  onSuccess: () => void;
}

interface FormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation('auth');
  const toast = useToast();
  const { register, isLoading } = useAuthStore();
  const { register: formRegister, handleSubmit, watch, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await register(data.email, data.username, data.password);
      toast({
        title: t('registerSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSuccess();
    } catch (error) {
      toast({
        title: t('registerError'),
        description: error instanceof Error ? error.message : t('registerErrorDescription'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const password = watch('password');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.email}>
          <FormLabel>{t('email')}</FormLabel>
          <Input
            type="email"
            {...formRegister('email', { 
              required: t('emailRequired'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('invalidEmail')
              }
            })}
          />
        </FormControl>

        <FormControl isInvalid={!!errors.username}>
          <FormLabel>{t('username')}</FormLabel>
          <Input
            {...formRegister('username', { 
              required: t('usernameRequired'),
              minLength: {
                value: 3,
                message: t('usernameMinLength')
              }
            })}
          />
        </FormControl>

        <FormControl isInvalid={!!errors.password}>
          <FormLabel>{t('password')}</FormLabel>
          <Input
            type="password"
            {...formRegister('password', { 
              required: t('passwordRequired'),
              minLength: {
                value: 6,
                message: t('passwordMinLength')
              }
            })}
          />
        </FormControl>

        <FormControl isInvalid={!!errors.confirmPassword}>
          <FormLabel>{t('confirmPassword')}</FormLabel>
          <Input
            type="password"
            {...formRegister('confirmPassword', { 
              required: t('confirmPasswordRequired'),
              validate: value => 
                value === password || t('passwordsDontMatch')
            })}
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          isLoading={isLoading}
          loadingText={t('registering')}
        >
          {t('register')}
        </Button>
      </VStack>
    </form>
  );
};

export default RegisterForm;