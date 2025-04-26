import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';

interface PricingPlan {
  title: string;
  price: string;
  features: string[];
  buttonText: string;
  buttonAction: () => void;
}

const Pricing: React.FC = () => {
  const { t } = useTranslation('home');
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardShadow = useColorModeValue('md', 'dark-lg');

  const plans: PricingPlan[] = [
    {
      title: t('pricing.basic.title'),
      price: t('pricing.basic.price'),
      features: t('pricing.basic.features', { returnObjects: true }) as string[],
      buttonText: t('pricing.basic.buttonText'),
      buttonAction: () => alert(t('pricing.basic.buttonAction')),
    },
    {
      title: t('pricing.premium.title'),
      price: t('pricing.premium.price'),
      features: t('pricing.premium.features', { returnObjects: true }) as string[],
      buttonText: t('pricing.premium.buttonText'),
      buttonAction: () => alert(t('pricing.premium.buttonAction')),
    },
    {
      title: t('pricing.enterprise.title'),
      price: t('pricing.enterprise.price'),
      features: t('pricing.enterprise.features', { returnObjects: true }) as string[],
      buttonText: t('pricing.enterprise.buttonText'),
      buttonAction: () => alert(t('pricing.enterprise.buttonAction')),
    },
  ];

  return (
    <Box as="section" py={16} bg={bgColor} id="pricing">
      <Container maxW="7xl">
        <VStack spacing={4} textAlign="center" mb={12}>
          <Heading as="h2" size="xl" color={textColor}>
            {t('pricing.title')}
          </Heading>
          <Text fontSize="lg" color={textColor}>
            {t('pricing.description')}
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {plans.map((plan, index) => (
            <Box
              key={index}
              bg={cardBg}
              p={8}
              rounded="lg"
              shadow={cardShadow}
              transition="all 0.3s ease"
              _hover={{
                transform: 'translateY(-8px)',
                shadow: 'xl',
              }}
            >
              <VStack spacing={4}>
                <Heading as="h3" size="md" color={textColor}>
                  {plan.title}
                </Heading>
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                  {plan.price}
                </Text>
                <VStack spacing={2} align="start" w="full">
                  {Array.isArray(plan.features) && plan.features.length > 0 ? (
                    plan.features.map((feature, idx) => (
                      <Text key={idx} color={textColor}>
                        • {feature}
                      </Text>
                    ))
                  ) : (
                    <Text color={textColor}>No features available</Text>
                  )}
                </VStack>
                <Button
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  onClick={plan.buttonAction}
                >
                  {plan.buttonText}
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Pricing;
