import React from 'react';
import { Box, Heading, Text, SimpleGrid, Button, useColorModeValue, Icon } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import NextLink from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { TruckIcon, ZapIcon } from '@/components/Icons';

const Services: React.FC = () => {
  const { t } = useTranslation(['home']);
  const cardBg = useColorModeValue('background.light', 'background.dark');
  const shouldReduceMotion = useReducedMotion();

  const services = [
    {
      icon: TruckIcon,
      title: t('home:service1Title', { defaultValue: 'Man with Van' }),
      desc: t('home:service1Desc', { defaultValue: 'Fast delivery with a single driver.' }),
      link: '/book-order',
    },
    {
      icon: TruckIcon,
      title: t('home:service2Title', { defaultValue: 'Two Men with Van' }),
      desc: t('home:service2Desc', { defaultValue: 'Extra help for heavy loads.' }),
      link: '/book-order',
    },
    {
      icon: ZapIcon,
      title: t('home:service3Title', { defaultValue: 'Smart Booking' }),
      desc: t('home:service3Desc', { defaultValue: 'Book instantly with AI chat.' }),
      link: '/chat-order',
    },
  ];

  const variants = shouldReduceMotion
    ? {}
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
      <Box py={{ base: 12, md: 20 }} px={{ base: 4, md: 8 }}>
        <Heading size="lg" textAlign="center" mb={10} color="text.primary">
          {t('home:servicesTitle', { defaultValue: 'Our Services' })}
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} maxW="7xl" mx="auto">
          {services.map((service, index) => (
            <motion.div key={index} variants={variants}>
              <Box
                bg={cardBg}
                p={6}
                borderRadius="lg"
                boxShadow="lg"
                textAlign="center"
                _hover={{ transform: shouldReduceMotion ? 'none' : 'translateY(-5px)', transition: 'all 0.3s' }}
                role="group"
              >
                <Icon as={service.icon} w={12} h={12} color="primary.500" mb={4} />
                <Heading size="md" mb={4} color="text.primary">
                  {service.title}
                </Heading>
                <Text color="text.secondary">{service.desc}</Text>
                <NextLink href={service.link} passHref legacyBehavior>
                  <Button
                    as="a"
                    mt={4}
                    colorScheme="primary"
                    variant="outline"
                    aria-label={t('home:start', { defaultValue: 'Start' })}
                  >
                    {t('home:start', { defaultValue: 'Start' })}
                  </Button>
                </NextLink>
              </Box>
            </motion.div>
          ))}
        </SimpleGrid>
      </Box>
    </motion.div>
  );
};

export default Services;