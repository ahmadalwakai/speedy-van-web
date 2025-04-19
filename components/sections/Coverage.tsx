const variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
import React from 'react';
import { Box, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { motion, useReducedMotion, Variants } from 'framer-motion';

const Coverage: React.FC = () => {
  const { t } = useTranslation(['home']);
  const shouldReduceMotion = useReducedMotion();

  const variants: Variants = shouldReduceMotion
    ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 },
      }
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
      <Box
        paddingY={{ base: 12, md: 20 }}
        paddingX={{ base: 4, md: 8 }}
        textAlign="center"
      >
        <Heading
          size="lg"
          marginBottom={6}
          color="text.primary"
        >
          {t('home:coverageTitle', { defaultValue: 'Our Coverage' })}
        </Heading>
        <Text
          fontSize="lg"
          color="text.secondary"
          maxWidth="2xl"
          marginX="auto"
        >
          {t('home:coverageDesc', {
            defaultValue: 'We deliver across the UK, from cities to rural areas.',
          })}
        </Text>
      </Box>
    </motion.div>
  );
};

export default Coverage;