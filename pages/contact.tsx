import React from 'react';
import { Box, Heading, Text, VStack, FormControl, FormLabel, Input, Textarea, Button, useToast } from '@chakra-ui/react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

// Validation schema for contact form
const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  message: Yup.string().required('Message is required'),
});

interface FormData {
  name: string;
  email: string;
  message: string;
}

const Contact: React.FC = () => {
  const { t } = useTranslation(['common', 'contact']);
  const toast = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Simulate API call (replace with actual API endpoint)
      console.log('Contact Form Submission:', data);
      toast({
        title: t('contact:successTitle', { defaultValue: 'Message Sent' }),
        description: t('contact:successMessage', { defaultValue: 'Thank you for contacting us! We will respond soon.' }),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Head>
        <title>{t('contact:title', { defaultValue: 'Contact Us | Speedy Van' })}</title>
        <meta
          name="description"
          content={t('contact:description', {
            defaultValue: 'Get in touch with Speedy Van for fast and reliable van delivery services across the UK.',
          })}
        />
        <meta name="keywords" content="Contact Speedy Van, Van Delivery UK, Customer Support" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content={t('contact:ogTitle', { defaultValue: 'Contact Speedy Van for Van Delivery Services' })}
        />
        <meta
          property="og:description"
          content={t('contact:ogDescription', { defaultValue: 'Reach out to Speedy Van for support or inquiries.' })}
        />
        <meta property="og:image" content="https://speedyvan.com/og-image.jpg" />
        <meta property="og:url" content="https://speedyvan.com/contact" />
        <meta property="og:type" content="website" />
      </Head>

      <Box maxW="3xl" mx="auto" px={{ base: 4, md: 8 }} py={12}>
        <VStack spacing={6} align="start">
          <Heading as="h1" size="2xl">
            {t('contact:heading', { defaultValue: 'Contact Us' })}
          </Heading>
          <Text fontSize="lg">
            {t('contact:intro', {
              defaultValue: 'Have questions or need assistance? Reach out to Speedy Van for fast and reliable support.',
            })}
          </Text>
          <Text fontSize="lg">
            {t('common:emailLabel', { defaultValue: 'Email' })}: <a href="mailto:info@speedy-van.co.uk">info@speedy-van.co.uk</a>
          </Text>
          <Text fontSize="lg">
            {t('common:phoneLabel', { defaultValue: 'Phone' })}: <a href="tel:+447901846297">+44 7901 846297</a>
          </Text>

          <Box as="form" onSubmit={handleSubmit(onSubmit)} w="full">
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>{t('contact:name', { defaultValue: 'Name' })}</FormLabel>
                <Input {...register('name')} />
                <Text color="red.500">{errors.name?.message}</Text>
              </FormControl>
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>{t('contact:email', { defaultValue: 'Email' })}</FormLabel>
                <Input type="email" {...register('email')} />
                <Text color="red.500">{errors.email?.message}</Text>
              </FormControl>
              <FormControl isInvalid={!!errors.message}>
                <FormLabel>{t('contact:message', { defaultValue: 'Message' })}</FormLabel>
                <Textarea {...register('message')} />
                <Text color="red.500">{errors.message?.message}</Text>
              </FormControl>
              <Button type="submit" colorScheme="primary" size="lg">
                {t('contact:submit', { defaultValue: 'Send Message' })}
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'contact'])),
    },
  };
};

export default Contact;