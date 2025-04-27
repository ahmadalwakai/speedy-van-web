import React from 'react';
import { Box, Heading, Text, useColorModeValue, Container, SimpleGrid, Tag, chakra } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';

// Dynamically import MapboxMap with fallback loader
const MapboxMap = dynamic(() => import('@/components/MapboxMap'), {
  ssr: false,
  loading: () => (
    <Box 
      borderRadius="lg" 
      overflow="hidden" 
      mb={8} 
      shadow="md" 
      height="400px" 
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Text>Loading map...</Text>
    </Box>
  )
});

const Coverage: React.FC = () => {
  const { t } = useTranslation('home');
  const shouldReduceMotion = useReducedMotion();

  const variants: Variants = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const cities = ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Bristol', 'Sheffield', 'Glasgow', 'Edinburgh', 'Cardiff'];

  const ukCities = [
    { name: 'London', coordinates: [-0.1276, 51.5072] as [number, number] },
    { name: 'Manchester', coordinates: [-2.2426, 53.4808] as [number, number] },
    { name: 'Birmingham', coordinates: [-1.8904, 52.4862] as [number, number] },
    { name: 'Liverpool', coordinates: [-2.9916, 53.4084] as [number, number] },
    { name: 'Leeds', coordinates: [-1.5491, 53.8008] as [number, number] },
    { name: 'Bristol', coordinates: [-2.5879, 51.4545] as [number, number] },
    { name: 'Sheffield', coordinates: [-1.4701, 53.3811] as [number, number] },
    { name: 'Glasgow', coordinates: [-4.2518, 55.8642] as [number, number] },
    { name: 'Edinburgh', coordinates: [-3.1883, 55.9533] as [number, number] },
    { name: 'Cardiff', coordinates: [-3.1791, 51.4816] as [number, number] }
  ];

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
      <Container maxW="6xl">
        <Heading as="h2" size="lg" mb={4} color={headingColor} textAlign="center">
          {t('coverageTitle', { defaultValue: 'Our Coverage' })}
        </Heading>
        <Text fontSize="lg" color={textColor} maxW="2xl" mx="auto" mb={8} textAlign="center">
          <chakra.span
            dangerouslySetInnerHTML={{
              __html: t('coverageDesc', {
                defaultValue: 'We deliver across the UK, from cities to rural areas. Learn more about our <a href="/coverage">UK coverage areas</a>.',
              }),
            }}
          />
        </Text>

        <Box
          borderRadius="lg"
          overflow="hidden"
          mb={8}
          shadow="md"
          height="400px"
          width="100%"
        >
          <MapboxMap 
            pickupCoords={ukCities[0].coordinates}
            dropoffCoords={ukCities[1].coordinates}
          />
        </Box>

        <Heading as="h3" size="md" mb={4} color={headingColor} textAlign="center">
          {t('citiesWeCover', { defaultValue: 'Cities We Cover' })}
        </Heading>
        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} maxW="4xl" mx="auto">
          {cities.map((city, index) => (
            <Tag key={index} size="lg" variant="solid" colorScheme="blue">
              {city}
            </Tag>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Coverage;
