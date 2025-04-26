import React, { useEffect } from 'react';
import {
  Box, Button, Heading, Text, VStack, Icon, useColorModeValue
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { jsPDF } from 'jspdf';
import { FiCheckCircle, FiDownload, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

const OrderSuccess: React.FC = () => {
  const { t } = useTranslation(['common', 'order']);
  const router = useRouter();
  const { session_id } = router.query;
  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (!session_id) {
      router.push('/');
    }
  }, [session_id, router]);

  const generatePDF = () => {
    const order = JSON.parse(localStorage.getItem('lastOrder') || '{}');
    if (!order || !order.firstName) {
      alert(t('order:noOrderData', { defaultValue: 'No order data found!' }));
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(t('order:invoiceTitle', { defaultValue: 'Order Invoice' }), 20, 20);

    doc.setFontSize(12);
    doc.text(`${t('order:firstName')}: ${order.firstName}`, 20, 30);
    doc.text(`${t('order:lastName')}: ${order.lastName}`, 20, 40);
    doc.text(`${t('order:phoneNumber')}: ${order.phoneNumber}`, 20, 50);
    doc.text(`${t('common:email')}: ${order.email}`, 20, 60);
    doc.text(`${t('order:pickupAddress')}: ${order.pickupAddress}`, 20, 70);
    doc.text(`${t('order:dropoffAddress')}: ${order.dropoffAddress}`, 20, 80);
    doc.text(`${t('order:serviceType')}: ${t(`order:${order.serviceType}`)}`, 20, 90);
    doc.text(`${t('order:totalPrice')}: £${order.totalPrice}`, 20, 100);

    doc.save('speedy-van-invoice.pdf');
  };

  return (
    <Box minH="100vh" p={4} bg={bgColor} dir={router.locale === 'ar' ? 'rtl' : 'ltr'}>
      <Button
        leftIcon={<FiArrowLeft />}
        onClick={() => router.push('/')}
        variant="outline"
        colorScheme="blue"
        mb={4}
      >
        {t('common:back', { defaultValue: 'Back' })}
      </Button>
      <VStack
        spacing={6}
        maxW="lg"
        mx="auto"
        bg={bgColor}
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        textAlign="center"
      >
        <Icon as={FiCheckCircle} boxSize={16} color="green.500" />
        <Heading size="xl" color="blue.500">
          {t('order:successTitle', { defaultValue: 'Order Confirmed!' })}
        </Heading>
        <Text fontSize="lg" color="gray.500">
          {t('order:successMessage', { defaultValue: 'Your delivery has been booked successfully.' })}
        </Text>
        <Button colorScheme="blue" size="lg" leftIcon={<FiDownload />} onClick={generatePDF}>
          {t('order:downloadInvoice', { defaultValue: 'Download Invoice' })}
        </Button>
        <Link href="/" passHref legacyBehavior>
          <Button colorScheme="blue" size="lg" variant="outline">
            {t('order:backToHome', { defaultValue: 'Back to Home' })}
          </Button>
        </Link>
      </VStack>
    </Box>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'order'])),
    },
  };
};

export default OrderSuccess;
