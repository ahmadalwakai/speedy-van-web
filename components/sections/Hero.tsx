import React from 'react';
import { Box, Heading, Text, Button, Image, VStack } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import NextLink from 'next/link';
import { BookNowIcon } from '@/components/Icons';

interface HeroProps {
  currentLocale: string;
}

const Hero: React.FC<HeroProps> = ({ currentLocale }) => {
  const { t } = useTranslation(['home']);

  return (
    <Box
      as="section"
      bg="hero.bg"
      color="hero.text"
      py={{ base: 16, md: 24 }}
      px={{ base: 4, md: 8 }}
      textAlign="center"
      position="relative"
      overflow="hidden"
      minH="80vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing={6} maxW="2xl" mx="auto" zIndex={1}>
        <Image
          src="/images/hero-image.png"
          alt={t('home:heroImageAlt', { defaultValue: 'Delivery Van' })}
          width={{ base: 300, md: 400 }}
          height={{ base: 225, md: 300 }}
          objectFit="cover"
          mb={4}
          fallbackSrc="https://picsum.photos/400/300?text=Hero"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            console.error('Failed to load hero-image.png');
            target.src = '/images/fallback-hero.png';
          }}
        />
        <Heading
          as="h1"
          size={{ base: '2xl', md: '3xl' }}
          fontWeight="extrabold"
          lineHeight="shorter"
        >
          {t('home:heroTitle', { defaultValue: 'Fast & Reliable Delivery with Speedy Van' })}
        </Heading>
        <Text fontSize={{ base: 'lg', md: 'xl' }} maxW="lg">
          {t('home:heroSubtitle', { defaultValue: 'Book your delivery today and experience seamless transport across the UK.' })}
        </Text>
        <Button
          as={NextLink}
          href="/book-order"
          colorScheme="primary"
          size="lg"
          leftIcon={<BookNowIcon />}
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
          transition="all 0.2s"
        >
          {t('home:bookNow', { defaultValue: 'Book Now' })}
        </Button>
        <Text fontSize="sm" color="gray.400">
          Current Locale: {currentLocale}
        </Text>
      </VStack>
    </Box>
  );
};

export default Hero;