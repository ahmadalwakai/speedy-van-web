import React from 'react';
import { Box, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { motion, useReducedMotion } from 'framer-motion';

const Coverage: React.FC = () => {
  const { t } = useTranslation(['home']);
  const shouldReduceMotion = useReducedMotion();

  const variants = shouldReduceMotion
    ? {}
    : {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
      };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants}
      style={{ scrollSnapAlign: 'start' }}
    >
      <Box py={{ base: 12, md: 20 }} px={{ base: 4, md: 8 }} textAlign="center">
        <Heading size="lg" mb={6} color="text.primary">
          {t('home:coverageTitle', { defaultValue: 'Our Coverage' })}
        </Heading>
        <Text fontSize="lg" color="text.secondary" maxW="2xl" mx="auto">
          {t('home:coverageDesc', {
            defaultValue: 'We deliver across the UK, from cities to rural areas.',
          })}
        </Text>
      </Box>
    </motion.div>
  );
};

export default Coverage;