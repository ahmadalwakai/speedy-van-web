import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  SimpleGrid,
  useColorModeValue,
  Container,
  Stack,
  List,
  ListItem,
  ListIcon,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  useToast,
  Progress,
  IconButton,
  Link,
  StackDirection,
  FormErrorMessage,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import NextLink from 'next/link';
import { GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import { CheckCircleIcon, PhoneIcon } from '@chakra-ui/icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { db, storage } from '@/services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Log to confirm page compilation
console.log('Compiling become-driver.tsx');

const MotionBox = motion(Box);
const MotionButton = motion(Button);

// Define FormData interface
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalInsuranceNumber?: string;
  drivingLicenceExpiry?: Date;
  vehicleOwnership: string;
  vehicleRegistration: string;
  drivingLicence: FileList;
  insuranceCertificate: FileList;
  rightToWork?: FileList;
  dbsCertificate?: FileList;
  preferredAreas: string;
  availability: string;
  businessInsurance: boolean;
  termsAgreed: boolean;
  privacyAgreed: boolean;
}

// Validation schema using Yup
const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string()
    .matches(/^\+44\d{10}$/, 'Phone number must be a valid UK number starting with +44')
    .required('Phone number is required'),
  nationalInsuranceNumber: Yup.string().optional(),
  drivingLicenceExpiry: Yup.date().optional(),
  vehicleOwnership: Yup.string().required('Please select an option'),
  vehicleRegistration: Yup.string().required('Registration number is required'),
  drivingLicence: Yup.mixed<FileList>()
    .required('Driving licence is required')
    .test('fileSize', 'File size must be less than 5MB', (value: FileList | undefined) => {
      return value && value[0] && value[0].size <= 5 * 1024 * 1024;
    })
    .test('fileType', 'Only JPG, PNG, or PDF allowed', (value: FileList | undefined) => {
      return (
        value &&
        value[0] &&
        ['image/jpeg', 'image/png', 'application/pdf'].includes(value[0].type)
      );
    }),
  insuranceCertificate: Yup.mixed<FileList>()
    .required('Insurance certificate is required')
    .test('fileSize', 'File size must be less than 5MB', (value: FileList | undefined) => {
      return value && value[0] && value[0].size <= 5 * 1024 * 1024;
    })
    .test('fileType', 'Only JPG, PNG, or PDF allowed', (value: FileList | undefined) => {
      return (
        value &&
        value[0] &&
        ['image/jpeg', 'image/png', 'application/pdf'].includes(value[0].type)
      );
    }),
  rightToWork: Yup.mixed<FileList>().optional(),
  dbsCertificate: Yup.mixed<FileList>().optional(),
  preferredAreas: Yup.string().required('Please specify preferred areas'),
  availability: Yup.string().required('Please select availability'),
  businessInsurance: Yup.boolean()
    .required('You must confirm insurance')
    .oneOf([true], 'You must confirm insurance')
    .default(false),
  termsAgreed: Yup.boolean()
    .required('You must agree to the terms')
    .oneOf([true], 'You must agree to the terms')
    .default(false),
  privacyAgreed: Yup.boolean()
    .required('You must agree to the privacy policy')
    .oneOf([true], 'You must agree to the privacy policy')
    .default(false),
});

const BecomeDriver: React.FC = () => {
  const { t } = useTranslation(['common']);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const cardBg = useColorModeValue('white', 'gray.800');
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver<FormData>(validationSchema),
    defaultValues: {
      businessInsurance: false,
      termsAgreed: false,
      privacyAgreed: false,
    },
  });

  // Auto-save to LocalStorage
  const formValues = watch();
  useEffect(() => {
    localStorage.setItem('driverApplicationDraft', JSON.stringify(formValues));
  }, [formValues]);

  // Load draft from LocalStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem('driverApplicationDraft');
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      // Ensure drivingLicenceExpiry is a Date or undefined
      if (parsedDraft.drivingLicenceExpiry) {
        parsedDraft.drivingLicenceExpiry = new Date(parsedDraft.drivingLicenceExpiry);
      }
      reset(parsedDraft);
    }
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const files = {
        drivingLicence: data.drivingLicence[0],
        insuranceCertificate: data.insuranceCertificate[0],
        rightToWork: data.rightToWork?.[0],
        dbsCertificate: data.dbsCertificate?.[0],
      };

      const uploadPromises = Object.entries(files).map(async ([key, file]) => {
        if (!file) return null;
        const storageRef = ref(storage, `driverApplications/${data.email}/${key}`);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      });

      const urls = await Promise.all(uploadPromises);

      const applicationId = `SVDR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      await addDoc(collection(db, 'driverApplications'), {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        nationalInsuranceNumber: data.nationalInsuranceNumber || null,
        drivingLicenceExpiry: data.drivingLicenceExpiry || null,
        vehicleOwnership: data.vehicleOwnership,
        vehicleRegistration: data.vehicleRegistration,
        drivingLicenceUrl: urls[0] || null,
        insuranceCertificateUrl: urls[1] || null,
        rightToWorkUrl: urls[2] || null,
        dbsCertificateUrl: urls[3] || null,
        preferredAreas: data.preferredAreas,
        availability: data.availability,
        businessInsurance: data.businessInsurance,
        status: 'pending',
        submittedAt: new Date(),
        notes: '',
        applicationId,
      });

      toast({
        title: t('common:applicationSubmitted', { defaultValue: 'Application Submitted' }),
        description: `${t('common:applicationReview', {
          defaultValue: 'Your application has been submitted. Our team will review it and contact you soon.',
        })} Application ID: ${applicationId}`,
        status: 'success',
        duration: 9000,
        isClosable: true,
      });

      localStorage.removeItem('driverApplicationDraft');
      setStep(6); // Success step
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
      <Head>
        <title>{t('common:becomeDriver', { defaultValue: 'Become a Driver' })} | Speedy Van</title>
        <meta
          name="description"
          content="Join Speedy Van as a driver and enjoy flexible hours, competitive earnings, and opportunities across the UK."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="keywords" content="driver jobs, delivery driver, UK van driver, Speedy Van careers" />
      </Head>

      <Box bg={bgColor} color={textColor} minH="100vh" py={12} position="relative">
        {/* Floating Contact Button */}
        <IconButton
          as="a"
          href="tel:+447901846297"
          aria-label="Contact Us"
          icon={<PhoneIcon />}
          colorScheme="primary"
          size="lg"
          position="fixed"
          bottom={6}
          right={6}
          borderRadius="full"
          zIndex={10}
        />

        {/* Hero Section */}
        <MotionBox
          as={Container}
          maxW="7xl"
          py={16}
          textAlign="center"
          initial="initial"
          animate="animate"
          variants={fadeIn}
          bgGradient="linear(to-b, primary.50, gray.50)"
        >
          <Stack spacing={6}>
            <Heading as="h1" size={{ base: '2xl', md: '3xl' }}>
              {t('common:driveWithSpeedy', { defaultValue: 'Drive with Speedy Van' })}
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} maxW="2xl" mx="auto">
              {t('common:heroDescription', { defaultValue: 'Flexible jobs, great earnings, and the freedom to drive on your terms.' })}
            </Text>
            <Button
              as={NextLink}
              href="#application-form"
              colorScheme="primary"
              size="lg"
              mt={4}
            >
              {t('common:startApplication', { defaultValue: 'Start Your Application' })}
            </Button>
            {/* Add driver-van.png and fallback.png to public/illustrations if enabling */}
            {/* <Image
              src="/illustrations/driver-van.png"
              alt="Driver with Van"
              maxW={{ base: '300px', md: '400px' }}
              mx="auto"
              mt={8}
              loading="lazy"
              fallbackSrc="/illustrations/fallback.png"
            /> */}
          </Stack>
        </MotionBox>

        {/* Why Drive With Us */}
        <MotionBox
          as={Container}
          maxW="7xl"
          py={16}
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <Heading as="h2" size="xl" textAlign="center" mb={10}>
            {t('common:whyDrive', { defaultValue: 'Why Drive with Us?' })}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            {[
              { title: 'Competitive Rates', desc: 'Earn top rates per delivery.' },
              { title: 'Flexible Hours', desc: 'Choose when and where you work.' },
              { title: 'Insurance Support', desc: 'Guidance on commercial insurance.' },
              { title: 'Wide Coverage', desc: 'Deliver across the UK with ease.' },
            ].map((item, idx) => (
              <Box key={idx} bg={cardBg} p={6} rounded="lg" shadow="md" textAlign="center">
                <Heading as="h3" size="md" mb={4}>
                  {t(`common:${item.title.toLowerCase().replace(' ', '')}`, { defaultValue: item.title })}
                </Heading>
                <Text>{t(`common:${item.title.toLowerCase().replace(' ', '')}Desc`, { defaultValue: item.desc })}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </MotionBox>

        {/* Requirements */}
        <MotionBox
          as={Container}
          maxW="7xl"
          py={16}
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <Heading as="h2" size="xl" textAlign="center" mb={10}>
            {t('common:requirements', { defaultValue: 'Requirements' })}
          </Heading>
          <List spacing={4} maxW="2xl" mx="auto">
            {[
              { text: 'Valid UK Driving Licence', link: 'https://www.gov.uk/browse/driving/driving-licences' },
              { text: 'Commercial Vehicle Insurance', link: 'https://www.gov.uk/vehicle-insurance' },
              { text: 'Proof of Right to Work in the UK', link: 'https://www.gov.uk/prove-right-to-work' },
              { text: 'Own or rent a Van in good condition' },
              { text: 'Clean criminal record (DBS check preferred)', link: 'https://www.gov.uk/request-copy-criminal-record' },
              { text: 'Smartphone with GPS access' },
              { text: 'Commitment to customer service and safety' },
            ].map((item, idx) => (
              <ListItem key={idx} fontSize="lg">
                <ListIcon as={CheckCircleIcon} color="primary.500" />
                {item.link ? (
                  <Link href={item.link} isExternal color="primary.500">
                    {t(`common:requirement${idx + 1}`, { defaultValue: item.text })}
                  </Link>
                ) : (
                  t(`common:requirement${idx + 1}`, { defaultValue: item.text })
                )}
              </ListItem>
            ))}
          </List>
        </MotionBox>

        {/* Multi-Step Application Form */}
        <MotionBox
          as={Container}
          maxW="3xl"
          py={16}
          id="application-form"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <Heading as="h2" size="xl" textAlign="center" mb={10}>
            {t('common:applicationForm', { defaultValue: 'Driver Application Form' })}
          </Heading>
          <Progress value={(step / 6) * 100} mb={8} colorScheme="primary" rounded="md" />
          <Text textAlign="center" mb={4}>
            {t('common:stepIndicator', { defaultValue: `Step ${step} of 5` })}
          </Text>
          <Box bg={cardBg} p={8} rounded="lg" shadow="md">
            <form onSubmit={handleSubmit(onSubmit)}>
              {step === 1 && (
                <VStack spacing={6}>
                  <FormControl isInvalid={!!errors.firstName}>
                    <FormLabel>{t('common:firstName', { defaultValue: 'First Name' })}</FormLabel>
                    <Input {...register('firstName')} />
                    <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.lastName}>
                    <FormLabel>{t('common:lastName', { defaultValue: 'Last Name' })}</FormLabel>
                    <Input {...register('lastName')} />
                    <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel>{t('common:email', { defaultValue: 'Email' })}</FormLabel>
                    <Input type="email" {...register('email')} />
                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.phone}>
                    <FormLabel>{t('common:phone', { defaultValue: 'Phone Number' })}</FormLabel>
                    <Input type="tel" placeholder="+447123456789" {...register('phone')} />
                    <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
                  </FormControl>
                  <Button colorScheme="primary" onClick={nextStep} w="full">
                    {t('common:next', { defaultValue: 'Next' })}
                  </Button>
                </VStack>
              )}

              {step === 2 && (
                <VStack spacing={6}>
                  <FormControl isInvalid={!!errors.nationalInsuranceNumber}>
                    <FormLabel>{t('common:nationalInsuranceNumber', { defaultValue: 'National Insurance Number (Optional)' })}</FormLabel>
                    <Input {...register('nationalInsuranceNumber')} />
                    <FormErrorMessage>{errors.nationalInsuranceNumber?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.drivingLicenceExpiry}>
                    <FormLabel>{t('common:drivingLicenceExpiry', { defaultValue: 'Driving Licence Expiry Date (Optional)' })}</FormLabel>
                    <Controller
                      name="drivingLicenceExpiry"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                      )}
                    />
                    <FormErrorMessage>{errors.drivingLicenceExpiry?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.vehicleOwnership}>
                    <FormLabel>{t('common:vehicleOwnership', { defaultValue: 'Vehicle Ownership' })}</FormLabel>
                    <Select {...register('vehicleOwnership')}>
                      <option value="">{t('common:selectOption', { defaultValue: 'Select an option' })}</option>
                      <option value="own">{t('common:own', { defaultValue: 'Own' })}</option>
                      <option value="rent">{t('common:rent', { defaultValue: 'Rent' })}</option>
                    </Select>
                    <FormErrorMessage>{errors.vehicleOwnership?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.vehicleRegistration}>
                    <FormLabel>{t('common:vehicleRegistration', { defaultValue: 'Vehicle Registration Number' })}</FormLabel>
                    <Input {...register('vehicleRegistration')} />
                    <FormErrorMessage>{errors.vehicleRegistration?.message}</FormErrorMessage>
                  </FormControl>
                  <Stack direction={{ base: 'column', sm: 'row' } as StackDirection} w="full">
                    <Button variant="outline" onClick={prevStep} w="full">
                      {t('common:back', { defaultValue: 'Back' })}
                    </Button>
                    <Button colorScheme="primary" onClick={nextStep} w="full">
                      {t('common:next', { defaultValue: 'Next' })}
                    </Button>
                  </Stack>
                </VStack>
              )}

              {step === 3 && (
                <VStack spacing={6}>
                  <FormControl isInvalid={!!errors.drivingLicence}>
                    <FormLabel>{t('common:drivingLicence', { defaultValue: 'Driving Licence' })}</FormLabel>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      {...register('drivingLicence')}
                    />
                    <FormErrorMessage>{errors.drivingLicence?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.insuranceCertificate}>
                    <FormLabel>{t('common:insuranceCertificate', { defaultValue: 'Insurance Certificate' })}</FormLabel>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      {...register('insuranceCertificate')}
                    />
                    <FormErrorMessage>{errors.insuranceCertificate?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl>
                    <FormLabel>
                      {t('common:rightToWork', { defaultValue: 'Right to Work (Optional)' })}
                      <Link href="https://www.gov.uk/prove-right-to-work" isExternal ml={2} color="primary.500">
                        {t('common:shareCodeGuide', { defaultValue: 'Get Share Code' })}
                      </Link>
                    </FormLabel>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      {...register('rightToWork')}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>
                      {t('common:dbsCertificate', { defaultValue: 'DBS Certificate (Optional)' })}
                      <Link href="https://www.gov.uk/request-copy-criminal-record" isExternal ml={2} color="primary.500">
                        {t('common:dbsGuide', { defaultValue: 'Request DBS' })}
                      </Link>
                    </FormLabel>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      {...register('dbsCertificate')}
                    />
                  </FormControl>
                  <Stack direction={{ base: 'column', sm: 'row' } as StackDirection} w="full">
                    <Button variant="outline" onClick={prevStep} w="full">
                      {t('common:back', { defaultValue: 'Back' })}
                    </Button>
                    <Button colorScheme="primary" onClick={nextStep} w="full">
                      {t('common:next', { defaultValue: 'Next' })}
                    </Button>
                  </Stack>
                </VStack>
              )}

              {step === 4 && (
                <VStack spacing={6}>
                  <FormControl isInvalid={!!errors.preferredAreas}>
                    <FormLabel>{t('common:preferredAreas', { defaultValue: 'Preferred Working Areas' })}</FormLabel>
                    <Input {...register('preferredAreas')} />
                    <FormErrorMessage>{errors.preferredAreas?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.availability}>
                    <FormLabel>{t('common:availability', { defaultValue: 'Availability' })}</FormLabel>
                    <Select {...register('availability')}>
                      <option value="">{t('common:selectOption', { defaultValue: 'Select an option' })}</option>
                      <option value="full-time">{t('common:fullTime', { defaultValue: 'Full-Time' })}</option>
                      <option value="part-time">{t('common:partTime', { defaultValue: 'Part-Time' })}</option>
                      <option value="weekends">{t('common:weekends', { defaultValue: 'Weekends Only' })}</option>
                    </Select>
                    <FormErrorMessage>{errors.availability?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.businessInsurance}>
                    <Controller
                      name="businessInsurance"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          isChecked={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        >
                          {t('common:businessInsurance', { defaultValue: 'I have valid business insurance covering goods in transit' })}
                          <Link href="https://www.gov.uk/vehicle-insurance" isExternal ml={2} color="primary.500">
                            {t('common:insuranceGuide', { defaultValue: 'Learn More' })}
                          </Link>
                        </Checkbox>
                      )}
                    />
                    <FormErrorMessage>{errors.businessInsurance?.message}</FormErrorMessage>
                  </FormControl>
                  <Stack direction={{ base: 'column', sm: 'row' } as StackDirection} w="full">
                    <Button variant="outline" onClick={prevStep} w="full">
                      {t('common:back', { defaultValue: 'Back' })}
                    </Button>
                    <Button colorScheme="primary" onClick={nextStep} w="full">
                      {t('common:next', { defaultValue: 'Next' })}
                    </Button>
                  </Stack>
                </VStack>
              )}

              {step === 5 && (
                <VStack spacing={6}>
                  <FormControl isInvalid={!!errors.termsAgreed}>
                    <Controller
                      name="termsAgreed"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          isChecked={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        >
                          {t('common:termsAgreed', { defaultValue: 'I confirm that all provided information is accurate and agree to the ' })}
                          <Link as={NextLink} href="/driver-terms" color="primary.500">
                            {t('common:termsAndConditions', { defaultValue: 'Terms & Conditions' })}
                          </Link>
                        </Checkbox>
                      )}
                    />
                    <FormErrorMessage>{errors.termsAgreed?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.privacyAgreed}>
                    <Controller
                      name="privacyAgreed"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          isChecked={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                        >
                          {t('common:privacyAgreed', { defaultValue: 'I agree to the ' })}
                          <Link as={NextLink} href="/privacy" color="primary.500">
                            {t('common:privacyPolicy', { defaultValue: 'Privacy Policy' })}
                          </Link>
                          {t('common:gdprCompliance', { defaultValue: ' in accordance with GDPR.' })}
                        </Checkbox>
                      )}
                    />
                    <FormErrorMessage>{errors.privacyAgreed?.message}</FormErrorMessage>
                  </FormControl>
                  <Stack direction={{ base: 'column', sm: 'row' } as StackDirection} w="full">
                    <Button variant="outline" onClick={prevStep} w="full">
                      {t('common:back', { defaultValue: 'Back' })}
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="primary"
                      w="full"
                      isLoading={isSubmitting}
                    >
                      {t('common:submit', { defaultValue: 'Submit Application' })}
                    </Button>
                  </Stack>
                </VStack>
              )}

              {step === 6 && (
                <VStack spacing={6} textAlign="center">
                  <CheckCircleIcon boxSize={12} color="primary.500" />
                  <Heading as="h3" size="lg">
                    {t('common:thankYou', { defaultValue: 'Thank You!' })}
                  </Heading>
                  <Text fontSize="lg">
                    {t('common:applicationReview', { defaultValue: 'Your application has been submitted. Our team will review it and contact you soon.' })}
                  </Text>
                  <Button as={NextLink} href="/" colorScheme="primary">
                    {t('common:backToHome', { defaultValue: 'Back to Home' })}
                  </Button>
                </VStack>
              )}
            </form>
          </Box>
        </MotionBox>

        {/* Need Help with Documents */}
        <MotionBox
          as={Container}
          maxW="7xl"
          py={16}
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <Heading as="h2" size="xl" textAlign="center" mb={10}>
            {t('common:needHelpDocuments', { defaultValue: 'Need Help with Documents?' })}
          </Heading>
          <List spacing={4} maxW="2xl" mx="auto">
            <ListItem>
              <Link href="https://www.gov.uk/prove-right-to-work" isExternal color="primary.500">
                {t('common:shareCodeGuide', { defaultValue: 'How to get your Share Code' })}
              </Link>
            </ListItem>
            <ListItem>
              <Link href="https://www.gov.uk/request-copy-criminal-record" isExternal color="primary.500">
                {t('common:dbsGuide', { defaultValue: 'Request your DBS Check' })}
              </Link>
            </ListItem>
            <ListItem>
              <Link href="https://www.gov.uk/vehicle-insurance" isExternal color="primary.500">
                {t('common:insuranceGuide', { defaultValue: 'Commercial Vehicle Insurance Guide' })}
              </Link>
            </ListItem>
          </List>
        </MotionBox>

        {/* FAQ */}
        <MotionBox
          as={Container}
          maxW="7xl"
          py={16}
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <Heading as="h2" size="xl" textAlign="center" mb={10}>
            {t('common:faq', { defaultValue: 'Frequently Asked Questions' })}
          </Heading>
          <VStack spacing={6} align="start" maxW="2xl" mx="auto">
            {[
              { q: 'How long does the application process take?', a: 'Typically, we review applications within 3-5 business days.' },
              { q: 'Do I need my own van?', a: 'Yes, you need to own or rent a van in good condition.' },
              { q: 'What areas do you cover?', a: 'We operate across the UK, with opportunities in most major cities.' },
            ].map((item, idx) => (
              <Box key={idx}>
                <Text fontWeight="bold" fontSize="lg">
                  {t(`common:faqQuestion${idx + 1}`, { defaultValue: item.q })}
                </Text>
                <Text>{t(`common:faqAnswer${idx + 1}`, { defaultValue: item.a })}</Text>
              </Box>
            ))}
          </VStack>
        </MotionBox>
      </Box>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
    revalidate: 3600,
  };
};

export default BecomeDriver;