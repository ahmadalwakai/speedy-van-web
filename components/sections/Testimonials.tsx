import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  useColorModeValue,
  Icon,
  Container,
  Avatar
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { StarIcon } from '@/components/Icons';

const Testimonials: React.FC = () => {
  const { t } = useTranslation('home');
  const shouldReduceMotion = useReducedMotion();

  const testimonials = [
    { rating: 5, text: t('testimonial1', { defaultValue: 'Delivered my furniture in record time!' }), author: 'John D.' },
    { rating: 4, text: t('testimonial2', { defaultValue: 'The chat booking was so easy!' }), author: 'Sarah M.' },
    { rating: 5, text: t('testimonial3', { defaultValue: 'Reliable and affordable!' }), author: 'Ahmed K.' }
  ];

  const variants: Variants = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.2 } } };

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const authorColor = useColorModeValue('gray.800', 'white');

  return (
    <Box
      as={motion.section}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants}
      bg={bgColor}
      py={{ base: 12, md: 20 }}
      px={{ base: 4, md: 8 }}
    >
      <Container maxW="7xl">
        <Heading as="h2" size="lg" textAlign="center" mb={10} color={authorColor}>
          {t('testimonials.title', { defaultValue: 'What Our Customers Say' })}
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {testimonials.map((testimonial, index) => (
            <Box
              as={motion.article}
              key={index}
              variants={variants}
              bg={cardBg}
              p={6}
              borderRadius="lg"
              boxShadow="md"
              textAlign="center"
              transition="all 0.3s ease"
              _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl' }}
            >
              <HStack justify="center" mb={4}>
                {[...Array(5)].map((_, i) => (
                  <Icon
                    as={StarIcon}
                    key={i}
                    color={i < testimonial.rating ? 'yellow.400' : 'gray.300'}
                    w={5}
                    h={5}
                  />
                ))}
              </HStack>
              <Text color={textColor} mb={4} fontStyle="italic">
                "{testimonial.text}"
              </Text>
              <HStack justify="center" spacing={3}>
                <Avatar name={testimonial.author} size="sm" />
                <Text fontWeight="bold" color={authorColor}>{testimonial.author}</Text>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Testimonials;