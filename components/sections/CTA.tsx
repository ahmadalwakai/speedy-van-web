import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import NextLink from 'next/link';

const CTA: React.FC = () => {
  const { t } = useTranslation(['home']);

  return (
    <Box textAlign="center" py={12}>
      <Heading size="lg" mb={4}>
        {t('home:ctaTitle', { defaultValue: 'Ready to move with Speedy Van?' })}
      </Heading>
      <Text mb={6}>
        {t('home:ctaSubtitle', { defaultValue: 'Book your delivery now and enjoy premium service!' })}
      </Text>
      <NextLink href="/book-order" passHref legacyBehavior>
        <Button as="a" colorScheme="primary" size="lg">
          {t('common:bookNow', { defaultValue: 'Book Now' })}
        </Button>
      </NextLink>
    </Box>
  );
};

export default CTA;
