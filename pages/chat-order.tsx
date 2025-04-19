import React from 'react';
import { Box } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ChatOrder from '../components/chat-order';
import SupportChat from '../components/SupportChat';

const ChatOrderPage: React.FC = () => {
  return (
    <Box>
      <ChatOrder />
      <SupportChat />
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

export default ChatOrderPage;