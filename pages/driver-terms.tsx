import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Container,
  List,
  ListItem,
  ListIcon,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { CheckCircleIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';

const DriverTerms: React.FC = () => {
  const { t } = useTranslation(['terms']);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <>
      <Head>
        <title>{t('terms:title', { defaultValue: 'Driver Terms & Conditions | Speedy Van' })}</title>
        <meta
          name="description"
          content="Read the Terms & Conditions for self-employed drivers working with Speedy Van in the UK."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="keywords" content="terms and conditions, self-employed driver, Speedy Van, UK driver jobs" />
      </Head>

      <Box bg={bgColor} color={textColor} minH="100vh" py={12}>
        <Container maxW="4xl" py={16}>
          <VStack spacing={8} align="start">
            <Heading as="h1" size="2xl" textAlign="center" w="full">
              {t('terms:title', { defaultValue: 'Terms & Conditions for Drivers' })}
            </Heading>
            <Text fontSize="lg" textAlign="center" w="full">
              {t('terms:intro', { defaultValue: 'These Terms & Conditions govern the relationship between Speedy Van and self-employed drivers in the United Kingdom.' })}
            </Text>

            {/* Legal Status */}
            <Box>
              <Heading as="h2" size="lg" mb={4}>
                {t('terms:legalStatus', { defaultValue: '1. Legal Status' })}
              </Heading>
              <Text fontSize="md" mb={4}>
                {t('terms:legalStatusDesc', {
                  defaultValue: 'You acknowledge that you are engaged as an independent contractor and not as an employee of Speedy Van. This agreement does not constitute an employment contract. You are solely responsible for managing your work schedule, tools, and resources.'
                })}
              </Text>
              <Text fontSize="md">
                {t('terms:legalStatusTax', {
                  defaultValue: 'As a self-employed driver, you are responsible for registering with HMRC, paying your taxes, National Insurance contributions, and any other legal obligations.'
                })}
              </Text>
              <Link href="https://www.gov.uk/working-for-yourself" isExternal color="primary.500" ml={2}>
                {t('terms:hmrcGuide', { defaultValue: 'Learn more about working for yourself (HMRC)' })}
              </Link>
            </Box>

            {/* Driver Requirements */}
            <Box>
              <Heading as="h2" size="lg" mb={4}>
                {t('terms:driverRequirements', { defaultValue: '2. Driver Requirements' })}
              </Heading>
              <List spacing={3}>
                {[
                  'Hold a valid UK driving licence.',
                  'Maintain valid commercial vehicle insurance.',
                  'Have the legal right to work in the UK.',
                  'Comply with all UK traffic and safety regulations.',
                  'Ensure your vehicle has a valid MOT certificate and road tax.',
                ].map((item, idx) => (
                  <ListItem key={idx} fontSize="md">
                    <ListIcon as={CheckCircleIcon} color="primary.500" />
                    {t(`terms:requirement${idx + 1}`, { defaultValue: item })}
                  </ListItem>
                ))}
              </List>
              <Link href="https://www.gov.uk/vehicle-insurance" isExternal color="primary.500" mt={2} display="inline-block">
                {t('terms:insuranceGuide', { defaultValue: 'Commercial Vehicle Insurance Guide' })}
              </Link>
            </Box>

            {/* Driver Responsibilities */}
            <Box>
              <Heading as="h2" size="lg" mb={4}>
                {t('terms:responsibilities', { defaultValue: '3. Driver Responsibilities' })}
              </Heading>
              <List spacing={3}>
                {[
                  'Deliver orders on time and in a safe condition.',
                  'Interact with customers professionally and courteously.',
                  'Ensure the safety and integrity of goods during transit.',
                  'Report any accidents, violations, or issues to Speedy Van immediately.',
                ].map((item, idx) => (
                  <ListItem key={idx} fontSize="md">
                    <ListIcon as={CheckCircleIcon} color="primary.500" />
                    {t(`terms:responsibility${idx + 1}`, { defaultValue: item })}
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Payment Terms */}
            <Box>
              <Heading as="h2" size="lg" mb={4}>
                {t('terms:payment', { defaultValue: '4. Payment Terms' })}
              </Heading>
              <Text fontSize="md" mb={4}>
                {t('terms:paymentDesc', {
                  defaultValue: 'Payments are calculated based on the number of deliveries completed and/or distances traveled. Payments will be transferred to your designated bank account on a weekly basis.'
                })}
              </Text>
              <Text fontSize="md">
                {t('terms:paymentTax', {
                  defaultValue: 'You are responsible for declaring your income to HMRC and covering operational expenses such as fuel, vehicle maintenance, and insurance.'
                })}
              </Text>
              <Link href="https://www.gov.uk/set-up-sole-trader" isExternal color="primary.500" mt={2} display="inline-block">
                {t('terms:taxGuide', { defaultValue: 'Self-Employed Tax Guide (HMRC)' })}
              </Link>
            </Box>

            {/* Termination */}
            <Box>
              <Heading as="h2" size="lg" mb={4}>
                {t('terms:termination', { defaultValue: '5. Termination' })}
              </Heading>
              <Text fontSize="md" mb={4}>
                {t('terms:terminationDesc', {
                  defaultValue: 'Speedy Van reserves the right to terminate this agreement if you breach any laws, provide false information, or receive consistently poor customer feedback.'
                })}
              </Text>
              <Text fontSize="md">
                {t('terms:terminationNotice', {
                  defaultValue: 'You may terminate this agreement by providing 7 days’ written notice to Speedy Van.'
                })}
              </Text>
            </Box>

            {/* Data Protection */}
            <Box>
              <Heading as="h2" size="lg" mb={4}>
                {t('terms:dataProtection', { defaultValue: '6. Data Protection' })}
              </Heading>
              <Text fontSize="md" mb={4}>
                {t('terms:dataProtectionDesc', {
                  defaultValue: 'We process your personal data in accordance with the UK GDPR and Data Protection Act 2018. Your data will not be shared with third parties without your consent, except as required by law.'
                })}
              </Text>
              <Link as={NextLink} href="/privacy" color="primary.500">
                {t('terms:privacyPolicy', { defaultValue: 'View our Privacy Policy' })}
              </Link>
            </Box>

            {/* Liability & Insurance */}
            <Box>
              <Heading as="h2" size="lg" mb={4}>
                {t('terms:liability', { defaultValue: '7. Liability & Insurance' })}
              </Heading>
              <Text fontSize="md" mb={4}>
                {t('terms:liabilityDesc', {
                  defaultValue: 'Speedy Van is not liable for any damages, accidents, or losses incurred during your deliveries. You must maintain valid insurance covering goods in transit and third-party liability.'
                })}
              </Text>
            </Box>

            {/* Governing Law */}
            <Box>
              <Heading as="h2" size="lg" mb={4}>
                {t('terms:governingLaw', { defaultValue: '8. Governing Law' })}
              </Heading>
              <Text fontSize="md">
                {t('terms:governingLawDesc', {
                  defaultValue: 'This agreement is governed by the laws of England and Wales. Any disputes will be resolved in the courts of the United Kingdom.'
                })}
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['terms', 'common'])),
    },
    revalidate: 3600,
  };
};

export default DriverTerms;