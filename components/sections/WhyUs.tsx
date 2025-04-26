import React from 'react';
import { Box, Heading, Text, SimpleGrid, VStack, useColorModeValue, Icon } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { LockIcon, ZapIcon, DollarSignIcon } from '@/components/Icons';

const WhyUs: React.FC = () => {
  const { t } = useTranslation(['home']);
  const bgColor = useColorModeValue('primary.50', 'primary.900');
  const shouldReduceMotion = useReducedMotion();

  const features = [
    {
      icon: LockIcon,
      title: t('home:feature1Title', { defaultValue: 'Security' }),
      desc: t('home:feature1Desc', { defaultValue: 'Insured deliveries for safety.' }),
    },
    {
      icon: ZapIcon,
      title: t('home:feature2Title', { defaultValue: 'Speed' }),
      desc: t('home:feature2Desc', { defaultValue: 'Fastest delivery in the UK.' }),
    },
    {
      icon: DollarSignIcon,
      title: t('home:feature3Title', { defaultValue: 'Transparency' }),
      desc: t('home:feature3Desc', { defaultValue: 'Clear pricing, no hidden fees.' }),
    },
  ];

  const variants: Variants = shouldReduceMotion
    ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 },
      }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.2 } },
      };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants}
      style={{ scrollSnapAlign: 'start' }}
    >
      <Box bg={bgColor} py={{ base: 12, md: 20 }} px={{ base: 4, md: 8 }}>
        <Heading size="lg" textAlign="center" mb={10} color="text.primary">
          {t('home:whyUsTitle', { defaultValue: 'Why Speedy Van?' })}
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} maxW="7xl" mx="auto">
          {features.map((feature, index) => (
            <motion.div key={index} variants={variants}>
              <VStack spacing={4} textAlign="center">
                <Icon as={feature.icon} w={10} h={10} color="primary.500" />
                <Heading size="md" color="text.primary">
                  {feature.title}
                </Heading>
                <Text color="text.secondary">{feature.desc}</Text>
              </VStack>
            </motion.div>
          ))}
        </SimpleGrid>
      </Box>
    </motion.div>
  );
};

export default WhyUs;