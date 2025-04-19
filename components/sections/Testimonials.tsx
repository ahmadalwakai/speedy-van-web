import React from 'react';
import { Box, Heading, Text, SimpleGrid, HStack, useColorModeValue, Icon } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { StarIcon } from '@/components/Icons';

const Testimonials: React.FC = () => {
  const { t } = useTranslation(['home']);
  const cardBg = useColorModeValue('background.light', 'background.dark');
  const shouldReduceMotion = useReducedMotion();

  const testimonials = [
    {
      rating: 5,
      text: t('home:testimonial1', { defaultValue: 'Delivered my furniture in record time!' }),
      author: 'John D.',
    },
    {
      rating: 4,
      text: t('home:testimonial2', { defaultValue: 'The chat booking was so easy!' }),
      author: 'Sarah M.',
    },
    {
      rating: 5,
      text: t('home:testimonial3', { defaultValue: 'Reliable and affordable!' }),
      author: 'Ahmed K.',
    },
  ];

  const variants: Variants = shouldReduceMotion
    ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 },
      }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            staggerChildren: 0.2,
          },
        },
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
        bg={useColorModeValue('gray.100', 'gray.700')}
        py={{ base: 12, md: 20 }}
        px={{ base: 4, md: 8 }}
      >
        <Heading size="lg" textAlign="center" mb={10} color="text.primary">
          {t('home:testimonialsTitle', { defaultValue: 'What Our Customers Say' })}
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} maxW="7xl" mx="auto">
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={variants}>
              <Box
                bg={cardBg}
                p={6}
                borderRadius="lg"
                boxShadow="lg"
                textAlign="center"
              >
                <HStack justify="center" mb={4}>
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      as={StarIcon}
                      key={i}
                      color={i < testimonial.rating ? 'gold' : 'gray.300'}
                      w={6}
                      h={6}
                    />
                  ))}
                </HStack>
                <Text color="text.secondary" mb={4}>{testimonial.text}</Text>
                <Text fontWeight="bold" color="text.primary">{testimonial.author}</Text>
              </Box>
            </motion.div>
          ))}
        </SimpleGrid>
      </Box>
    </motion.div>
  );
};

export default Testimonials;
